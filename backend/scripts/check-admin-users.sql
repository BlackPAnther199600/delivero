-- Check if admin users exist
SELECT id, email, name, role, created_at 
FROM users 
WHERE role IN ('admin', 'manager') 
ORDER BY created_at DESC;

-- Check all users and their roles
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
