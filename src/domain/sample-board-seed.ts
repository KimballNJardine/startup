import { BoardPinRegistry, type BoardPinSnapshot } from './board-pin-registry';
import { MapPin } from './map-pin';
import { RouteLink } from './route-link';
import { TrainRequirement } from './train-requirement';

export function createSampleBoardPinRegistry(): BoardPinRegistry {
  const registry = new BoardPinRegistry();

  const routeLinkSeattlePortland = new RouteLink({
    id: 'route-sea-por',
    cityA: 'Seattle',
    cityB: 'Portland',
    slotCount: 2,
    trainRequirement: TrainRequirement.anyColor(true),
  });

  const routeLinkDenverOmaha = new RouteLink({
    id: 'route-den-oma',
    cityA: 'Denver',
    cityB: 'Omaha',
    slotCount: 3,
    trainRequirement: TrainRequirement.fixedColor('green', true),
  });

  const routeLinkAtlantaCharleston = new RouteLink({
    id: 'route-atl-cha',
    cityA: 'Atlanta',
    cityB: 'Charleston',
    slotCount: 2,
    trainRequirement: TrainRequirement.fixedColor('black', true),
  });

  registry.addRouteLink(routeLinkSeattlePortland);
  registry.addRouteLink(routeLinkDenverOmaha);
  registry.addRouteLink(routeLinkAtlantaCharleston);

  registry.addPin(
    new MapPin({
      id: 'pin-sea-por-0',
      routeLinkId: 'route-sea-por',
      slotIndex: 0,
      xPercent: 10.75,
      yPercent: 29.2,
      angleDeg: -27,
      trainRequirement: TrainRequirement.anyColor(true),
    }),
  );

  registry.addPin(
    new MapPin({
      id: 'pin-sea-por-1',
      routeLinkId: 'route-sea-por',
      slotIndex: 1,
      xPercent: 14.6,
      yPercent: 33.1,
      angleDeg: -19,
      trainRequirement: TrainRequirement.anyColor(true),
    }),
  );

  registry.addPin(
    new MapPin({
      id: 'pin-den-oma-0',
      routeLinkId: 'route-den-oma',
      slotIndex: 0,
      xPercent: 43.2,
      yPercent: 47.8,
      angleDeg: 13,
      trainRequirement: TrainRequirement.fixedColor('green', true),
    }),
  );

  registry.addPin(
    new MapPin({
      id: 'pin-den-oma-1',
      routeLinkId: 'route-den-oma',
      slotIndex: 1,
      xPercent: 47.1,
      yPercent: 44.3,
      angleDeg: 9,
      trainRequirement: TrainRequirement.fixedColor('green', true),
    }),
  );

  registry.addPin(
    new MapPin({
      id: 'pin-den-oma-2',
      routeLinkId: 'route-den-oma',
      slotIndex: 2,
      xPercent: 51.0,
      yPercent: 41.0,
      angleDeg: 7,
      trainRequirement: TrainRequirement.fixedColor('green', true),
    }),
  );

  registry.addPin(
    new MapPin({
      id: 'pin-atl-cha-0',
      routeLinkId: 'route-atl-cha',
      slotIndex: 0,
      xPercent: 73.4,
      yPercent: 66.7,
      angleDeg: 18,
      trainRequirement: TrainRequirement.fixedColor('black', true),
    }),
  );

  registry.addPin(
    new MapPin({
      id: 'pin-atl-cha-1',
      routeLinkId: 'route-atl-cha',
      slotIndex: 1,
      xPercent: 77.0,
      yPercent: 68.6,
      angleDeg: 20,
      trainRequirement: TrainRequirement.fixedColor('black', true),
    }),
  );

  registry.connectAllRouteSlotChains();

  registry.connectNeighborPins('pin-sea-por-1', 'pin-den-oma-0');
  registry.connectNeighborPins('pin-den-oma-2', 'pin-atl-cha-0');

  return registry;
}

export function createSampleBoardPinSnapshot(): BoardPinSnapshot {
  return createSampleBoardPinRegistry().toSnapshot();
}
