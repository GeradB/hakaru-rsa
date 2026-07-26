/**
 * Build a street line from a Nominatim addressdetails object.
 * Includes house number when present (Nominatim keeps it separate from road).
 */
export function formatNominatimStreet(address = {}) {
  const number = String(address.house_number || address.housenumber || '').trim();
  const road = String(
    address.road ||
      address.pedestrian ||
      address.residential ||
      address.street ||
      address.footway ||
      address.path ||
      '',
  ).trim();

  if (number && road) return `${number} ${road}`;
  if (road) return road;
  if (number) return number;
  return '';
}

/** Map a Nominatim search result into form-friendly address fields. */
export function mapNominatimResult(item) {
  const addr = item?.address || {};
  return {
    id: item.place_id,
    fullAddress: item.display_name || '',
    street: formatNominatimStreet(addr),
    town: addr.town || addr.city || addr.suburb || addr.village || addr.hamlet || '',
    postcode: addr.postcode || '',
  };
}
