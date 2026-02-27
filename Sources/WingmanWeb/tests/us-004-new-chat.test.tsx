import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  
  // Wait for login form to appear
  await page.waitForSelector('h1:text("Sign In")', { timeout: 5000 });
  
  // Fill in login form
  await page.fill('input[name="email"]', 'me@ethanhuang.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation to complete
  await page.waitForNavigation({ timeout: 10000 });
}

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

test.describe('US-004: Start a new chat with Qianwen', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await login(page);
    
    // Navigate to wingman-panel
    await page.goto('http://localhost:3000/wingman-panel');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Clear chat history before each test
    await clearChatHistory(page);
    
    // Wait a bit after clearing
    await page.waitForTimeout(1000);
  });

  test('US-004-001: Initiate a new chat from Chat History List - New Chat button', async ({ page }) => {
    // Wait for New Chat button to appear
    await page.waitForSelector('button[aria-label="New chat"]', { timeout: 5000 });
    
    // Get initial count of chat items
    const initialCount = await page.locator('[data-testid="chat-history-item"]').count();
    
    // Click New Chat button
    await page.click('button[aria-label="New chat"]');
    
    // Wait for new chat modal to appear
    await page.waitForSelector('h3:text("New Chat")', { timeout: 5000 });
    
    // Enter chat name
    await page.fill('input[placeholder="Enter chat name"]', 'Test Chat');
    
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
    expect(chatNames).toContain('Test Chat');
    
    // Verify chat interface is reset
    await page.waitForSelector('[role="region"][aria-label="Chat messages"]', { timeout: 5000 });
    const chatMessages = await page.locator('[role="region"][aria-label="Chat messages"]').textContent();
    expect(chatMessages).toContain('No messages yet. Start a conversation!');
  });

  test('US-004-002: Initiate a new chat on Wingman - Panel initialization', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait for chat interface to be ready
    await page.waitForSelector('[role="region"][aria-label="Chat messages"]', { timeout: 5000 });
    
    // Verify chat interface is in initial state
    const chatMessages = await page.locator('[role="region"][aria-label="Chat messages"]').textContent();
    expect(chatMessages).toContain('No messages yet. Start a conversation!');
  });

  test('US-004-003: Initiate a new chat - receive first response in a new chat', async ({ page }) => {
    // Mock the chat API response
    await page.route('POST', '/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ response: 'Hello! How can I help you today?' }),
      });
    });
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Get initial count of chat items
    const initialCount = await page.locator('[data-testid="chat-history-item"]').count();
    
    // Wait for textarea to appear
    await page.waitForSelector('textarea[class*="resize-none"]', { timeout: 5000 });
    
    // Enter a message in the text field
    await page.fill('textarea[class*="resize-none"]', 'Hello Qianwen!');
    
    // Wait for send button to be enabled
    await page.waitForSelector('button[aria-label="Send message"]:not([disabled])', { timeout: 5000 });
    
    // Click Send button
    await page.click('button[aria-label="Send message"]');
    
    // Wait for response
    await page.waitForSelector('div[class*="bg-gray-100"]', { timeout: 10000 });
    
    // Wait for new chat to be created
    await page.waitForSelector('[data-testid="chat-history-item"]', { timeout: 5000 });
    
    // Verify new chat was created
    const newCount = await page.locator('[data-testid="chat-history-item"]').count();
    expect(newCount).toBeGreaterThan(initialCount);
    
    // Verify chat name was generated based on context
    const chatNames = await page.locator('[data-testid="chat-name"]').allTextContents();
    const hasGeneratedName = chatNames.some(name => name.includes('Hello Qianwen') || name === 'New Chat');
    expect(hasGeneratedName).toBe(true);
    
    // Verify message appears in chat
    const chatContent = await page.locator('[role="region"][aria-label="Chat messages"]').textContent();
    expect(chatContent).toContain('Hello Qianwen!');
    expect(chatContent).toContain('Hello! How can I help you today?');
  });
});
