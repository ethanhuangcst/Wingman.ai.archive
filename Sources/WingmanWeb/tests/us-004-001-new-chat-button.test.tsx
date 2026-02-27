import { test, expect, Page } from '@playwright/test';

async function clearChatHistory(page: Page) {
  // Clear chat history by deleting all chats
  await page.evaluate(async () => {
    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'deleteAll' }),
      });
    } catch (error) {
      console.log('Error clearing chat history:', error);
    }
  });
}

async function mockLogin(page: Page) {
  // Intercept the account API call
  await page.route('GET', '/api/account', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user: {
          id: 4,
          name: 'Ethan Huang',
          email: 'me@ethanhuang.com',
          apiKey: 'test-api-key'
        }
      }),
    });
  });
  
  // Intercept the test-qianwen API call
  await page.route('GET', '/api/test-qianwen', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        testResult: 'PASS',
        qianwenResponse: 'API test successful'
      }),
    });
  });
  
  // Intercept the chats API call
  await page.route('GET', '/api/chats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ chats: [] }),
    });
  });
}

test.describe('US-004-001: Initiate a new chat from Chat History List - New Chat button', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login
    await mockLogin(page);
    
    // Navigate to wingman-panel
    await page.goto('http://localhost:3000/wingman-panel');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Clear chat history before each test
    await clearChatHistory(page);
    
    // Wait a bit after clearing
    await page.waitForTimeout(1000);
  });

  test('Should create a new chat when New Chat button is clicked', async ({ page }) => {
    // Wait for Chat History section to load
    await page.waitForSelector('h2:text("Chat History")', { timeout: 5000 });
    
    // Get initial count of chat items
    const initialCount = await page.locator('[data-testid="chat-history-item"]').count();
    
    // Click New Chat button
    await page.click('button[aria-label="New chat"]');
    
    // Wait for new chat modal to appear
    await page.waitForSelector('h3:text("New Chat")', { timeout: 5000 });
    
    // Enter chat name
    await page.fill('input[placeholder="Enter chat name"]', 'New Chat');
    
    // Click Create button
    await page.click('button:text("Create")');
    
    // Wait for modal to close
    await page.waitForSelector('h3:text("New Chat")', { state: 'hidden' });
    
    // Wait for new chat to appear in chat history
    await page.waitForSelector('[data-testid="chat-history-item"]', { timeout: 5000 });
    
    // Verify new chat was created
    const newCount = await page.locator('[data-testid="chat-history-item"]').count();
    expect(newCount).toBe(initialCount + 1);
    
    // Verify new chat name appears
    const chatNames = await page.locator('[data-testid="chat-name"]').allTextContents();
    expect(chatNames).toContain('New Chat');
    
    // Verify chat interface is reset
    await page.waitForSelector('[role="region"][aria-label="Chat messages"]', { timeout: 5000 });
    const chatMessages = await page.locator('[role="region"][aria-label="Chat messages"]').textContent();
    expect(chatMessages).toContain('No messages yet. Start a conversation!');
    
    // Verify text field is reset
    const textAreaValue = await page.locator('textarea[class*="resize-none"]').inputValue();
    expect(textAreaValue).toBe('');
  });
});
