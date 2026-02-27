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

test.describe('US-004-002: Initiate a new chat on Wingman - Panel initialization', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await login(page);
    
    // Clear chat history before each test
    await clearChatHistory(page);
    
    // Wait a bit after clearing
    await page.waitForTimeout(1000);
  });

  test('Should initialize a new chat when wingman-panel is loaded for the first time', async ({ page }) => {
    // Navigate to wingman-panel
    await page.goto('http://localhost:3000/wingman-panel');
    
    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
