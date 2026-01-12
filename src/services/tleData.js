/**
 * TLE (Two-Line Element Set) Data Service
 * Fetches live TLE data for ISS from Celestrak with fallback to cached data
 */

// Fallback TLE data (updated periodically as backup)
const FALLBACK_TLE = `ISS (ZARYA)
1 25544U 98067A   24012.50000000  .00016717  00000-0  30123-3 0  9999
2 25544  51.6400 200.0000 0003000 100.0000 260.0000 15.49500000400000`;

// Celestrak TLE API endpoint
const TLE_API_URL = 'https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=TLE';

// Alternative CORS-friendly proxy (if needed)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Cache for TLE data
let cachedTLE = FALLBACK_TLE;
let lastFetchTime = null;
let fetchError = null;

/**
 * Fetch fresh TLE data from Celestrak
 * @returns {Promise<string>} TLE data string
 */
export async function fetchTLE() {
    try {
        // Try direct fetch first
        let response = await fetch(TLE_API_URL, {
            mode: 'cors',
            cache: 'no-cache'
        });

        // If CORS fails, try with proxy
        if (!response.ok) {
            console.log('Direct TLE fetch failed, trying CORS proxy...');
            response = await fetch(CORS_PROXY + encodeURIComponent(TLE_API_URL));
        }

        if (response.ok) {
            const tleData = await response.text();
            if (tleData && tleData.includes('ISS')) {
                cachedTLE = tleData.trim();
                lastFetchTime = new Date();
                fetchError = null;
                console.log('✓ Fresh TLE data fetched successfully');
                return cachedTLE;
            }
        }
        throw new Error('Invalid TLE response');
    } catch (error) {
        console.warn('⚠ TLE fetch failed, using cached data:', error.message);
        fetchError = error;
        return cachedTLE;
    }
}

/**
 * Get current TLE data (cached or fallback)
 * @returns {string} TLE data string
 */
export function getTLE() {
    return cachedTLE;
}

/**
 * Parse TLE string into components
 * @param {string} tleString - Raw TLE string
 * @returns {object} Parsed TLE components
 */
export function parseTLE(tleString = cachedTLE) {
    const lines = tleString.trim().split('\n');
    return {
        name: lines[0]?.trim() || 'ISS (ZARYA)',
        line1: lines[1]?.trim() || '',
        line2: lines[2]?.trim() || ''
    };
}

/**
 * Get TLE status info
 * @returns {object} Status information
 */
export function getTLEStatus() {
    return {
        lastFetch: lastFetchTime,
        hasError: !!fetchError,
        error: fetchError?.message || null,
        isUsingFallback: !lastFetchTime
    };
}

// Export the current TLE for backwards compatibility
export const tle = cachedTLE;