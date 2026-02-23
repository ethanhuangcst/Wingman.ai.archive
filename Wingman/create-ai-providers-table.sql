-- Create ai_providers table to store provider configurations
CREATE TABLE IF NOT EXISTS ai_providers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  base_urls JSON NOT NULL,
  default_model VARCHAR(100) NOT NULL,
  requires_auth BOOLEAN NOT NULL DEFAULT TRUE,
  auth_header VARCHAR(100) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial providers from ai-config.ts
INSERT INTO ai_providers (id, name, base_urls, default_model, requires_auth, auth_header)
VALUES
  ('qwen-plus', 'qwen-plus', '["https://dashscope.aliyuncs.com/compatible-mode/v1"]', 'qwen-plus', TRUE, 'Authorization'),
  ('gpt-5.2-all', 'gpt-5.2-all', '["https://openaiss.com/v1"]', 'gpt-5.2-all', TRUE, 'Authorization')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  base_urls = VALUES(base_urls),
  default_model = VALUES(default_model),
  requires_auth = VALUES(requires_auth),
  auth_header = VALUES(auth_header),
  updated_at = CURRENT_TIMESTAMP;

-- Update ai_connections table to add provider_id column
ALTER TABLE ai_connections ADD COLUMN IF NOT EXISTS provider_id VARCHAR(50) NULL;

-- Create foreign key constraint
ALTER TABLE ai_connections ADD CONSTRAINT IF NOT EXISTS fk_ai_connections_provider
  FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
  ON DELETE SET NULL;

-- Update existing ai_connections to use provider_id instead of apiProvider
UPDATE ai_connections
SET provider_id = CASE
  WHEN apiProvider = 'Qwen' THEN 'qwen-plus'
  WHEN apiProvider = 'PlanB' THEN 'gpt-5.2-all'
  ELSE apiProvider
END
WHERE provider_id IS NULL;

-- Update users table to use provider_id instead of apiProvider
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(50) NULL;

ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_provider
  FOREIGN KEY (provider_id) REFERENCES ai_providers(id)
  ON DELETE SET NULL;

UPDATE users
SET provider_id = CASE
  WHEN apiProvider = 'Qwen' THEN 'qwen-plus'
  WHEN apiProvider = 'PlanB' THEN 'gpt-5.2-all'
  ELSE apiProvider
END
WHERE provider_id IS NULL;
