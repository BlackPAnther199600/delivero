-- ========================================
-- DELIVERO DATABASE - INSERT TEST DATA
-- PostgreSQL Script - Fake records for testing
-- ========================================
-- This script inserts test data for all tables except 'users'
-- Note: Ensure users with ID 1, 2, 3 exist before running this script

-- ========================================
-- 1. INSERT TEST RESTAURANTS
-- ========================================

INSERT INTO restaurants (name, description, rating, address) 
VALUES 
  ('Pizzeria Roma', 'Autentica pizzeria napoletana con forno a legna e ingredienti naturali', 4.8, 'Via Roma 123, Milano'),
  ('Burger House', 'Gourmet burger restaurant con carne selezionata e pane artigianale', 4.6, 'Via Burger 456, Milano'),
  ('Sushi Master', 'Fresh Japanese sushi bar con chef giapponese certificato e ingredienti freschi', 4.9, 'Via Sushi 789, Milano'),
  ('Poke Bowl', 'Hawaii poke restaurant con ingredienti fresh e verdure bio', 4.7, 'Via Poke 101, Milano'),
  ('Kebab Palace', 'Middle Eastern kebab specializzato in carni grigliate e verdure fresche', 4.5, 'Via Kebab 202, Milano'),
  ('Pasta Fresca', 'Ristorante tradizionale italiano con pasta fresca fatta in casa', 4.7, 'Via Pasta 303, Milano'),
  ('Tacos Fiesta', 'Mexican restaurant con tacos autentici e salsa fresca', 4.4, 'Via Tacos 404, Milano'),
  ('Ramen House', 'Authentic Japanese ramen noodle house', 4.8, 'Via Ramen 505, Milano')
ON CONFLICT DO NOTHING;

-- ========================================
-- 2. INSERT TEST RESTAURANT CATEGORIES
-- ========================================

