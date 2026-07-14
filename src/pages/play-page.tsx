import React from "react";
import usePlayPageState from "./play/hooks/usePlayPageState";
import PlayerHand from "./play/components/PlayerHand";
import GameBoard from "./play/components/GameBoard";
import ActionControls from "./play/components/ActionControls";
import DestinationTicketsPanel from "./play/components/DestinationTicketsPanel";
import PlayerPublicStatus from "./play/components/PlayerPublicStatus";
import TurnNotificationsPanel from "./play/components/TurnNotificationsPanel";
import PlayerPrivateDetails from "./play/components/PlayerPrivateDetails";

export default function PlayPage(): React.JSX.Element {
  const state = usePlayPageState();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <PlayerHand
        gameState={state.gameState}
        currentPlayerDisplayName={state.currentPlayer.displayName}
        destinationDrawLegality={state.destinationDrawLegality}
        canDrawDeckIsLegal={state.canDrawDeckIsLegal}
        uiError={state.uiError}
        onDrawDestinationTickets={state.onDrawDestinationTickets}
        onDrawFromDeck={state.onDrawFromDeck}
        onDrawFromFaceUp={state.onDrawFromFaceUp}
        lastDiscardedCardType={state.lastDiscardedCardType}
        discardAnimationCards={state.discardAnimationCards}
      />

      <GameBoard
        gameState={state.gameState}
        cityLocationPins={state.cityLocationPins}
        highlightedCityIdSet={state.highlightedCityIdSet}
        hoveredRouteId={state.hoveredRouteId}
        setHoveredRouteId={state.setHoveredRouteId}
        selectedRouteId={state.selectedRouteId}
        defaultClaimLegalityByRoute={state.defaultClaimLegalityByRoute}
        selectedTrainTypeHighlightByRoute={
          state.selectedTrainTypeHighlightByRoute
        }
        onSelectRoute={state.selectRoute}
        currentPlayerDestinationTickets={state.currentPlayerDestinationTickets}
        selectedDestinationTicketIds={state.selectedDestinationTicketIds}
        setSelectedDestinationTicketIds={state.setSelectedDestinationTicketIds}
        setHoveredDestinationTicketId={state.setHoveredDestinationTicketId}
        currentPlayerDestinationProgressById={
          state.currentPlayerDestinationProgressById
        }
        currentHandCounts={state.currentHandCounts}
        selectedTrainType={state.selectedTrainType}
        setSelectedTrainType={state.setSelectedTrainType}
      />

      <ActionControls
        selectedRoute={state.selectedRoute}
        claimSpend={state.claimSpend}
        claimLegality={state.claimLegality}
        onUpdateClaimSpend={state.updateClaimSpend}
        onResetClaimSpend={state.resetClaimSpend}
        onClaimSelectedRoute={state.handleClaimSelectedRoute}
      />

      <DestinationTicketsPanel
        destinationTicketDeckCount={state.destinationTicketDeckCount}
        destinationTicketTotalCount={state.destinationTicketTotalCount}
        destinationTicketDiscardCount={state.destinationTicketDiscardCount}
        destinationPreviewNetDelta={state.destinationPreviewNetDelta}
        isDestinationScoreApplied={state.gameState.isDestinationScoreApplied}
        onApplyDestinationScores={state.onApplyDestinationScores}
        pendingDestinationTickets={state.pendingDestinationTickets}
        selectedPendingDestinationTicketIds={
          state.selectedPendingDestinationTicketIds
        }
        setSelectedPendingDestinationTicketIds={
          state.setSelectedPendingDestinationTicketIds
        }
        setHoveredDestinationTicketId={state.setHoveredDestinationTicketId}
        getPendingTicketStatus={state.getPendingTicketStatus}
        onConfirmKeptTickets={state.onConfirmKeptTickets}
        destinationSelectionLegality={state.destinationSelectionLegality}
      />

      <PlayerPublicStatus gameState={state.gameState} />

      <TurnNotificationsPanel notifications={state.gameState.notifications} />

      <PlayerPrivateDetails
        trainsLeft={state.currentPlayer.trainsLeft}
        handSize={state.currentPlayer.handCardIds.length}
        segmentScore={state.currentPlayer.score}
        fulfilledPoints={
          state.currentPlayerDestinationScoreBreakdown.fulfilledPoints
        }
        unfulfilledPoints={
          state.currentPlayerDestinationScoreBreakdown.unfulfilledPoints
        }
        netScoreExcludingLongestRoute={
          state.currentPlayerNetScoreExcludingLongestRoute
        }
        claimedRouteIds={state.currentPlayer.claimedRouteIds}
      />
    </main>
  );
}
