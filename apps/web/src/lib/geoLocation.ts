/**
 * Geolocation utility to detect the user's location automatically
 * using browser navigator.geolocation and free reverse geocoding APIs.
 */

export interface AutoLocationResult {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  formattedAddress: string;
}

export async function detectAutoLocation(): Promise<AutoLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      return reject(new Error("Geolocation is not supported by your browser"));
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const lat = Number(latitude.toFixed(6));
        const lng = Number(longitude.toFixed(6));

        // Try reverse-geocoding via OpenStreetMap Nominatim first
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.suburb ||
              addr.county ||
              "";
            const state = addr.state || addr.region || "";
            const country = addr.country || "";
            const road = addr.road || addr.suburb || addr.neighbourhood || "";

            // Formulate human-readable location
            const parts: string[] = [];
            if (road && road !== city) parts.push(road);
            if (city) parts.push(city);
            if (state && state !== city) parts.push(state);
            if (country) parts.push(country);

            const formattedAddress =
              parts.join(", ") ||
              data.display_name?.split(",").slice(0, 3).join(",").trim() ||
              `${lat}, ${lng}`;

            return resolve({
              latitude: lat,
              longitude: lng,
              city,
              state,
              country,
              formattedAddress,
            });
          }
        } catch {
          // Fallback to secondary reverse geocoder
        }

        // Secondary fallback: BigDataCloud free client-side reverse geocoding API
        try {
          const bdcRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
          );
          if (bdcRes.ok) {
            const bdcData = await bdcRes.json();
            const city = bdcData.city || bdcData.locality || "";
            const state = bdcData.principalSubdivision || "";
            const country = bdcData.countryName || "";

            const parts: string[] = [];
            if (city) parts.push(city);
            if (state && state !== city) parts.push(state);
            if (country) parts.push(country);

            const formattedAddress = parts.join(", ") || `${lat}, ${lng}`;

            return resolve({
              latitude: lat,
              longitude: lng,
              city,
              state,
              country,
              formattedAddress,
            });
          }
        } catch {
          // Fallback if APIs fail (e.g. offline or blocked)
        }

        // Return coordinates as formatted fallback
        resolve({
          latitude: lat,
          longitude: lng,
          formattedAddress: `${lat}, ${lng}`,
        });
      },
      (error) => {
        let msg = "Could not detect location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access in your browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Location request timed out.";
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
