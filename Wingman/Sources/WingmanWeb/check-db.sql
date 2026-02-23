-- Check if ai_connections table exists
SHOW TABLES LIKE 'ai_connections';

-- Check if users table exists
SHOW TABLES LIKE 'users';

-- Check the structure of ai_connections table
DESCRIBE ai_connections;

-- Check the structure of users table
DESCRIBE users;

-- Check all users in the database
SELECT id, name, email, apiKey, apiProvider FROM users;

-- Check all AI connections
SELECT * FROM ai_connections;