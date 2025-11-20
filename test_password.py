import bcrypt

password = 'admin123'
hash_from_db = ''

result = bcrypt.checkpw(password.encode('utf-8'), hash_from_db.encode('utf-8'))
print(f'Password verification: {result}')
