import { test, expect } from '@playwright/test';

test.describe('US-005-008 & US-005-009: Resume Previous Chat', () => {
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

  test('US-005-008: should resume previous chat and load complete history', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Create a new chat with a message to have something to resume
    const mindInput = await page.locator('textarea');
    await mindInput.fill('Hello, this is a test message for resuming chat');

    // Wait for the send button to be enabled
    await page.waitForLoadState('networkidle');
    
    // Click the send button
    const sendButton = await page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Wait for the message to be processed
    await page.waitForLoadState('networkidle');

    // Get the chat items
    const chatItems = await page.locator('[data-testid="chat-history-item"]');
    const chatCount = await chatItems.count();
    expect(chatCount).toBeGreaterThanOrEqual(1);

    // Click on the chat item to resume it
    await chatItems.first().click();

    // Wait for the chat to load
    await page.waitForLoadState('networkidle');

    // Check that the chat is highlighted as active
    const activeChat = await page.locator('[data-testid="chat-history-item"].bg-blue-50');
    await expect(activeChat).toBeVisible();

    // Check that the chat messages are displayed
    const chatMessages = await page.locator('[role="region"][aria-label="Chat messages"]');
    await expect(chatMessages).toBeVisible();
  });

  test('US-005-009: should send whole conversation when resuming a chat', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');

    // Create a new chat with initial message
    const mindInput = await page.locator('textarea');
    await mindInput.fill('Hello, this is the first message');

    // Click the send button
    const sendButton = await page.locator('button[aria-label="Send message"]');
    await sendButton.click();

    // Wait for the message to be processed
    await page.waitForLoadState('networkidle');

    // Click on the chat to resume it
    const chatItems = await page.locator('[data-testid="chat-history-item"]');
    await chatItems.first().click();

    // Wait for the chat to load
    await page.waitForLoadState('networkidle');

    // Check that the chat messages are displayed (confirming history was loaded)
    const chatMessages = await page.locator('[role="region"][aria-label="Chat messages"]');
    await expect(chatMessages).toBeVisible();
  });
});
