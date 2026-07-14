import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  applyDestinationTicketScores,
  TRAIN_COLORS,
  canClaimRoute,
  canFinalizeDestinationTicketSelection,
  canCurrentPlayerClaimRouteWithDefaultSpend,
  canDrawDestinationTicket,
  canDrawFromDeck,
  claimRoute,
  createBoardStateInspector,
  createInitialLocalGameState,
  DESTINATION_TICKETS,
  drawDestinationTicket,
  drawTrainCardFromDeck,
  drawTrainCardFromFaceUp,
  finalizeDestinationTicketSelection,
  getCityLocationPins,
  getCardTypeCount,
  getDefaultClaimSpend,
  type ClaimCardSpend,
  type DestinationTicket,
  type DestinationTicketProgressStatus,
  type LocalGameState,
  type TrainCardType,
  type TrainColor,
} from "../../../domain";
import {
  DISCARD_ANIMATION_CLEAR_BUFFER_MS,
  DISCARD_ANIMATION_DURATION_MS,
  DISCARD_ANIMATION_STAGGER_MS,
} from "../constants";
import type { DiscardAnimationCard } from "../types";
import { normalizeClaimSpend } from "../utils/claim-spend";

export interface UsePlayPageStateResult {
  gameState: LocalGameState;
  currentPlayer: LocalGameState["playersById"][keyof LocalGameState["playersById"]];
  hoveredRouteId: string | null;
  setHoveredRouteId: Dispatch<SetStateAction<string | null>>;
  selectedRouteId: string | null;
  selectedTrainType: TrainCardType | null;
  setSelectedTrainType: Dispatch<SetStateAction<TrainCardType | null>>;
  claimSpend: ClaimCardSpend | null;
  selectedRoute: LocalGameState["board"]["routesById"][string] | null;
  claimLegality: { isLegal: boolean; reason: string | null };
  uiError: string | null;
  destinationDrawLegality: { isLegal: boolean; reason: string | null };
  canDrawDeckIsLegal: boolean;
  destinationTicketDeckCount: number;
  destinationTicketTotalCount: number;
  destinationTicketDiscardCount: number;
  destinationPreviewNetDelta: number;
  destinationSelectionLegality:
    | { isLegal: boolean; reason: string | null }
    | null;
  pendingDestinationTickets: DestinationTicket[];
  selectedDestinationTicketIds: string[];
  setSelectedDestinationTicketIds: Dispatch<SetStateAction<string[]>>;
  selectedPendingDestinationTicketIds: string[];
  setSelectedPendingDestinationTicketIds: Dispatch<SetStateAction<string[]>>;
  hoveredDestinationTicketId: string | null;
  setHoveredDestinationTicketId: Dispatch<SetStateAction<string | null>>;
  currentPlayerDestinationTickets: DestinationTicket[];
  currentPlayerDestinationProgressById: Record<
    string,
    {
      status: DestinationTicketProgressStatus;
      isFulfilled: boolean;
    }
  >;
  currentPlayerDestinationScoreBreakdown: {
    fulfilledPoints: number;
    unfulfilledPoints: number;
    netDelta: number;
  };
  currentPlayerNetScoreExcludingLongestRoute: number;
  currentHandCounts: Record<TrainColor | "locomotive", number>;
  defaultClaimLegalityByRoute: Record<
    string,
    { isLegal: boolean; reason: string | null }
  >;
  selectedTrainTypeHighlightByRoute: Record<
    string,
    { matches: boolean; minLocomotivesNeeded: number }
  >;
  highlightedCityIdSet: Set<string>;
  cityLocationPins: Array<{ id: string; xPercent: number; yPercent: number }>;
  lastDiscardedCardType: TrainColor | "locomotive" | undefined;
  discardAnimationCards: DiscardAnimationCard[];
  onDrawDestinationTickets: () => void;
  onDrawFromDeck: () => void;
  onDrawFromFaceUp: (index: number) => void;
  selectRoute: (routeId: string) => void;
  updateClaimSpend: (
    updater: (spend: ClaimCardSpend) => ClaimCardSpend,
  ) => void;
  resetClaimSpend: () => void;
  handleClaimSelectedRoute: () => void;
  onApplyDestinationScores: () => void;
  onConfirmKeptTickets: () => void;
  getPendingTicketStatus: (
    ticketId: string,
  ) => DestinationTicketProgressStatus | undefined;
}

