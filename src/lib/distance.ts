const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function calculateDistanceKm(
  userLat: number,
  userLng: number,
  postLat: number,
  postLng: number,
) {
  const latDelta = toRadians(postLat - userLat);
  const lngDelta = toRadians(postLng - userLng);
  const userLatRadians = toRadians(userLat);
  const postLatRadians = toRadians(postLat);

  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(userLatRadians) *
      Math.cos(postLatRadians) *
      Math.sin(lngDelta / 2) ** 2;
  const normalizedHaversine = Math.min(1, Math.max(0, haversine));

  return (
    EARTH_RADIUS_KM *
    2 *
    Math.atan2(
      Math.sqrt(normalizedHaversine),
      Math.sqrt(1 - normalizedHaversine),
    )
  );
}
