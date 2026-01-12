import { getGroundTracks, getSatelliteInfo } from 'tle.js';
import { Vector3 } from 'three';
import { getTLE, fetchTLE } from './tleData.js';

// Current satellite state
let currentState = {
    latitude: 0,
    longitude: 0,
    altitude: 0,
    velocity: 0,
    vector: { x: 0, y: 0, z: 0 }
};

// Update interval ID
let updateIntervalId = null;

/**
 * Initialize the satellite tracking service
 * Fetches fresh TLE data and starts position updates
 */
export async function initSatelliteService() {
    await fetchTLE();
    await updatePosition();
    startAutoUpdate();
    console.log('✓ Satellite service initialized');
}

/**
 * Update ISS position from TLE data
 * @returns {Promise<object>} Current position data
 */
export async function updatePosition() {
    try {
        const tle = getTLE();
        const timestamp = Date.now();
        const info = getSatelliteInfo(tle, timestamp);

        currentState = {
            latitude: info.lat,
            longitude: info.lng,
            altitude: info.height,
            velocity: info.velocity,
            vector: latLongToCartesian(info.lat, info.lng, info.height / 1000)
        };

        return currentState;
    } catch (error) {
        console.error('Error updating satellite position:', error);
        return currentState;
    }
}

/**
 * Convert lat/long/altitude to 3D cartesian coordinates
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees  
 * @param {number} alt - Altitude (scaled to match Earth model)
 * @returns {object} Cartesian coordinates {x, y, z}
 */
function latLongToCartesian(lat, lon, alt) {
    const radius = 0.64 + alt; // Earth radius + altitude
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return { x, y, z };
}

/**
 * Get current position vector
 * @returns {object} Position vector {x, y, z}
 */
export function getPositionVector() {
    return currentState.vector;
}

/**
 * Get full satellite state
 * @returns {object} Current state with lat/long/alt/velocity/vector
 */
export function getSatelliteState() {
    return { ...currentState };
}

/**
 * Get formatted display data
 * @param {boolean} useMetric - Use metric units (default true)
 * @returns {object} Formatted display strings
 */
export function getDisplayData(useMetric = true) {
    const { latitude, longitude, altitude, velocity } = currentState;

    const latDir = latitude >= 0 ? 'N' : 'S';
    const lonDir = longitude >= 0 ? 'E' : 'W';

    const altValue = useMetric ? altitude : altitude * 0.621371;
    const altUnit = useMetric ? 'km' : 'mi';

    const velValue = useMetric ? velocity : velocity * 0.621371;
    const velUnit = useMetric ? 'km/h' : 'mph';

    return {
        latitude: `${Math.abs(latitude).toFixed(4)}° ${latDir}`,
        longitude: `${Math.abs(longitude).toFixed(4)}° ${lonDir}`,
        altitude: `${altValue.toFixed(1)} ${altUnit}`,
        velocity: `${velValue.toFixed(0)} ${velUnit}`,
        latRaw: latitude,
        lonRaw: longitude,
        altRaw: altitude,
        velRaw: velocity
    };
}

/**
 * Calculate orbit paths (previous, current, next orbits)
 * @returns {Promise<object>} Three orbit path arrays as Vector3 arrays
 */
export async function getOrbitPaths() {
    const tle = getTLE();

    try {
        const threeOrbitsArr = await getGroundTracks({
            tle: tle,
            stepMS: 100000,
            isLngLatFormat: true,
        });

        const alt = currentState.altitude / 1000 || 0.4; // Default altitude if not set

        const pathDetails = threeOrbitsArr.map(orbit =>
            orbit.map(([lon, lat]) => {
                const { x, y, z } = latLongToCartesian(lat, lon, alt);
                return new Vector3(x, y, z);
            })
        );

        return {
            previousOrbit: pathDetails[0] || [],
            currentOrbit: pathDetails[1] || [],
            nextOrbit: pathDetails[2] || []
        };
    } catch (error) {
        console.error('Error calculating orbit paths:', error);
        return { previousOrbit: [], currentOrbit: [], nextOrbit: [] };
    }
}

/**
 * Start automatic position updates
 * @param {number} intervalMs - Update interval in milliseconds (default 3000)
 */
export function startAutoUpdate(intervalMs = 3000) {
    stopAutoUpdate();
    updateIntervalId = setInterval(updatePosition, intervalMs);
}

/**
 * Stop automatic position updates
 */
export function stopAutoUpdate() {
    if (updateIntervalId) {
        clearInterval(updateIntervalId);
        updateIntervalId = null;
    }
}

// Legacy exports for backwards compatibility
export const getxyzComponent = () => currentState.vector;
export default initSatelliteService;