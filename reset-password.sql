UPDATE users 
SET password_hash = ''
WHERE email = 'admin@aegis.local';
