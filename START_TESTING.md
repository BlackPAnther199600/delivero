# 🎯 DELIVERO - START TESTING NOW!

## ⚡ 3-Step Quick Start

### Step 1️⃣: Start Docker (Backend + Database + Frontend)
```bash
cd c:\Users\luca0\Desktop\delivero
docker-compose up -d
docker-compose ps  # Verify all running
```

**Expected Output:**
```
NAME                IMAGE                STATUS          PORTS
delivero-backend    delivero-backend     Up 22 seconds   0.0.0.0:5000
delivero-db         postgres:15-alpine   Up 22 seconds   0.0.0.0:5432
delivero-frontend   delivero-frontend    Up 21 seconds   0.0.0.0:3000
```

---

### Step 2️⃣: Open Web App
```
🌐 http://localhost:3000
```

**Login with ANY of these (already created):**
```
👤 CUSTOMER:  customer@example.com / password123
👤 RIDER:     rider@example.com / password123
👤 MANAGER:   manager@example.com / password123
```

---

### Step 3️⃣: Test Mobile App (Pick ONE)

#### 🌐 **OPTION A: Web Preview (RECOMMENDED - Easiest)**
```bash
cd c:\Users\luca0\Desktop\delivero\mobile
npm run web
# Opens http://localhost:19006 automatically
```
Then login with same credentials above.

#### 📱 **OPTION B: Expo QR Code Scanner**
```bash
npm start
# Shows QR code - scan with Expo Go app (iOS/Android)
```

#### 🤖 **OPTION C: Android Emulator** (if configured)
```bash
npm run android
```

#### 🍎 **OPTION D: iOS Simulator** (macOS only)
```bash
npm run ios
```

---

## 🎭 Test All 3 Roles (5-10 mins each)

### 1️⃣ CUSTOMER (5 min)
**Goal:** Create an order and track it

1. Login to http://localhost:3000 as `customer@example.com`
2. See dashboard with 6 categories (🍔 Cibo, 💊 Farmacia, etc.)
3. Click one category (e.g., Cibo)
4. Fill form:
   - Description: "2 Margherita"
   - Address: "Via Roma 123"
   - Price: "29.99"
5. Click "🚀 Crea Ordine"
6. Go to "📋 Ordini" tab
7. See order with status "⏳ In Attesa" (Pending)
8. Logout

✅ **Success if:** Order appears in list with pending status

---

### 2️⃣ RIDER (5 min)
**Goal:** Accept order and complete delivery

1. Login as `rider@example.com`
2. See "Ordini Disponibili" tab with orders + distance
3. Find the order you created as customer
4. Click "✅ Accetta" button
5. System confirms "Ordine accettato! 🎉"
6. Go to "🚗 Consegne" tab
7. See your accepted order
8. Click "✅ Completa" button
9. Confirm "Completa Consegna?"
10. Watch stats update (+1 completed, earnings updated)
11. Logout

✅ **Success if:** Order moves from Available → Active → Completed

---

### 3️⃣ MANAGER (3 min)
**Goal:** Monitor orders and analytics

1. Login as `manager@example.com`
2. See dashboard with 4 stat cards:
   - 📊 Total Orders
   - ⏳ Pending
   - 🚗 Active Deliveries
   - 💰 Revenue
3. Scroll down to see order list
4. Use filters (All, Pending, Active, Done)
5. Verify numbers match rider's actions
6. Logout

✅ **Success if:** Stats reflect actual orders

---

## 📱 Mobile App Testing (Optional - 10 min)

### Web Preview Method (Easiest):
```bash
cd c:\Users\luca0\Desktop\delivero\mobile
npm run web
```

Then:
1. See Login screen
2. Try register new customer (email, password, select role)
3. Login
4. See mobile dashboard with tabs
5. Customer: Grid of 6 categories
6. Rider: List of orders by distance
7. Create order, see real-time updates
8. Test filtering, logout

✅ **Success if:** All screens load and navigate smoothly

---

## 📊 Expected Results Summary

| Role | Action | Expected Result |
|------|--------|-----------------|
| Customer | Create Order | Order appears in "Ordini" tab with "⏳ In Attesa" status |
| Rider | Accept Order | Order moves to "🚗 Consegne" tab |
| Rider | Complete | Order shows "✅ Completato", earnings update |
| Manager | View Dashboard | Stats show 1 completed order, revenue updated |
| Mobile | Web Preview | All screens render, tabs switch smoothly |

---

## 🔍 Troubleshooting During Test

### Issue: Can't login
```
❌ "Email/password invalid"
Solution: 
- Make sure you spelled it exactly: customer@example.com (not capitalized)
- Password is exactly: password123
- Refresh page (F5) and try again
```

### Issue: Backend not responding
```
❌ "Cannot reach server"
Solution:
docker-compose logs backend    # Check errors
docker-compose restart backend
```

### Issue: Database error
```
❌ "Connection refused"
Solution:
docker-compose restart postgres
Wait 5 seconds then refresh browser
```

### Issue: Mobile npm not found
```
❌ "npm: command not found"
Solution:
Set-Alias npm "C:\Program Files\nodejs\npm.cmd"
npm run web
```

---

## ✅ Full Checklist

- [ ] Docker running (all 3 containers)
- [ ] Can access http://localhost:3000
- [ ] Customer login works
- [ ] Customer creates order successfully
- [ ] Rider login works
- [ ] Rider sees customer's order
- [ ] Rider accepts & completes order
- [ ] Manager login works
- [ ] Manager sees updated statistics
- [ ] Mobile web preview starts (npm run web)
- [ ] Mobile screens render without errors
- [ ] All 3 roles work end-to-end

---

## 📸 Screenshots to Take

1. Login page (3 times with different credentials)
2. Customer dashboard showing 6 categories
3. Create order form (filled)
4. Order confirmation message
5. Rider available orders list
6. Order accepted confirmation
7. Rider active deliveries
8. Complete delivery dialog
9. Manager analytics dashboard
10. Mobile screens (LoginScreen, CustomerHome, RiderHome)

---

## 🚀 You're Ready!

**Current Status:**
```
✅ Backend     - Running on port 5000
✅ Frontend    - Running on port 3000
✅ Database    - PostgreSQL 15 on 5432
✅ Test Users  - 3 demo accounts created
✅ Mobile App  - 639 packages installed
```

**Start Testing:**
1. Open http://localhost:3000
2. Login with `customer@example.com` / `password123`
3. Create an order
4. Logout and login as rider
5. Accept the order
6. Complete delivery
7. Check manager dashboard

**Expected Time:** 15-30 minutes total

---

## 📚 Detailed Docs

- See **TEST_SCRIPT.md** for full test scenarios
- See **README_FINAL.md** for architecture details
- See **backend/create-test-users.js** to understand test data

---

**🎉 LET'S GO! The system is ready. Start testing now!**

Questions? Check:
1. Docker logs: `docker-compose logs -f`
2. Browser console: F12
3. Backend logs: `docker-compose logs backend`

