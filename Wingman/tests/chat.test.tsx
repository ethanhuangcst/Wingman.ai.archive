import { test, expect } from '@playwright/test';

test.describe('Chat with Qianwen', () => {
  let testUserId: number;
  let testUserEmail: string;
  let testUserPassword: string;
  let authToken: string;

  test.beforeAll(async ({ request }) => {
    // Create a test user
    testUserEmail = `test_user_${Date.now()}@example.com`;
    testUserPassword = 'Password123!';

    // Register test user
    const registerResponse = await request.post('/api/register', {
      multipart: {
        email: testUserEmail,
        password: testUserPassword,
        name: 'Test User',
        apiKey: 'test-api-key'
      }
    });

    expect(registerResponse.status()).toBe(201);
    const registerData = await registerResponse.json();
    expect(registerData.success).toBe(true);

    // Login test user
    const loginResponse = await request.post('/api/login', {
      data: {
        email: testUserEmail,
        password: testUserPassword
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.token).toBeTruthy();
    authToken = loginData.token;

    // Get user ID from token (this would typically be done server-side)
    // For testing purposes, we'll assume the user was created
  });

  test.afterAll(async ({ request }) => {
    // Clean up test user (if API endpoint exists)
    try {
      await request.delete('/api/account', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (error) {
      console.log('Cleanup failed (expected if endpoint doesn\'t exist):', error);
    }
  });

  // US-003-001: Initiate a new chat on Wingman-Panel initialization
  test('initiates new chat when user sends first message', async ({ page, request, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Enter text in "What's in your mind?" text field
    const mindInput = page.locator('textarea');
    await expect(mindInput).toBeVisible();
    await mindInput.fill('Hello Qianwen, how are you today?');

    // Mock the chat API response
    await context.route('/api/chat', route => {
      route.fulfill({
        status: 200,
        json: {
          response: 'I am doing well, thank you for asking! How can I assist you today?'
        }
      });
    });

    // Click the Send button
    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    // Wait for the chat messages to appear
    await expect(page.locator('.bg-blue-100')).toBeVisible();
    await expect(page.locator('.bg-gray-100')).toBeVisible();

    // Check if user message is displayed
    await expect(page.locator('.bg-blue-100')).toContainText('Hello Qianwen, how are you today?');

    // Check if Qianwen's response is displayed
    await expect(page.locator('.bg-gray-100')).toContainText('I am doing well, thank you for asking! How can I assist you today?');

    // Check if timestamps are displayed
    await expect(page.locator('.text-xs.text-gray-500')).toBeVisible();
  });

  // US-003-002: Qianwen responds based on entire conversation context
  test('Qianwen responds based on conversation context', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Enter first message
    const mindInput = page.locator('textarea');
    await expect(mindInput).toBeVisible();
    await mindInput.fill('Hello Qianwen, my name is Test User');

    // Mock the first chat API response
    await context.route('/api/chat', route => {
      route.fulfill({
        status: 200,
        json: {
          response: 'Hello Test User! Nice to meet you. How can I help you today?'
        }
      });
    });

    // Click the Send button
    const sendButton = page.locator('button[aria-label="Send message"]');
    await expect(sendButton).toBeVisible();
    await sendButton.click();

    // Wait for the first response
    await expect(page.locator('.bg-gray-100')).toContainText('Hello Test User! Nice to meet you. How can I help you today?');

    // Enter second message that references the first
    await mindInput.fill('What\'s my name?');

    // Mock the second chat API response
    await context.route('/api/chat', route => {
      route.fulfill({
        status: 200,
        json: {
          response: 'Your name is Test User, as you mentioned earlier.'
        }
      });
    });

    // Click the Send button again
    await sendButton.click();

    // Wait for the second response
    await expect(page.locator('.bg-gray-100')).toHaveCount(2);
    const secondResponse = page.locator('.bg-gray-100').nth(1);
    await expect(secondResponse).toContainText('Your name is Test User, as you mentioned earlier.');
  });

  // US-003-003: Each response appears as a chat bubble with timestamp
  test('each response appears as a chat bubble with timestamp', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.fill('textarea', 'Tell me a short joke');

    // Mock the chat API response
    await context.route('/api/chat', route => {
      route.fulfill({
        status: 200,
        json: {
          response: 'Why don\'t scientists trust atoms? Because they make up everything!'
        }
      });
    });

    // Click the Send button
    await page.click('button[aria-label="Send message"]');

    // Wait for the chat messages to appear
    await expect(page.locator('.bg-blue-100')).toBeVisible();
    await expect(page.locator('.bg-gray-100')).toBeVisible();

    // Check if user message is in a blue bubble
    const userMessage = page.locator('.bg-blue-100');
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toHaveCSS('background-color', 'rgb(219, 234, 254)');
    await expect(userMessage).toHaveCSS('border-radius', '8px');

    // Check if Qianwen's response is in a gray bubble
    const assistantMessage = page.locator('.bg-gray-100');
    await expect(assistantMessage).toBeVisible();
    await expect(assistantMessage).toHaveCSS('background-color', 'rgb(243, 244, 246)');
    await expect(assistantMessage).toHaveCSS('border-radius', '8px');

    // Check if timestamps are displayed
    const timestamps = page.locator('.text-xs.text-gray-500');
    await expect(timestamps).toHaveCount(2);
    
    // Check if timestamp format is correct (should be a time string)
    const timestampText = await timestamps.nth(0).textContent();
    expect(timestampText).toMatch(/^\d{1,2}:\d{2} [AP]M$/);
  });

  // Test sending multiple messages in a conversation
  test('sends multiple messages in a conversation', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Mock the chat API responses
    let messageCount = 0;
    await context.route('/api/chat', route => {
      messageCount++;
      let responseText = '';
      
      switch (messageCount) {
        case 1:
          responseText = 'I can help you with many things! What would you like to know?';
          break;
        case 2:
          responseText = 'The capital of France is Paris.';
          break;
        case 3:
          responseText = 'Paris is also known as the City of Light.';
          break;
        default:
          responseText = 'I\'m here to help!';
      }
      
      route.fulfill({
        status: 200,
        json: {
          response: responseText
        }
      });
    });

    // Send first message
    const mindInput = page.locator('textarea');
    await mindInput.fill('Hello Qianwen!');
    await page.click('button[aria-label="Send message"]');
    await expect(page.locator('.bg-gray-100')).toContainText('I can help you with many things! What would you like to know?');

    // Send second message
    await mindInput.fill('What\'s the capital of France?');
    await page.click('button[aria-label="Send message"]');
    await expect(page.locator('.bg-gray-100')).toHaveCount(2);
    
    // Send third message
    await mindInput.fill('Tell me more about it.');
    await page.click('button[aria-label="Send message"]');
    await expect(page.locator('.bg-gray-100')).toHaveCount(3);

    // Check total number of messages
    await expect(page.locator('.rounded-lg')).toHaveCount(6); // 3 user messages + 3 assistant messages
  });

  // Test chat with predefined prompt
  test('starts chat with predefined prompt', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Wait for predefined prompts to load
    await page.waitForSelector('button:has-text("#")');

    // Click on a predefined prompt
    const firstPrompt = page.locator('button:has-text("#")').first();
    await firstPrompt.click();

    // Check if prompt text is added to input field
    const mindInput = page.locator('textarea');
    await expect(mindInput).not.toBeEmpty();

    // Mock the chat API response
    await context.route('/api/chat', route => {
      route.fulfill({
        status: 200,
        json: {
          response: 'I\'ve received your prompt. How can I help you further?'
        }
      });
    });

    // Click the Send button
    await page.click('button[aria-label="Send message"]');

    // Wait for the chat messages to appear
    await expect(page.locator('.bg-blue-100')).toBeVisible();
    await expect(page.locator('.bg-gray-100')).toBeVisible();

    // Check if prompt text is displayed as user message
    const userMessage = await page.locator('.bg-blue-100').textContent();
    expect(userMessage).toBeTruthy();

    // Check if Qianwen's response is displayed
    await expect(page.locator('.bg-gray-100')).toContainText('I\'ve received your prompt. How can I help you further?');
  });
});
