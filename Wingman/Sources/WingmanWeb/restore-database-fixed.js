const mysql = require('mysql2/promise');

async function getConnection(host, port, user, password, database) {
  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const connection = await pool.getConnection();
  return { connection, pool };
}

// Helper function to handle undefined values
function handleUndefined(value) {
  return value === undefined ? null : value;
}

async function restoreAIProviders(localConn, cloudConn) {
  console.log('=== Restoring AI Providers ===');
  
  // Get AI providers from local database
  const [providers] = await localConn.execute('SELECT * FROM ai_providers');
  console.log(`Found ${providers.length} AI providers to restore`);

  // Insert into cloud database
  for (const provider of providers) {
    try {
      await cloudConn.execute(
        `INSERT IGNORE INTO ai_providers (id, name, base_urls, default_model, requires_auth, auth_header, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          handleUndefined(provider.id),
          handleUndefined(provider.name),
          JSON.stringify(handleUndefined(provider.base_urls) || []),
          handleUndefined(provider.default_model),
          handleUndefined(provider.requires_auth),
          handleUndefined(provider.auth_header),
          handleUndefined(provider.created_at),
          handleUndefined(provider.updated_at)
        ]
      );
      console.log(`✅ Restored AI provider: ${provider.name}`);
    } catch (error) {
      console.error(`❌ Failed to restore AI provider ${provider.name}:`, error.message);
    }
  }
}

async function restoreChats(localConn, cloudConn) {
  console.log('\n=== Restoring Chats ===');
  
  // Get chats from local database
  const [localChats] = await localConn.execute('SELECT * FROM chats');
  console.log(`Found ${localChats.length} chats locally`);

  // Get chats from cloud database
  const [cloudChats] = await cloudConn.execute('SELECT id FROM chats');
  const cloudChatIds = cloudChats.map(chat => chat.id);
  console.log(`Found ${cloudChatIds.length} chats in cloud`);

  // Find missing chats
  const missingChats = localChats.filter(chat => !cloudChatIds.includes(chat.id));
  console.log(`Found ${missingChats.length} chats to restore`);

  // Insert missing chats into cloud database
  for (const chat of missingChats) {
    try {
      await cloudConn.execute(
        `INSERT INTO chats (id, user_id, provider, title, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          handleUndefined(chat.id),
          handleUndefined(chat.user_id),
          handleUndefined(chat.provider),
          handleUndefined(chat.title),
          handleUndefined(chat.created_at),
          handleUndefined(chat.updated_at)
        ]
      );
      console.log(`✅ Restored chat: ${chat.title || 'Untitled'} (ID: ${chat.id})`);
    } catch (error) {
      console.error(`❌ Failed to restore chat ${chat.id}:`, error.message);
      // Log the chat data for debugging
      console.log('Chat data:', {
        id: chat.id,
        user_id: chat.user_id,
        provider: chat.provider,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at
      });
    }
  }
}

async function restoreChatMessages(localConn, cloudConn) {
  console.log('\n=== Restoring Chat Messages ===');
  
  // Get chats from cloud database first to ensure we only restore messages for existing chats
  const [cloudChats] = await cloudConn.execute('SELECT id FROM chats');
  const cloudChatIds = cloudChats.map(chat => chat.id);
  console.log(`Found ${cloudChatIds.length} chats in cloud for message restoration`);

  // Get chat messages from local database
  const [localMessages] = await localConn.execute('SELECT * FROM chat_messages');
  console.log(`Found ${localMessages.length} chat messages locally`);

  // Get chat messages from cloud database
  const [cloudMessages] = await cloudConn.execute('SELECT id FROM chat_messages');
  const cloudMessageIds = cloudMessages.map(msg => msg.id);
  console.log(`Found ${cloudMessageIds.length} chat messages in cloud`);

  // Find missing messages that belong to chats that exist in cloud
  const missingMessages = localMessages.filter(msg => 
    !cloudMessageIds.includes(msg.id) && cloudChatIds.includes(msg.chat_id)
  );
  console.log(`Found ${missingMessages.length} chat messages to restore`);

  // Insert missing messages into cloud database
  for (const message of missingMessages) {
    try {
      await cloudConn.execute(
        `INSERT INTO chat_messages (id, chat_id, role, content, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          handleUndefined(message.id),
          handleUndefined(message.chat_id),
          handleUndefined(message.role),
          handleUndefined(message.content),
          handleUndefined(message.created_at)
        ]
      );
      console.log(`✅ Restored message: Chat ID ${message.chat_id}, Role: ${message.role}`);
    } catch (error) {
      console.error(`❌ Failed to restore message ${message.id}:`, error.message);
    }
  }
}

async function verifyRestoration(cloudConn) {
  console.log('\n=== Verification After Restoration ===');

  // Check AI providers
  const [providers] = await cloudConn.execute('SELECT COUNT(*) as count FROM ai_providers');
  console.log(`AI Providers: ${providers[0].count} rows`);

  // Check chats
  const [chats] = await cloudConn.execute('SELECT COUNT(*) as count FROM chats');
  console.log(`Chats: ${chats[0].count} rows`);

  // Check chat messages
  const [messages] = await cloudConn.execute('SELECT COUNT(*) as count FROM chat_messages');
  console.log(`Chat Messages: ${messages[0].count} rows`);

  // Check specific data
  console.log('\n=== Detailed Verification ===');
  
  // Check AI providers
  const [providerDetails] = await cloudConn.execute('SELECT id, name FROM ai_providers');
  console.log('AI Providers:');
  providerDetails.forEach(provider => {
    console.log(`  - ${provider.name} (${provider.id})`);
  });

  // Check chats
  const [chatDetails] = await cloudConn.execute('SELECT id, title, user_id FROM chats');
  console.log('\nChats:');
  chatDetails.forEach(chat => {
    console.log(`  - ${chat.title || 'Untitled'} (ID: ${chat.id}, User: ${chat.user_id})`);
  });

  console.log('\n=== Final Status ===');
  console.log('Restoration process completed!');
}

async function main() {
  console.log('========================================');
  console.log('Restoring Missing Data to Alibaba Cloud');
  console.log('========================================');

  let localConn, localPool, cloudConn, cloudPool;

  try {
    // Connect to local database
    console.log('\nConnecting to local database...');
    ({ connection: localConn, pool: localPool } = await getConnection('127.0.0.1', 3306, 'root', 'password', 'wingman_db'));
    console.log('✅ Connected to local database');

    // Connect to cloud database
    console.log('\nConnecting to Alibaba Cloud database...');
    ({ connection: cloudConn, pool: cloudPool } = await getConnection('101.132.156.250', 33320, 'wingman_db_usr_8a2Xy', 'Z8#kP2@vQ7$mE5!tR3&wX9*yB4', 'wingman_db'));
    console.log('✅ Connected to Alibaba Cloud database');

    // Restore data
    await restoreAIProviders(localConn, cloudConn);
    await restoreChats(localConn, cloudConn);
    await restoreChatMessages(localConn, cloudConn);

    // Verify restoration
    await verifyRestoration(cloudConn);

  } catch (error) {
    console.error('❌ Error during restoration:', error.message);
  } finally {
    // Close connections
    if (localConn) await localConn.release();
    if (localPool) await localPool.end();
    if (cloudConn) await cloudConn.release();
    if (cloudPool) await cloudPool.end();
  }
}

main().catch(console.error);
