# Delivero - Project Structure

## 📁 Root Directory Structure

```
delivero/
├── 📄 README.md                 # Main project documentation
├── 📄 QUICK_START.md           # Fast setup guide
├── 📄 CONFIG.md               # Configuration details
├── 📄 DEPLOY.md               # Deployment guide
├── 📄 WEB.md                  # Frontend specific docs
├── 📄 MOBILE_BUILD.md         # Mobile build instructions
├── 📄 MOBILE_SETUP.md         # Mobile setup guide
├── 📄 CLEANUP.md              # Cleanup procedures
├── 🐳 docker-compose.yml      # Multi-container setup
├── 📦 package.json            # Root dependencies
├── 🔧 .env.example            # Environment template
├── 🚀 START_WEB_PREVIEW.bat   # Quick web start
├── 📱 app.json               # Expo mobile config
├── ⚙️ eas.json               # EAS build config
├── ☁️ render.yaml            # Render deployment config
│
├── 📂 backend/               # Node.js API server
│   ├── 📄 package.json
│   ├── 🐳 Dockerfile
│   ├── 🔧 .env.example
│   └── 📂 src/
│       ├── 📄 app.js         # Main server file
│       ├── 📂 config/        # Database config
│       ├── 📂 controllers/   # Business logic
│       ├── 📂 middleware/    # Auth, rate limiting
│       ├── 📂 models/        # Data models
│       ├── 📂 routes/        # API endpoints
│       ├── 📂 services/      # External services
│       ├── 📂 utils/         # Helper functions
│       └── 📂 tests/         # Test files
│
├── 📂 frontend/              # React web application
│   ├── 📄 package.json
│   ├── 🐳 Dockerfile
│   ├── 🌐 nginx.conf         # Production server config
│   ├── 📂 public/           # Static assets
│   └── 📂 src/
│       ├── 📄 App.jsx       # Main React component
│       ├── 📄 index.css     # Global styles
│       ├── 📂 components/   # Reusable components
│       ├── 📂 pages/        # Page components
│       ├── 📂 services/     # API calls
│       ├── 📂 hooks/        # Custom React hooks
│       └── 📂 __tests__/    # Test files
│
└── 📂 mobile/                # React Native app
    ├── 📄 package.json
    ├── 📱 App.js            # Main mobile app
    ├── 📱 app.json          # Expo config
    ├── ⚙️ eas.json          # Build config
    ├── 📂 components/       # Mobile components
    ├── 📂 screens/          # App screens
    ├── 📂 services/         # API services
    ├── 📂 hooks/            # Custom hooks
    └── 📂 context/          # React context
```

## 🗑️ Removed Files (Cleanup)

### Test & Development Files
- `test-delete-full-flow.js`
- `test-delete-user.js`
- `insert_test_orders.sql`
- `setpw.sql`
- `test-tracking.ps1`

### Backend Scripts
- `create-test-users.js`
- `init-db.js`
- `seed-products.js`
- `add-tracking-columns.sql`
- `postman/` directory
- `tmp/` directory
- `scripts/create_restaurants_tables.sql`
- `scripts/create_test_order.js`
- `scripts/create_tracking_table.js`
- `scripts/init-restaurants.js`
- `scripts/test_firebase_init.js`
- `scripts/test_push_and_batching.js`

### Mobile Build Files
- `eas-inspect/` directory
- `eas-inspect-archive/` directory

### Documentation (Obsolete)
- `README_FINAL.md`
- `COMPLETION_SUMMARY.md`
- `CONTINUAZIONE_PROSSIMA_SESSIONE.md`
- `SESSION_*.md` files
- `DEBUG_LOGIN.md`
- `INIT_STATUS.md`
- `EXECUTE_NOW.md`
- `START_TESTING.md`
- `TEST_SCRIPT.md`
- `SECURITY_*.md` files
- `APK_BUILD_STATUS.md`
- `DOCKER_STARTUP.md`
- `FIREBASE_QUICK_START.md`
- `DATABASE_INIT_GUIDE.md`
- `INTEGRATION_GUIDE.md`
- `NEW_SERVICES.md`
- `TICKETS_INTEGRATION.md`
- `TRACKING_SYSTEM_README.md`
- `DEPLOYMENT.md`
- `DOCS/` directory

### Automation Scripts
- `AUTO_START.bat`
- `BUILD_APK.sh`
- `RUN_MOBILE_TEST.ps1`
- `TEST_MOBILE.bat`
- `WEB_TEST_ONLY.bat`
- `setup.sh`

### Database Files (Consolidated)
- `create_all_tables.sql` (use database.sql instead)
- `migration_add_missing_columns.sql`
- `insert_test_data.sql`

## 📊 Statistics

- **Files Removed**: 40+ files and directories
- **Space Saved**: ~2MB of documentation and test files
- **Structure Simplified**: Clear separation of concerns
- **Maintainability**: Easier navigation and development

## ✅ Benefits

1. **Clean Repository**: Only essential files remain
2. **Better Organization**: Logical folder structure
3. **Reduced Confusion**: No duplicate or obsolete files
4. **Faster Setup**: Fewer files to process
5. **Professional**: Production-ready structure
