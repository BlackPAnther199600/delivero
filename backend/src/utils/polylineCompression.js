// Polyline Compression Utilities
// Usa l'algoritmo Douglas-Peucker per ridurre punti di tracking inutili
// Riduce lo storage e il bandwidth per trasferire polylines

// Douglas-Peucker algorithm per simplificare polylines
function douglasPeucker(points, epsilon = 0.00005) {
    if (points.length <= 2) return points;

    // Calcola massima distanza da un punto alla linea fra primo e ultimo
    let maxDist = 0;
    let maxIdx = 0;

    for (let i = 1; i < points.length - 1; i++) {
        const dist = perpendicularDistance(points[i], points[0], points[points.length - 1]);
        if (dist > maxDist) {
            maxDist = dist;
            maxIdx = i;
        }
    }

    // Se distanza > epsilon, ricorsa su entrambi i segmenti
    if (maxDist > epsilon) {
        const rec1 = douglasPeucker(points.slice(0, maxIdx + 1), epsilon);
        const rec2 = douglasPeucker(points.slice(maxIdx), epsilon);
        return rec1.slice(0, -1).concat(rec2);
    }

    return [points[0], points[points.length - 1]];
}

// Calcola distanza perpendicolare da un punto a una linea
function perpendicularDistance(point, lineStart, lineEnd) {
    const dx = lineEnd.latitude - lineStart.latitude;
    const dy = lineEnd.longitude - lineStart.longitude;
    const mag = Math.sqrt(dx * dx + dy * dy);

    if (mag === 0) {
        dx = point.latitude - lineStart.latitude;
        dy = point.longitude - lineStart.longitude;
        return Math.sqrt(dx * dx + dy * dy);
    }

    const u = ((point.latitude - lineStart.latitude) * dx + (point.longitude - lineStart.longitude) * dy) / (mag * mag);
    let ix, iy;

    if (u < 0) {
        ix = lineStart.latitude;
        iy = lineStart.longitude;
    } else if (u > 1) {
        ix = lineEnd.latitude;
        iy = lineEnd.longitude;
    } else {
        ix = lineStart.latitude + u * dx;
        iy = lineStart.longitude + u * dy;
    }

    const dx2 = point.latitude - ix;
    const dy2 = point.longitude - iy;
    return Math.sqrt(dx2 * dx2 + dy2 * dy2);
}

// Compress array of tracking points
export function compressTrackingPoints(points, epsilon = 0.00005) {
    if (!Array.isArray(points) || points.length === 0) return [];

    const normalized = points.map(p => ({
        latitude: parseFloat(p.latitude),
        longitude: parseFloat(p.longitude),
        recorded_at: p.recorded_at
    }));

    const simplified = douglasPeucker(normalized, epsilon);

    // Mantieni i timestamp dei punti originali, associandoli ai punti semplificati
    return simplified;
}

// Calcola lunghezza totale della polyline in km
export function getPolylineLength(points) {
    if (!Array.isArray(points) || points.length < 2) return 0;

    let totalDist = 0;
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        totalDist += haversineDistance(p1.latitude, p1.longitude, p2.latitude, p2.longitude);
    }

    return totalDist / 1000; // to km
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate metrics
export function getTrackingMetrics(points) {
    if (!Array.isArray(points) || points.length === 0) {
        return { points: 0, distance_km: 0, compressed_points: 0, compression_ratio: 0 };
    }

    const compressed = compressTrackingPoints(points);
    const distance_km = getPolylineLength(points);
    const ratio = points.length > 0 ? Math.round((compressed.length / points.length) * 100) : 0;

    return {
        points: points.length,
        distance_km: parseFloat(distance_km.toFixed(2)),
        compressed_points: compressed.length,
        compression_ratio: ratio, // %
    };
}

export default { compressTrackingPoints, getPolylineLength, getTrackingMetrics };
