# Test script per il sistema di tracking
$BASE_URL = "https://delivero-gyjx.onrender.com/api"
$RIDER_EMAIL = "rider_test_126357445@test.com"
$RIDER_PASSWORD = "TestPass123!"
$CUSTOMER_EMAIL = "customer_test_1124975457@test.com"
$CUSTOMER_PASSWORD = "TestPass123!"

function Log-Info {
    param([string]$message)
    Write-Host "INFO: $message" -ForegroundColor Cyan
}

function Log-Success {
    param([string]$message)
    Write-Host "SUCCESS: $message" -ForegroundColor Green
}

function Log-Error {
    param([string]$message)
    Write-Host "ERROR: $message" -ForegroundColor Red
}

# 1. Login come Rider
Log-Info "Step 1: Login come Rider..."
try {
    $loginResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $RIDER_EMAIL
            password = $RIDER_PASSWORD
        } | ConvertTo-Json) `
        -UseBasicParsing
    
    $riderData = $loginResponse.Content | ConvertFrom-Json
    $riderToken = $riderData.token
    $riderId = $riderData.user.id
    Log-Success "Rider login: ID=$riderId"
} catch {
    Log-Error "Rider login fallito: $_"
    exit 1
}

# 2. Login come Customer
Log-Info "Step 2: Login come Customer..."
try {
    $loginResponse = Invoke-WebRequest -Uri "$BASE_URL/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body (@{
            email = $CUSTOMER_EMAIL
            password = $CUSTOMER_PASSWORD
        } | ConvertTo-Json) `
        -UseBasicParsing
    
    $customerData = $loginResponse.Content | ConvertFrom-Json
    $customerToken = $customerData.token
    $customerId = $customerData.user.id
    Log-Success "Customer login: ID=$customerId"
} catch {
    Log-Error "Customer login fallito: $_"
    exit 1
}

# 3. Get available orders per rider
Log-Info "Step 3: Get available orders..."
try {
    $headers = @{"Authorization" = "Bearer $riderToken"}
    $ordersResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/available" `
        -Headers $headers `
        -UseBasicParsing
    
    $orders = $ordersResponse.Content | ConvertFrom-Json
    Log-Success "Orders trovati: $($orders.Count)"
    
    if ($orders.Count -gt 0) {
        $testOrder = $orders[0]
        $orderId = $testOrder.id
        Log-Success "Test Order ID: $orderId"
    } else {
        Log-Error "Nessun ordine disponibile!"
        exit 1
    }
} catch {
    Log-Error "Get orders fallito: $_"
    exit 1
}

# 4. Rider accept order
Log-Info "Step 4: Rider accetta ordine #$orderId..."
try {
    $headers = @{"Authorization" = "Bearer $riderToken"}
    $acceptResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/$orderId/accept" `
        -Method PUT `
        -Headers $headers `
        -ContentType "application/json" `
        -Body '{}' `
        -UseBasicParsing
    
    $acceptData = $acceptResponse.Content | ConvertFrom-Json
    Log-Success "Ordine accettato: status=$($acceptData.order.status)"
} catch {
    Log-Error "Accept order fallito: $_"
    exit 1
}

# 5. Rider sends location update
Log-Info "Step 5: Rider invia posizione in tempo reale..."
try {
    $headers = @{"Authorization" = "Bearer $riderToken"}
    $locationData = @{
        latitude = 40.7150
        longitude = -74.0050
        eta_minutes = 15
    } | ConvertTo-Json
    
    $locationResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/$orderId/location" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $locationData `
        -UseBasicParsing
    
    $locData = $locationResponse.Content | ConvertFrom-Json
    Log-Success "Posizione inviata: lat=$($locData.tracking.rider_latitude), lng=$($locData.tracking.rider_longitude), eta=$($locData.tracking.eta_minutes)min"
} catch {
    Log-Error "Location update fallito: $_"
    exit 1
}

# 6. Customer checks tracking
Log-Info "Step 6: Rider visualizza il tracking ordine..."
try {
    $headers = @{"Authorization" = "Bearer $riderToken"}
    $trackingResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/$orderId/track" `
        -Headers $headers `
        -UseBasicParsing
    
    $trackingData = $trackingResponse.Content | ConvertFrom-Json
    Log-Success "Tracking data ricevuto dal Rider:"
    Write-Host "   Rider Position: ($($trackingData.rider_latitude), $($trackingData.rider_longitude))"
    Write-Host "   ETA: $($trackingData.eta_minutes) minuti"
    Write-Host "   Status: $($trackingData.status)"
    Write-Host "   Consegna: $($trackingData.delivery_address)"
} catch {
    Log-Error "Tracking failed: $_"
    exit 1
}

# 7. Get all active orders (manager view)
Log-Info "Step 7: Manager visualizza tutti gli ordini attivi..."
try {
    $headers = @{"Authorization" = "Bearer $riderToken"}
    $activeResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/active/all" `
        -Headers $headers `
        -UseBasicParsing
    
    $activeOrders = $activeResponse.Content | ConvertFrom-Json
    Log-Success "Ordini attivi visualizzati: $($activeOrders.Count)"
    
    $activeOrders | ForEach-Object {
        if ($_.rider_latitude) {
            Write-Host "   Ordine #$($_.id): Rider #$($_.rider_id) @ ($($_.rider_latitude), $($_.rider_longitude)) - Status: $($_.status)"
        }
    }
} catch {
    Log-Error "Get active orders fallito: $_"
    exit 1
}

# 8. Rider sends second location update (simulating movement)
Log-Info "Step 8: Rider invia aggiornamento posizione (movimento)..."
try {
    $headers = @{"Authorization" = "Bearer $riderToken"}
    $locationData = @{
        latitude = 40.7160
        longitude = -74.0040
        eta_minutes = 10
    } | ConvertTo-Json
    
    $locationResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/$orderId/location" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $locationData `
        -UseBasicParsing
    
    $locData = $locationResponse.Content | ConvertFrom-Json
    Log-Success "Posizione aggiornata: lat=$($locData.tracking.rider_latitude), lng=$($locData.tracking.rider_longitude), eta=$($locData.tracking.eta_minutes)min"
} catch {
    Log-Error "Location update #2 failed: $_"
    exit 1
}

# 9. Customer checks updated tracking
Log-Info "Step 9: Customer visualizza tracking aggiornato..."
try {
    $headers = @{"Authorization" = "Bearer $customerToken"}
    $trackingResponse = Invoke-WebRequest -Uri "$BASE_URL/orders/$orderId/track" `
        -Headers $headers `
        -UseBasicParsing
    
    $trackingData = $trackingResponse.Content | ConvertFrom-Json
    Log-Success "Tracking aggiornato:"
    Write-Host "   Nuova Posizione: ($($trackingData.rider_latitude), $($trackingData.rider_longitude))"
    Write-Host "   Nuovo ETA: $($trackingData.eta_minutes) minuti"
} catch {
    Log-Error "Updated tracking failed: $_"
    exit 1
}

Write-Host ""
Write-Host "SUCCESSO: Tracking system test completato con successo!" -ForegroundColor Green
