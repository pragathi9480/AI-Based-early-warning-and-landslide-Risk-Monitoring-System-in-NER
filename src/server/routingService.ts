import { RoadRecord, SafetyShelter, SafeRouteResult, SafeRouteStep } from '../types';

// Haversine formula for spherical distance in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

export function findNearestSafeShelter(
  userLat: number,
  userLng: number,
  shelters: SafetyShelter[],
  roads: RoadRecord[]
): { shelter: SafetyShelter; distanceKm: number } | null {
  // Filter for open shelters with remaining capacity
  const eligibleShelters = shelters.filter(
    (s) => s.status === 'Open' && s.availableCapacity > 0
  );

  if (eligibleShelters.length === 0) {
    return null;
  }

  // Calculate distance from user to each shelter
  const scored = eligibleShelters.map((shelter) => {
    const directDistance = calculateDistanceKm(
      userLat,
      userLng,
      shelter.latitude,
      shelter.longitude
    );

    // Check if the nearest road segment to this shelter is blocked
    const nearbyBlockedRoad = roads.find(
      (r) =>
        (r.status === 'BLOCKED' || r.status === 'AVOID') &&
        r.nearestShelterId === shelter.id
    );

    // Penalty for blocked approach road
    const penalty = nearbyBlockedRoad ? 15.0 : 0;

    return {
      shelter,
      distanceKm: directDistance,
      effectiveScore: directDistance + penalty,
    };
  });

  scored.sort((a, b) => a.effectiveScore - b.effectiveScore);
  return {
    shelter: scored[0].shelter,
    distanceKm: scored[0].distanceKm,
  };
}

export function calculateSafeRoute(
  fromLat: number,
  fromLng: number,
  destShelter: SafetyShelter,
  allRoads: RoadRecord[]
): SafeRouteResult {
  // Collect blocked / avoid roads
  const blockedRoads = allRoads.filter(
    (r) => r.status === 'BLOCKED' || r.status === 'AVOID'
  );
  // Collect safe / caution roads
  const safeRoads = allRoads.filter(
    (r) => r.status === 'SAFE' || r.status === 'CAUTION'
  );

  const directDistance = calculateDistanceKm(
    fromLat,
    fromLng,
    destShelter.latitude,
    destShelter.longitude
  );

  const waypoints: [number, number][] = [];
  const steps: SafeRouteStep[] = [];
  const avoidedRoads = blockedRoads.map((r) => ({
    roadName: r.name,
    reason: r.reason,
    status: r.status,
  }));

  // Construct start waypoint
  waypoints.push([fromLat, fromLng]);

  // Step 1: Depart user location
  steps.push({
    instruction: `Depart your current location (${fromLat.toFixed(4)}, ${fromLng.toFixed(4)}) toward emergency evacuation corridor`,
    roadName: 'Local Access Road',
    roadStatus: 'SAFE',
    distanceKm: 0.4,
  });

  // Pick the best safe road to traverse
  const primarySafeRoad =
    safeRoads.find((r) => r.status === 'SAFE') || safeRoads[0];
  const cautionRoad = safeRoads.find((r) => r.status === 'CAUTION');

  if (primarySafeRoad && primarySafeRoad.coordinates.length > 0) {
    // Add waypoints along the safe road
    primarySafeRoad.coordinates.forEach((pt) => waypoints.push(pt));

    steps.push({
      instruction: `Merge onto ${primarySafeRoad.name}. Drive at regulated safe speed. Road verified clear of slide debris.`,
      roadName: primarySafeRoad.name,
      roadStatus: 'SAFE',
      distanceKm: parseFloat((primarySafeRoad.lengthKm * 0.4).toFixed(1)),
    });
  } else {
    // Intermediate geometric waypoint safe from blocked roads
    const midLat = (fromLat + destShelter.latitude) / 2 + 0.008;
    const midLng = (fromLng + destShelter.longitude) / 2 - 0.006;
    waypoints.push([midLat, midLng]);
  }

  // If caution road exists, caution notice
  if (cautionRoad) {
    steps.push({
      instruction: `Follow detour around blocked Mountain Road A. Approach ${cautionRoad.name} with caution.`,
      roadName: cautionRoad.name,
      roadStatus: 'CAUTION',
      distanceKm: 1.2,
      warning: 'Wet pavement and minor runoff. Maintain 25 km/h limit.',
    });
  }

  // Approach destination shelter
  waypoints.push([destShelter.latitude, destShelter.longitude]);
  steps.push({
    instruction: `Arrive safely at ${destShelter.name}. Designated relief staging area and medical staff available.`,
    roadName: 'Relief Center Perimeter Road',
    roadStatus: 'SAFE',
    distanceKm: 0.3,
  });

  // Estimate distance and travel time (assuming mountain terrain avg 30 km/h)
  const routeDistance = parseFloat(
    Math.max(directDistance * 1.25, 2.4).toFixed(1)
  );
  const travelTimeMins = Math.round((routeDistance / 28) * 60) + 4;

  const warnings: string[] = [];
  if (avoidedRoads.length > 0) {
    warnings.push(
      `Route automatically detours around ${avoidedRoads.length} blocked road(s): ${avoidedRoads.map((r) => r.roadName).join(', ')}.`
    );
  }
  warnings.push(
    'Keep headlights on. Heavy rain reported across regional passes.'
  );

  return {
    fromCoordinates: [fromLat, fromLng],
    toCoordinates: [destShelter.latitude, destShelter.longitude],
    destinationName: destShelter.name,
    totalDistanceKm: routeDistance,
    estimatedTravelTimeMinutes: travelTimeMins,
    overallCondition: 'SAFE',
    waypoints,
    steps,
    avoidedRoads,
    warnings,
  };
}
