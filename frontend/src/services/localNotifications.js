// Local/WebSocket Notification Fallback Service
// Mostra notifiche locali quando WebSocket riceve tracking updates
// Fallback per browser web che non hanno FCM configurato

function requestNotificationPermission() {
    if (!('Notification' in window)) {
        console.log('Browser non supporta Notifications API');
        return;
    }

    if (Notification.permission === 'granted') {
        return;
    }

    if (Notification.permission !== 'denied') {
        Notification.requestPermission().catch(e => console.warn('Permission error:', e));
    }
}

export function showLocalNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        console.log('[LocalNotif] Notifications disabled or not available');
        return;
    }

    try {
        new Notification(title, {
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            ...options
        });
    } catch (e) {
        console.error('Notification error:', e);
    }
}

export function initLocalNotifications(socket) {
    requestNotificationPermission();

    if (!socket) return;

    // Listen for tracking updates and show banner/toast (handled by UI)
    socket.on('trackingUpdate', (data) => {
        console.log('[LocalNotif] Rider update:', data);
        // UI shows banner automatically; we could add sound here
    });

    // Listen for proximity alert and show desktop notification
    socket.on('riderNearby', (data) => {
        console.log('[LocalNotif] Rider nearby!', data);
        showLocalNotification('🏍️ Il tuo rider è vicino!', {
            body: data.eta_minutes ? `ETA: ${data.eta_minutes} minuti` : 'A meno di 500 metri',
            tag: `order-${data.orderId}`,
            requireInteraction: true,
            actions: [
                { action: 'dismiss', title: 'Chiudi' }
            ]
        });
    });

    socket.on('orderStatusUpdate', (data) => {
        showLocalNotification(`Ordine #${data.orderId}`, {
            body: `Stato: ${data.status}`,
            tag: `order-status-${data.orderId}`
        });
    });
}

export default { requestNotificationPermission, showLocalNotification, initLocalNotifications };
