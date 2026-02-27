import { test, expect } from '@playwright/test';

test.describe('US-004: New Chat Functionality', () => {
  let testUserEmail: string;
  let testUserPassword: string;

  test.beforeEach(async ({ request }) => {
    // Create a test user
    testUserEmail = `test_user_${Date.now()}@example.com`;
    testUserPassword = 'Password123!';

    // Try to register test user
    const registerResponse = await request.post('/api/register', {
      multipart: {
        email: testUserEmail,
        password: testUserPassword,
        name: 'Test User',
        apiKey: 'test-api-key'
      }
    });

    // If registration fails, it might be because the user already exists or database is down
    // We'll try to login anyway
    const loginResponse = await request.post('/api/login', {
      data: {
        email: testUserEmail,
        password: testUserPassword
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
  });

  test('US-004-001: should initiate new chat when sending first message', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Check that the chat interface is reset
    const chatContainer = await page.locator('[role="region"][aria-label="Chat messages"]');
    await expect(chatContainer).toBeVisible();
    
    // Check that no messages are present initially
    const initialMessages = await page.locator('[data-testid="chat-history-item"]');
    const initialCount = await initialMessages.count();

    // Enter text in "What's in your mind?" text field
    const mindInput = await page.locator('textarea');
    await mindInput.fill('Hello, this is a test message for a new chat');

    // Click the Send button
    const sendButton = await page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Wait for the message to be sent and processed
    await page.waitForLoadState('networkidle');

    // Check that a new chat was created
    const updatedMessages = await page.locator('[data-testid="chat-history-item"]');
    await expect(updatedMessages).toHaveCount(initialCount + 1);
  });

  test('US-004-002: should receive first response and generate appropriate chat name', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Get initial chat count
    const initialChats = await page.locator('[data-testid="chat-history-item"]');
    const initialCount = await initialChats.count();

    // Enter text in "What's in your mind?" text field
    const mindInput = await page.locator('textarea');
    await mindInput.fill('Hello, what is the capital of France?');

    // Click the Send button
    const sendButton = await page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Wait for the response
    await page.waitForLoadState('networkidle');

    // Check that a new chat was created with an appropriate name
    const chatItems = await page.locator('[data-testid="chat-history-item"]');
    await expect(chatItems).toHaveCount(initialCount + 1);
    
    // Check that the chat has a name (not just "New Chat")
    const chatName = await page.locator('[data-testid="chat-name"]').first();
    const nameText = await chatName.textContent();
    expect(nameText).not.toBe('New Chat');
  });

  test('US-004-003: should reset chat section when New Chat button is clicked', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Create a chat first to have something to reset
    const mindInput = await page.locator('textarea');
    await mindInput.fill('Hello, this is a test message');
    
    const sendButton = await page.locator('button[aria-label="Send message"]');
    await sendButton.click();
    
    await page.waitForLoadState('networkidle');

    // Click New Chat button
    const newChatButton = await page.locator('button[aria-label="New chat"]');
    await newChatButton.click();

    // Check that chat section is reset (no messages)
    const chatContainer = await page.locator('[role="region"][aria-label="Chat messages"]');
    await expect(chatContainer).toBeVisible();
    
    // Check that the text area is empty
    await expect(mindInput).toHaveValue('');
  });

  test('US-004-004: should initiate new chat on first message when wingman-panel loads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Check that no chats exist initially
    const initialChats = await page.locator('[data-testid="chat-history-item"]');
    const initialCount = await initialChats.count();

    // Enter text in "What's in your mind?" text field
    const mindInput = await page.locator('textarea');
    await mindInput.fill('Hello, this is my first message');

    // Click the Send button
    const sendButton = await page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Wait for the message to be processed
    await page.waitForLoadState('networkidle');

    // Check that a new chat was created
    const updatedChats = await page.locator('[data-testid="chat-history-item"]');
    await expect(updatedChats).toHaveCount(initialCount + 1);
  });
});