export default function usePlayPageState(): UsePlayPageStateResult {
  const [gameState, setGameState] = useState<LocalGameState>(() =>
    createInitialLocalGameState({ seed: 260 }),
  );
  const [hoveredRouteId, setHoveredRouteId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [selectedTrainType, setSelectedTrainType] =
    useState<TrainCardType | null>(null);
  const [claimSpend, setClaimSpend] = useState<ClaimCardSpend | null>(null);
  const [discardAnimationCards, setDiscardAnimationCards] = useState<
    DiscardAnimationCard[]
  >([]);
  const [uiError, setUiError] = useState<string | null>(null);
  const [hoveredDestinationTicketId, setHoveredDestinationTicketId] = useState<
    string | null
  >(null);
  const [selectedDestinationTicketIds, setSelectedDestinationTicketIds] =
    useState<string[]>([]);
  const [
    selectedPendingDestinationTicketIds,
    setSelectedPendingDestinationTicketIds,
  ] = useState<string[]>([]);
  const discardAnimationTimeoutRef = useRef<number | null>(null);

  const currentPlayer = gameState.playersById[gameState.turn.currentPlayerId];
  const pendingDestinationTicketSelection = gameState.destinationTicketSelection;
  const destinationTicketDeckCount = gameState.destinationTicketDeckIds.length;
  const destinationDrawLegality = canDrawDestinationTicket(gameState);
  const canDrawDeckIsLegal = canDrawFromDeck(gameState).isLegal;
  const pendingDestinationTickets =
    pendingDestinationTicketSelection &&
    pendingDestinationTicketSelection.playerId === gameState.turn.currentPlayerId
      ? pendingDestinationTicketSelection.pendingTicketIds
          .map((ticketId) => gameState.destinationTicketsById[ticketId])
          .filter((ticket): ticket is DestinationTicket => Boolean(ticket))
      : [];
  const destinationSelectionLegality = pendingDestinationTicketSelection
    ? canFinalizeDestinationTicketSelection(
        gameState,
        selectedPendingDestinationTicketIds,
      )
    : null;
  const currentPlayerDestinationTickets = currentPlayer.destinationTicketIds
    .map((ticketId) => gameState.destinationTicketsById[ticketId])
    .filter((ticket): ticket is DestinationTicket => Boolean(ticket));
  const boardInspector = useMemo(
    () => createBoardStateInspector(gameState),
    [gameState],
  );
  const cityLocationPins = useMemo(() => getCityLocationPins(), []);
  const currentPlayerDestinationProgressById = useMemo(() => {
    return boardInspector
      .getDestinationTicketProgressForPlayer(currentPlayer.id)
      .reduce<
        Record<
          string,
          {
            status: DestinationTicketProgressStatus;
            isFulfilled: boolean;
          }
        >
      >((acc, progress) => {
        acc[progress.ticketId] = {
          status: progress.status,
          isFulfilled: progress.isFulfilled,
        };
        return acc;
      }, {});
  }, [boardInspector, currentPlayer.id]);
  const currentPlayerDestinationScoreBreakdown = useMemo(
    () =>
      boardInspector.getDestinationTicketScoreBreakdownForPlayer(
        currentPlayer.id,
      ),
    [boardInspector, currentPlayer.id],
  );
  const currentPlayerNetScoreExcludingLongestRoute =
    gameState.isDestinationScoreApplied
      ? currentPlayer.score
      : currentPlayer.score + currentPlayerDestinationScoreBreakdown.netDelta;

  const highlightedDestinationTicketIds = useMemo(() => {
    const ids = new Set<string>(selectedDestinationTicketIds);

    selectedPendingDestinationTicketIds.forEach((ticketId) => {
      ids.add(ticketId);
    });

    if (hoveredDestinationTicketId) {
      ids.add(hoveredDestinationTicketId);
    }

    return Array.from(ids);
  }, [
    hoveredDestinationTicketId,
    selectedDestinationTicketIds,
    selectedPendingDestinationTicketIds,
  ]);
  const highlightedCityIds = useMemo(
    () =>
      boardInspector.getHighlightedCityIdsForTicketIds(
        highlightedDestinationTicketIds,
      ),
    [boardInspector, highlightedDestinationTicketIds],
  );
  const highlightedCityIdSet = useMemo(
    () => new Set(highlightedCityIds),
    [highlightedCityIds],
  );

  const lastDiscardedCardId =
    gameState.trainDiscardCardIds.length > 0
      ? gameState.trainDiscardCardIds[gameState.trainDiscardCardIds.length - 1]
      : null;
  const lastDiscardedCardType = lastDiscardedCardId
    ? gameState.trainCardsById[lastDiscardedCardId]?.type
    : undefined;

  const currentHandCounts = useMemo(
    () => getCardTypeCount(currentPlayer.handCardIds, gameState.trainCardsById),
    [currentPlayer.handCardIds, gameState.trainCardsById],
  );

  const defaultClaimLegalityByRoute = useMemo(() => {
    return gameState.board.routeIds.reduce<
      Record<string, { isLegal: boolean; reason: string | null }>
    >((acc, routeId) => {
      acc[routeId] = canCurrentPlayerClaimRouteWithDefaultSpend(
        gameState,
        routeId,
      );
      return acc;
    }, {});
  }, [gameState]);

  const selectedTrainTypeHighlightByRoute = useMemo(() => {
    const highlightByRouteId: Record<
      string,
      { matches: boolean; minLocomotivesNeeded: number }
    > = {};

    if (!selectedTrainType) {
      return highlightByRouteId;
    }

    const selectedTypeCount = currentHandCounts[selectedTrainType] ?? 0;
    const locomotiveCount = currentHandCounts.locomotive ?? 0;

    gameState.board.routeIds.forEach((routeId) => {
      const route = gameState.board.routesById[routeId];

      if (route.claim.claimedByPlayerId !== null) {
        highlightByRouteId[routeId] = {
          matches: false,
          minLocomotivesNeeded: 0,
        };
        return;
      }

      if (selectedTrainType === "locomotive") {
        highlightByRouteId[routeId] = {
          matches: locomotiveCount >= route.slotCount,
          minLocomotivesNeeded: 0,
        };
        return;
      }

      const routeAllowsSelectedColor =
        route.trainRequirementMode === "any-color" ||
        route.fixedColor === selectedTrainType;

      if (!routeAllowsSelectedColor || selectedTypeCount <= 0) {
        highlightByRouteId[routeId] = {
          matches: false,
          minLocomotivesNeeded: 0,
        };
        return;
      }

      const selectedCardsUsable = Math.min(selectedTypeCount, route.slotCount);
      const minLocomotivesNeeded = Math.max(
        0,
        route.slotCount - selectedCardsUsable,
      );
      const hasEnoughLocomotives = minLocomotivesNeeded <= locomotiveCount;

      highlightByRouteId[routeId] = {
        matches: hasEnoughLocomotives,
        minLocomotivesNeeded: hasEnoughLocomotives ? minLocomotivesNeeded : 0,
      };
    });

    return highlightByRouteId;
  }, [
    currentHandCounts,
    gameState.board.routeIds,
    gameState.board.routesById,
    selectedTrainType,
  ]);

  const selectedRoute = selectedRouteId
    ? gameState.board.routesById[selectedRouteId]
    : null;

  const claimLegality = useMemo(() => {
    if (!selectedRoute || !claimSpend) {
      return { isLegal: false, reason: "Select a route to claim." };
    }

    return canClaimRoute(
      gameState,
      selectedRoute.id,
      claimSpend,
      gameState.turn.currentPlayerId,
    );
  }, [claimSpend, gameState, selectedRoute]);

  useEffect(() => {
    if (!selectedRouteId) {
      setClaimSpend(null);
      return;
    }

    const route = gameState.board.routesById[selectedRouteId];
    if (!route || route.claim.claimedByPlayerId !== null) {
      setSelectedRouteId(null);
      setClaimSpend(null);
      return;
    }

    setClaimSpend((previous) => {
      if (!previous) {
        return getDefaultClaimSpend(gameState, selectedRouteId);
      }

      return normalizeClaimSpend(route.slotCount, previous, route.fixedColor);
    });
  }, [gameState, selectedRouteId]);

  const applyTransition = (
    transition: (state: LocalGameState) => LocalGameState,
  ): void => {
    setUiError(null);

    try {
      setGameState((previous) => transition(previous));
    } catch (error) {
      setUiError(
        error instanceof Error
          ? error.message
          : "Unknown game transition failure.",
      );
    }
  };

  const selectRoute = (routeId: string): void => {
    const route = gameState.board.routesById[routeId];
    if (!route || route.claim.claimedByPlayerId !== null) {
      return;
    }

    setSelectedRouteId(routeId);
    setClaimSpend(getDefaultClaimSpend(gameState, routeId));
    setUiError(null);
  };

  const updateClaimSpend = (
    updater: (spend: ClaimCardSpend) => ClaimCardSpend,
  ): void => {
    if (!selectedRoute || !claimSpend) {
      return;
    }

    const nextSpend = updater(claimSpend);
    setClaimSpend(
      normalizeClaimSpend(
        selectedRoute.slotCount,
        nextSpend,
        selectedRoute.fixedColor,
      ),
    );
  };

  const queueDiscardAnimationFromSpend = (spend: ClaimCardSpend): void => {
    if (typeof window !== "undefined") {
      const reduceMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      if (reduceMotionQuery.matches) {
        return;
      }
    }

    const spentTypes: TrainCardType[] = [];

    if (spend.color && spend.colorCards > 0) {
      spentTypes.push(...Array(spend.colorCards).fill(spend.color));
    }

    if (spend.locomotiveCards > 0) {
      spentTypes.push(...Array(spend.locomotiveCards).fill("locomotive"));
    }

    if (spentTypes.length === 0) {
      return;
    }

    const cardTypeOrder: TrainCardType[] = [...TRAIN_COLORS, "locomotive"];
    const animatedCards = spentTypes.map((cardType, index) => {
      const typeIndex = cardTypeOrder.indexOf(cardType);
      const typeOffset = (typeIndex - (cardTypeOrder.length - 1) / 2) * 1.6;
      const laneOffset = (index % 3) * 1.2;
      const rowOffset = Math.floor(index / 3) * 0.9;

      return {
        id: `${cardType}-${Date.now()}-${index}`,
        cardType,
        delayMs: index * DISCARD_ANIMATION_STAGGER_MS,
        startXPercent: 28 + typeOffset + laneOffset,
        startYPercent: 56 + rowOffset,
        endXPercent: 86.5 + ((index % 2) * 0.9 - 0.45),
        endYPercent: 44 + ((index % 3) - 1) * 0.7,
        startRotationDeg: -16 + (index % 5) * 6,
        zIndex: 40 + index,
      } satisfies DiscardAnimationCard;
    });

    setDiscardAnimationCards(animatedCards);

    if (discardAnimationTimeoutRef.current !== null) {
      window.clearTimeout(discardAnimationTimeoutRef.current);
    }

    const animationRuntimeMs =
      (animatedCards.length - 1) * DISCARD_ANIMATION_STAGGER_MS +
      DISCARD_ANIMATION_DURATION_MS +
      DISCARD_ANIMATION_CLEAR_BUFFER_MS;

    discardAnimationTimeoutRef.current = window.setTimeout(() => {
      setDiscardAnimationCards([]);
      discardAnimationTimeoutRef.current = null;
    }, animationRuntimeMs);
  };

  const handleClaimSelectedRoute = (): void => {
    if (!selectedRoute || !claimSpend || !claimLegality.isLegal) {
      return;
    }

    const claimSpendSnapshot: ClaimCardSpend = {
      color: claimSpend.color,
      colorCards: claimSpend.colorCards,
      locomotiveCards: claimSpend.locomotiveCards,
    };

    queueDiscardAnimationFromSpend(claimSpendSnapshot);

    applyTransition((previous) => {
      const next = claimRoute(
        previous,
        selectedRoute.id,
        claimSpendSnapshot,
        previous.turn.currentPlayerId,
      );
      setSelectedRouteId(null);
      setClaimSpend(null);
      return next;
    });
  };

  useEffect(() => {
    return () => {
      if (discardAnimationTimeoutRef.current !== null) {
        window.clearTimeout(discardAnimationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!pendingDestinationTicketSelection) {
      setSelectedPendingDestinationTicketIds([]);
      return;
    }

    setSelectedPendingDestinationTicketIds([]);
  }, [pendingDestinationTicketSelection]);

  useEffect(() => {
    const currentTicketIdSet = new Set(currentPlayer.destinationTicketIds);
    setSelectedDestinationTicketIds((previous) =>
      previous.filter((ticketId) => currentTicketIdSet.has(ticketId)),
    );
  }, [currentPlayer.destinationTicketIds]);

  const onDrawDestinationTickets = (): void =>
    applyTransition((previous) => drawDestinationTicket(previous));

  const onDrawFromDeck = (): void =>
    applyTransition((previous) => drawTrainCardFromDeck(previous));

  const onDrawFromFaceUp = (index: number): void =>
    applyTransition((previous) => drawTrainCardFromFaceUp(previous, index));

  const onApplyDestinationScores = (): void =>
    applyTransition((previous) => applyDestinationTicketScores(previous));

  const onConfirmKeptTickets = (): void =>
    applyTransition((previous) =>
      finalizeDestinationTicketSelection(
        previous,
        selectedPendingDestinationTicketIds,
      ),
    );

  const getPendingTicketStatus = (
    ticketId: string,
  ): DestinationTicketProgressStatus | undefined =>
    boardInspector.getDestinationTicketProgress(
      gameState.turn.currentPlayerId,
      ticketId,
    )?.status;

  const resetClaimSpend = (): void => {
    if (selectedRoute) {
      setClaimSpend(getDefaultClaimSpend(gameState, selectedRoute.id));
    }
  };

  return {
    gameState,
    currentPlayer,
    hoveredRouteId,
    setHoveredRouteId,
    selectedRouteId,
    selectedTrainType,
    setSelectedTrainType,
    claimSpend,
    selectedRoute,
    claimLegality,
    uiError,
    destinationDrawLegality,
    canDrawDeckIsLegal,
    destinationTicketDeckCount,
    destinationTicketTotalCount: DESTINATION_TICKETS.length,
    destinationTicketDiscardCount: gameState.destinationTicketDiscardIds.length,
    destinationPreviewNetDelta: currentPlayerDestinationScoreBreakdown.netDelta,
    destinationSelectionLegality,
    pendingDestinationTickets,
    selectedDestinationTicketIds,
    setSelectedDestinationTicketIds,
    selectedPendingDestinationTicketIds,
    setSelectedPendingDestinationTicketIds,
    hoveredDestinationTicketId,
    setHoveredDestinationTicketId,
    currentPlayerDestinationTickets,
    currentPlayerDestinationProgressById,
    currentPlayerDestinationScoreBreakdown,
    currentPlayerNetScoreExcludingLongestRoute,
    currentHandCounts,
    defaultClaimLegalityByRoute,
    selectedTrainTypeHighlightByRoute,
    highlightedCityIdSet,
    cityLocationPins,
    lastDiscardedCardType,
    discardAnimationCards,
    onDrawDestinationTickets,
    onDrawFromDeck,
    onDrawFromFaceUp,
    selectRoute,
    updateClaimSpend,
    resetClaimSpend,
    handleClaimSelectedRoute,
    onApplyDestinationScores,
    onConfirmKeptTickets,
    getPendingTicketStatus,
  };
}