INSERT INTO restaurant_categories (restaurant_id, name, description, display_order, is_active)
VALUES
  (1, 'Classiche', 'Pizze tradizionali napoletane', 1, true),
  (1, 'Speciali', 'Pizze creative della casa', 2, true),
  (1, 'Bevande', 'Bibite e vini', 3, true),
  (2, 'Burger', 'Hamburger e cheeseburger gourmet', 1, true),
  (2, 'Accompagnamenti', 'Patatine, insalate e contorni', 2, true),
  (2, 'Bevande', 'Bibite fredde e calde', 3, true),
  (3, 'Nigiri', 'Sushi nigiri tradizionale', 1, true),
  (3, 'Roll', 'Sushi roll e maki', 2, true),
  (3, 'Speciali', 'Creazioni speciali dello chef', 3, true),
  (4, 'Poke Bowl', 'Bowls hawaiani con diverse proteine', 1, true),
  (4, 'Customizzati', 'Crea il tuo poke', 2, true),
  (5, 'Kebab', 'Kebab di carne e pollo', 1, true),
  (5, 'Wraps', 'Wraps e piadine', 2, true),
  (6, 'Piatti Principali', 'Piatti di pasta freschi', 1, true),
  (6, 'Antipasti', 'Starters italiani', 2, true),
  (7, 'Tacos', 'Tacos autentici', 1, true),
  (7, 'Burritos', 'Burritos messicani', 2, true),
  (8, 'Ramen', 'Ramen brodi autentici', 1, true),
  (8, 'Accompagnamenti', 'Gyoza e contorni', 2, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. INSERT TEST MENU ITEMS
-- ========================================

INSERT INTO menu_items (restaurant_id, category_id, name, description, price, image_url, is_available, is_active)
VALUES
  (1, 1, 'Margherita', 'Pomodoro, mozzarella, basilico fresco', 8.50, 'https://via.placeholder.com/margherita.jpg', true, true),
  (1, 1, 'Quattro Formaggi', 'Mozzarella, gorgonzola, pecorino, parmigiano', 10.50, 'https://via.placeholder.com/quattro.jpg', true, true),
  (1, 2, 'Romeo & Giulietta', 'Speck, rucola, parmigiano fatto a scaglie', 12.00, 'https://via.placeholder.com/romeo.jpg', true, true),
  (1, 2, 'Salsiccia e Friarielli', 'Salsiccia campana, friarielli napoletani', 11.00, 'https://via.placeholder.com/salsiccia.jpg', true, true),
  (1, 3, 'Coca Cola 33cl', 'Bevanda gassata fredda', 2.50, 'https://via.placeholder.com/coke.jpg', true, true),
  (1, 3, 'Vino Rosso Casa', 'Vino rosso della casa', 8.00, 'https://via.placeholder.com/wine.jpg', true, true),
  
  (2, 4, 'Cheeseburger Gourmet', 'Carne di manzo 200g, cheddar, bacon, cipolle', 12.00, 'https://via.placeholder.com/cheese.jpg', true, true),
  (2, 4, 'Doppio Burger', 'Doppia carne, formaggio doppio', 14.00, 'https://via.placeholder.com/doppio.jpg', true, true),
  (2, 5, 'Patatine Fritte', 'Patatine fritte croccanti', 3.50, 'https://via.placeholder.com/fries.jpg', true, true),
  (2, 5, 'Insalata Mista', 'Insalata fresca mista', 4.50, 'https://via.placeholder.com/salad.jpg', true, true),
  
  (3, 7, 'Nigiri Salmone', 'Riso e salmone fresco', 4.50, 'https://via.placeholder.com/nigiri.jpg', true, true),
  (3, 7, 'Nigiri Tonno', 'Riso e tonno fresco', 4.50, 'https://via.placeholder.com/nigiri2.jpg', true, true),
  (3, 8, 'California Roll', 'Riso, avocado, granchio, pepino', 7.50, 'https://via.placeholder.com/california.jpg', true, true),
  (3, 9, 'Spicy Tuna Roll', 'Tonno piccante, peperoncino, maionese', 8.50, 'https://via.placeholder.com/spicy.jpg', true, true),
  
  (4, 10, 'Poke Salmon', 'Riso, salmone fresco, avocado, verdure', 10.50, 'https://via.placeholder.com/poksal.jpg', true, true),
  (4, 10, 'Poke Tuna', 'Riso, tonno fresco, edamame, nori', 9.50, 'https://via.placeholder.com/poketun.jpg', true, true),
  
  (5, 12, 'Kebab Pollo', 'Carne di pollo grigliata, insalata, salsa', 6.50, 'https://via.placeholder.com/kebabpol.jpg', true, true),
  (5, 12, 'Kebab Agnello', 'Carne di agnello grigliata, spezie', 7.50, 'https://via.placeholder.com/kebabagn.jpg', true, true),
  
  (6, 14, 'Tagliatelle al Ragù', 'Pasta fresca con ragù bolognese tradizionale', 11.00, 'https://via.placeholder.com/taglia.jpg', true, true),
  (6, 14, 'Pappardelle al Cinghiale', 'Pappardelle con ragù di cinghiale', 12.00, 'https://via.placeholder.com/pappar.jpg', true, true),
  (6, 15, 'Bruschetta al Pomodoro', 'Pane tostato con pomodori freschi', 5.50, 'https://via.placeholder.com/brusch.jpg', true, true),
  
  (7, 16, 'Taco al Carnitas', 'Carne di maiale marinata, cipolla, cilantro', 3.50, 'https://via.placeholder.com/tacocarn.jpg', true, true),
  (7, 17, 'Burrito Carne e Fagioli', 'Tortilla con carne, fagioli, riso', 9.50, 'https://via.placeholder.com/burrit.jpg', true, true),
  
  (8, 18, 'Ramen Tonkotsu', 'Brodo di ossa di maiale, tagliatelle ondulate, uovo', 10.50, 'https://via.placeholder.com/ramentonk.jpg', true, true),
  (8, 18, 'Ramen Pollo', 'Brodo di pollo leggero, noodle, germogli', 9.50, 'https://via.placeholder.com/ramenpol.jpg', true, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. INSERT TEST MENU CUSTOMIZATIONS
-- ========================================

INSERT INTO menu_customizations (menu_item_id, type, name, price)
VALUES
  (1, 'radio', 'Piccola', 0.00),
  (1, 'radio', 'Media', 1.00),
  (1, 'radio', 'Grande', 2.00),
  (2, 'radio', 'Piccola', 0.00),
  (2, 'radio', 'Media', 1.00),
  (2, 'radio', 'Grande', 2.00),
  (7, 'radio', 'Senza Cuocatura', 0.00),
  (7, 'checkbox', 'Aggiungi Bacon', 2.00),
  (7, 'checkbox', 'Aggiungi Uovo', 1.50),
  (7, 'checkbox', 'Aggiungi Formaggio Extra', 1.00)
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. INSERT TEST ORDERS
-- ========================================

INSERT INTO orders (user_id, restaurant_id, items, total_amount, delivery_address, status, rider_id, created_at, updated_at)
VALUES
  (1, 1, '{"items": [{"id": 1, "name": "Margherita", "quantity": 2, "price": 8.50}]}', 17.00, 'Via Milano 10, Milano', 'delivered', 2, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  (2, 2, '{"items": [{"id": 7, "name": "Cheeseburger Gourmet", "quantity": 1, "price": 12.00}]}', 12.00, 'Via Torino 5, Milano', 'delivered', 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (1, 3, '{"items": [{"id": 11, "name": "Nigiri Salmone", "quantity": 6, "price": 4.50}]}', 27.00, 'Via Milano 10, Milano', 'delivered', 2, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (3, 4, '{"items": [{"id": 15, "name": "Poke Salmon", "quantity": 1, "price": 10.50}]}', 10.50, 'Via Como 15, Milano', 'pending', NULL, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (2, 5, '{"items": [{"id": 17, "name": "Kebab Pollo", "quantity": 2, "price": 6.50}]}', 13.00, 'Via Torino 5, Milano', 'in_progress', 2, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
  (1, 6, '{"items": [{"id": 19, "name": "Tagliatelle al Ragù", "quantity": 1, "price": 11.00}]}', 11.00, 'Via Milano 10, Milano', 'confirmed', NULL, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
  (3, 7, '{"items": [{"id": 22, "name": "Taco al Carnitas", "quantity": 3, "price": 3.50}]}', 10.50, 'Via Como 15, Milano', 'pending', NULL, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;

-- ========================================
-- 6. INSERT TEST PAYMENTS
-- ========================================

INSERT INTO payments (order_id, stripe_payment_id, amount, status, created_at, updated_at)
VALUES
  (1, 'pi_test_001', 17.00, 'succeeded', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
  (2, 'pi_test_002', 12.00, 'succeeded', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (3, 'pi_test_003', 27.00, 'succeeded', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (4, 'pi_test_004', 10.50, 'pending', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
  (5, 'pi_test_005', 13.00, 'processing', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '30 minutes'),
  (6, 'pi_test_006', 11.00, 'pending', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes')
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. INSERT TEST REVIEWS
-- ========================================

INSERT INTO reviews (order_id, restaurant_id, user_id, food_rating, delivery_rating, comment, photos, is_verified, gamification_points, created_at, updated_at)
VALUES
  (1, 1, 1, 5, 5, 'Pizza fantastica! Consegna velocissima. Consigliatissimo!', '["https://via.placeholder.com/review1.jpg"]', true, 50, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (2, 2, 2, 4, 4, 'Hamburger buono, arrivato caldo. Un po'' aspettare ma ne vale la pena.', '["https://via.placeholder.com/review2.jpg"]', true, 40, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (3, 3, 1, 5, 5, 'Sushi fresco e di qualità. Delivery perfetto!', '["https://via.placeholder.com/review3.jpg"]', true, 50, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ========================================
-- 8. INSERT TEST USER POINTS
-- ========================================

INSERT INTO user_points (user_id, points, total_reviews, total_photos, last_review_date, created_at, updated_at)
VALUES
  (1, 240, 3, 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '30 days', NOW()),
  (2, 80, 1, 1, NOW() - INTERVAL '4 days', NOW() - INTERVAL '30 days', NOW()),
  (3, 0, 0, 0, NULL, NOW() - INTERVAL '30 days', NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 9. INSERT TEST BILLS
-- ========================================

INSERT INTO bills (user_id, type, amount, due_date, description, paid, created_at, updated_at)
VALUES
  (1, 'electricity', 85.50, NOW()::date + INTERVAL '30 days', 'Bolletta energia elettrica gennaio 2026', false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (1, 'water', 32.00, NOW()::date + INTERVAL '25 days', 'Bolletta acqua gennaio 2026', false, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),
  (2, 'electricity', 92.30, NOW()::date + INTERVAL '28 days', 'Bolletta energia elettrica gennaio 2026', true, NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days'),
  (2, 'internet', 29.99, NOW()::date + INTERVAL '20 days', 'Bolletta internet gennaio 2026', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (3, 'gas', 65.75, NOW()::date + INTERVAL '35 days', 'Bolletta gas gennaio 2026', false, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;

-- ========================================
-- 10. INSERT TEST BILL PAYMENTS
-- ========================================

INSERT INTO bill_payments (bill_id, user_id, rider_id, payment_method, amount, barcode_image_url, qr_code_image_url, status, rider_payment_status, created_at, updated_at)
VALUES
  (1, 1, 2, 'cash', 85.50, 'https://via.placeholder.com/barcode1.png', 'https://via.placeholder.com/qr1.png', 'pending', 'pending', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  (2, 1, NULL, 'prepaid', 32.00, 'https://via.placeholder.com/barcode2.png', 'https://via.placeholder.com/qr2.png', 'pending', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (3, 2, 3, 'cash', 92.30, 'https://via.placeholder.com/barcode3.png', 'https://via.placeholder.com/qr3.png', 'completed', 'submitted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),
  (4, 2, NULL, 'prepaid', 29.99, 'https://via.placeholder.com/barcode4.png', 'https://via.placeholder.com/qr4.png', 'pending', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

-- ========================================
-- 11. INSERT TEST PHARMACIES
-- ========================================

INSERT INTO pharmacies (name, email, password, phone, address, city, postal_code, license_number, lat, lon, is_verified, is_active, rating, created_at, updated_at)
VALUES
  ('Farmacia Centrale Milano', 'farmacia.centrale@email.com', 'hashed_password', '+39 02 9876543', 'Via Largo 1, Milano', 'Milano', '20100', 'LIC001', 45.4642, 9.1900, true, true, 4.8, NOW() - INTERVAL '90 days', NOW()),
  ('Farmacia San Pietro', 'farmacia.sanpietro@email.com', 'hashed_password', '+39 02 8765432', 'Via San Pietro 50, Milano', 'Milano', '20100', 'LIC002', 45.4700, 9.1850, true, true, 4.6, NOW() - INTERVAL '90 days', NOW()),
  ('Farmacia Salute Plus', 'farmacia.saluteplus@email.com', 'hashed_password', '+39 02 7654321', 'Via Salute 25, Milano', 'Milano', '20100', 'LIC003', 45.4750, 9.1920, true, true, 4.7, NOW() - INTERVAL '90 days', NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 12. INSERT TEST PHARMACY PRODUCTS
-- ========================================

INSERT INTO pharmacy_products (pharmacy_id, name, description, category, price, stock_quantity, requires_prescription, image_url, active, created_at, updated_at)
VALUES
  (1, 'Aspirina 500mg', 'Analgesico e antinfiammatorio, confezione 20 compresse', 'Antidolorifici', 3.50, 45, false, 'https://via.placeholder.com/aspirin.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (1, 'Tachipirina 1000mg', 'Antipiretico, scatola 12 compresse', 'Antidolorifici', 4.20, 32, false, 'https://via.placeholder.com/tachipirina.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (1, 'Imodium 2mg', 'Per diarrea, 10 capsule', 'Gastrointestinale', 5.80, 20, false, 'https://via.placeholder.com/imodium.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (1, 'Augmentin 1g', 'Antibiotico (richiede ricetta)', 'Antibiotici', 8.50, 15, true, 'https://via.placeholder.com/augmentin.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (2, 'Vitaminc Arancia', 'Vitamina C, integratore 20 effervescenti', 'Vitamine', 6.50, 50, false, 'https://via.placeholder.com/vitaminc.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (2, 'Moment 200mg', 'Antinfiammatorio, 16 compresse', 'Antidolorifici', 5.50, 38, false, 'https://via.placeholder.com/moment.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (3, 'Flixonase Spray', 'Spray nasale allergia, 60 dosi', 'Allergie', 9.00, 25, false, 'https://via.placeholder.com/flixonase.jpg', true, NOW() - INTERVAL '60 days', NOW()),
  (3, 'Nexium 20mg', 'Gastroprotettore (richiede ricetta)', 'Gastrointestinale', 12.50, 18, true, 'https://via.placeholder.com/nexium.jpg', true, NOW() - INTERVAL '60 days', NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 13. INSERT TEST PHARMACY ORDERS
-- ========================================

INSERT INTO pharmacy_orders (user_id, pharmacy_id, rider_id, items, total_amount, delivery_address, delivery_lat, delivery_lon, status, delivery_notes, created_at, updated_at)
VALUES
  (1, 1, 2, '{"items": [{"id": 1, "name": "Aspirina 500mg", "quantity": 1, "price": 3.50}]}', 3.50, 'Via Milano 10, Milano', 45.4642, 9.1900, 'delivered', 'Consegnare a mano', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
  (2, 2, 3, '{"items": [{"id": 6, "name": "Moment 200mg", "quantity": 1, "price": 5.50}]}', 5.50, 'Via Torino 5, Milano', 45.4700, 9.1850, 'delivered', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (3, 3, 2, '{"items": [{"id": 8, "name": "Flixonase Spray", "quantity": 1, "price": 9.00}]}', 9.00, 'Via Como 15, Milano', 45.4750, 9.1920, 'pending', 'Allergico', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- ========================================
-- 14. INSERT TEST MEDICAL TRANSPORTS
-- ========================================

INSERT INTO medical_transports (user_id, rider_id, doctor_name, clinic_name, clinic_address, clinic_phone, pickup_address, pickup_lat, pickup_lon, appointment_date, appointment_time, return_trip, special_requirements, status, estimated_cost, actual_cost, created_at, updated_at)
VALUES
  (1, 2, 'Dr. Carlo Rossi', 'Clinica Milano', 'Via Clinica 10, Milano', '+39 02 1111111', 'Via Milano 10, Milano', 45.4642, 9.1900, NOW()::date + INTERVAL '5 days', '10:00:00', true, NULL, 'pending', 25.00, NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (2, 3, 'Dr. Maria Bianchi', 'Studio Cardiologia', 'Via Cardiologia 20, Milano', '+39 02 2222222', 'Via Torino 5, Milano', 45.4700, 9.1850, NOW()::date + INTERVAL '8 days', '14:30:00', true, 'Paziente anziano con mobilità limitata', 'confirmed', 30.00, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  (3, NULL, 'Dr. Antonio Verde', 'Ospedale Centrale', 'Via Ospedale 100, Milano', '+39 02 3333333', 'Via Como 15, Milano', 45.4750, 9.1920, NOW()::date + INTERVAL '2 days', '09:00:00', false, NULL, 'pending', 35.00, NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ========================================
-- 15. INSERT TEST DOCUMENT PICKUPS
-- ========================================

INSERT INTO document_pickups (user_id, rider_id, document_type, pickup_location, pickup_lat, pickup_lon, delivery_address, delivery_lat, delivery_lon, status, estimated_cost, description, tracking_number, signature_required, created_at, updated_at)
VALUES
  (1, 2, 'certificate', 'Comune di Milano - Ufficio Anagrafe, Via Centrale 1', 45.4642, 9.1900, 'Via Milano 10, Milano', 45.4642, 9.1900, 'delivered', 5.00, 'Certificato di residenza', 'TRACK001', false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (2, 3, 'permit', 'Questura Milano, Via Polizia 5', 45.4700, 9.1850, 'Via Torino 5, Milano', 45.4700, 9.1850, 'in_progress', 7.50, 'Permesso di soggiorno', 'TRACK002', true, NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'),
  (3, NULL, 'contract', 'Studio Legale Rossi, Via Avvocati 15', 45.4750, 9.1920, 'Via Como 15, Milano', 45.4750, 9.1920, 'pending', 10.00, 'Atto notarile', 'TRACK003', true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;

-- ========================================
-- 16. INSERT TEST TICKETS
-- ========================================

INSERT INTO tickets (user_id, type, title, description, attachment_urls, status, priority, admin_notes, created_at, updated_at)
VALUES
  (1, 'bug', 'App non carica ordini', 'L''app rimane bloccata al caricamento lista ordini.', '[]', 'resolved', 'high', 'Risolto con update app', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'),
  (2, 'complaint', 'Ordine arrivato freddo', 'L''hamburger è arrivato freddo dopo 45 minuti di attesa.', '["https://via.placeholder.com/complaint.jpg"]', 'resolved', 'medium', 'Refund di €5 concesso', NOW() - INTERVAL '7 days', NOW() - INTERVAL '4 days'),
  (3, 'feature_request', 'Aggiungere opzione \"Non suonare campanello\"', 'Alcuni clienti preferirebbero che il rider non suoni il campanello.', '[]', 'open', 'low', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  (1, 'support', 'Come cancellare account?', 'Vorrei sapere come eliminare il mio profilo.', '[]', 'in_progress', 'medium', 'Email di assistenza inviata', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- ========================================
-- 17. INSERT TEST TICKET COMMENTS
-- ========================================

INSERT INTO ticket_comments (ticket_id, user_id, comment, created_at, updated_at)
VALUES
  (1, 1, 'Ho trovato la soluzione: cancellare cache dell''app', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
  (1, 2, 'Confermo che il problema è stato risolto con l''update', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  (2, 2, 'Il rider ha avuto un ritardo a causa del traffico', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  (4, 1, 'Ho già ricevuto le istruzioni per la cancellazione', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours')
ON CONFLICT DO NOTHING;

-- ========================================
-- SCRIPT COMPLETED SUCCESSFULLY
-- ========================================
-- All test data has been inserted successfully
-- Users table was NOT modified as requested
-- You can now test the application with this data
