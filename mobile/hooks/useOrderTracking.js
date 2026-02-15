import { useState, useEffect, useRef, useCallback } from 'react';
import {
    joinOrderTracking,
    leaveOrderTracking,
    onRiderLocationUpdate,
    onOrderStatusUpdate,
    onTrackingStopped,
    calculateDistance,
    calculateETA,
    disconnectTrackingSocket
} from '../services/api';

/**
 * Hook for managing order tracking with location updates and interpolation.
 * Handles WebSocket subscriptions, location smoothing, and ETA calculation.
 */
export const useOrderTracking = (orderId, enabled = true) => {
    const [trackingState, setTrackingState] = useState({
        orderId,
        status: null,
        riderLocation: null, // { latitude, longitude, timestamp }
        interpolatedLocation: null, // smoothed location for animation
        eta: null,
        trackingStopped: false,
        error: null
    });

    const [isTracking, setIsTracking] = useState(false);
    const locationInterpolationRef = useRef(null);
    const unsubscribeRef = useRef([]);

    // Cleanup function
    const cleanup = useCallback(() => {
        // Clear interpolation
        if (locationInterpolationRef.current) {
            clearInterval(locationInterpolationRef.current);
            locationInterpolationRef.current = null;
        }

        // Unsubscribe from events
        unsubscribeRef.current.forEach(unsubscribe => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        });
        unsubscribeRef.current = [];

        // Leave tracking channel
        if (isTracking) {
            leaveOrderTracking(orderId);
            setIsTracking(false);
        }
    }, [orderId, isTracking]);

    // Initialize tracking
    useEffect(() => {
        if (!enabled || !orderId) {
            cleanup();
            return;
        }

        const initTracking = async () => {
            try {
                await joinOrderTracking(orderId);
                setIsTracking(true);
                setTrackingState(prev => ({ ...prev, error: null }));
            } catch (error) {
                console.error('Failed to join tracking:', error);
                setTrackingState(prev => ({
                    ...prev,
                    error: error.message || 'Failed to connect to tracking'
                }));
            }
        };

        initTracking();

        // Subscribe to events
        const unsubLocation = onRiderLocationUpdate((data) => {
            setTrackingState(prev => ({
                ...prev,
                riderLocation: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    timestamp: data.timestamp
                },
                eta: data.eta_minutes,
                interpolatedLocation: {
                    latitude: data.latitude,
                    longitude: data.longitude
                }
            }));
        });

        const unsubStatus = onOrderStatusUpdate((data) => {
            setTrackingState(prev => ({
                ...prev,
                status: data.status
            }));
        });

        const unsubStopped = onTrackingStopped((data) => {
            console.log('Tracking stopped:', data.reason);
            setTrackingState(prev => ({
                ...prev,
                trackingStopped: true,
                riderLocation: null,
                interpolatedLocation: null
            }));
            cleanup();
        });

        unsubscribeRef.current = [unsubLocation, unsubStatus, unsubStopped];

        return cleanup;
    }, [enabled, orderId, cleanup]);

    // Linear interpolation helper
    const interpolateLocation = useCallback((from, to, progress) => {
        if (!from || !to) return from;
        return {
            latitude: from.latitude + (to.latitude - from.latitude) * progress,
            longitude: from.longitude + (to.longitude - from.longitude) * progress
        };
    }, []);

    // Smooth animation between location updates
    const animateLocationUpdate = useCallback((newLocation) => {
        if (!trackingState.interpolatedLocation || !newLocation) {
            setTrackingState(prev => ({
                ...prev,
                interpolatedLocation: newLocation
            }));
            return;
        }

        const startLocation = trackingState.interpolatedLocation;
        const endLocation = newLocation;
        let progress = 0;
        const animationDuration = 2000; // 2 seconds
        const startTime = Date.now();

        if (locationInterpolationRef.current) {
            clearInterval(locationInterpolationRef.current);
        }

        locationInterpolationRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / animationDuration, 1);

            const interpolated = interpolateLocation(startLocation, endLocation, progress);

            setTrackingState(prev => ({
                ...prev,
                interpolatedLocation: interpolated
            }));

            if (progress >= 1) {
                clearInterval(locationInterpolationRef.current);
                locationInterpolationRef.current = null;
            }
        }, 30); // ~33fps
    }, [trackingState.interpolatedLocation, interpolateLocation]);

    return {
        ...trackingState,
        isTracking,
        cleanup
    };
};

export default useOrderTracking;
