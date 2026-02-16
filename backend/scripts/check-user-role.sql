-- Check role of specific user
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'luca04985@gmail.com';

-- Check all users with their roles
SELECT id, email, name, role, created_at 
FROM users 
ORDER BY created_at DESC;
