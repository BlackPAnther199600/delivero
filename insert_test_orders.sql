-- Insert test orders for rider testing
INSERT INTO orders (user_id, items, total_amount, delivery_address, status) 
VALUES 
(2, '[{"name":"Pizza Margherita","quantity":1,"price":15.99}]'::jsonb, 15.99, 'Via Roma 123, Milano', 'pending'),
(2, '[{"name":"Burger Deluxe","quantity":1,"price":12.50}]'::jsonb, 12.50, 'Viale Monza 45, Milano', 'pending'),
(2, '[{"name":"Ramen Spicy","quantity":1,"price":11.99}]'::jsonb, 11.99, 'Via Torino 78, Milano', 'pending'),
(2, '[{"name":"Insalata Caesar","quantity":1,"price":9.99}]'::jsonb, 9.99, 'Corso Buenos Aires 50, Milano', 'pending'),
(2, '[{"name":"Poke Bowl","quantity":2,"price":13.50}]'::jsonb, 13.50, 'Via Dante 12, Milano', 'pending');

SELECT COUNT(*) as pending_orders FROM orders WHERE status = 'pending';
