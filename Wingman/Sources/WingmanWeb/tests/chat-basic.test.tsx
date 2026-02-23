import { test, expect } from '@playwright/test';

test.describe('US-003: Start a new chat with Qianwen AI', () => {
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

  // US-003-001: Send a message to Qianwen
  test('sends message to Qianwen', async ({ page, context }) => {
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

    // Wait for the user message to appear
    await expect(page.locator('.bg-blue-100')).toBeVisible();

    // Check if user message is displayed with chat bubble style
    const userMessage = page.locator('.bg-blue-100');
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toHaveCSS('border-radius', '8px');
    await expect(userMessage).toContainText('Hello Qianwen, how are you today?');

    // Check if "What's in your mind?" text field is cleared
    await expect(mindInput).toHaveValue('');
  });

  // US-003-002: Receive a response from Qianwen
  test('receives response from Qianwen', async ({ page, context }) => {
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

    // Check if Qianwen's response is displayed with chat bubble style
    const assistantMessage = page.locator('.bg-gray-100').last();
    await expect(assistantMessage).toBeVisible();
    await expect(assistantMessage).toHaveCSS('border-radius', '8px');
    await expect(assistantMessage).toContainText('I am doing well, thank you for asking! How can I assist you today?');

    // Check if timestamps are displayed
    await expect(assistantMessage.locator('.text-xs.text-gray-500')).toBeVisible();

    // Check if copy button is present
    await expect(assistantMessage.locator('button:has-text("Copy")')).toBeVisible();

    // Check if scroll bar is available if content exceeds viewport
    const chatContainer = page.locator('div[role="region"][aria-label="Chat messages"]');
    await expect(chatContainer).toBeVisible();
    await expect(chatContainer).toHaveCSS('overflow-y', 'auto');

    // Check if "What's in your mind?" text field is cleared
    await expect(mindInput).toHaveValue('');
  });

  // US-003-003: Ongoing conversation in one chat
  test('ongoing conversation in one chat', async ({ page, context }) => {
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

    const mindInput = page.locator('textarea');
    const sendButton = page.locator('button[aria-label="Send message"]');

    // First message
    await mindInput.fill('Hello Qianwen, what is the capital of France?');

    // Mock the first chat API response
    await context.route('/api/chat', (route, request) => {
      const requestBody = JSON.parse(request.postData());
      if (requestBody.prompt.includes('capital of France')) {
        route.fulfill({
          status: 200,
          json: {
            response: 'The capital of France is Paris. It is known as the City of Light and is famous for its art, fashion, and cuisine.'
          }
        });
      } else if (requestBody.prompt.includes('population of Paris')) {
        route.fulfill({
          status: 200,
          json: {
            response: 'As of 2023, the population of Paris is approximately 2.16 million people within the city limits, and over 12 million in the greater metropolitan area.'
          }
        });
      }
    });

    // Send first message
    await sendButton.click();

    // Wait for the first response
    await expect(page.locator('.bg-blue-100')).toBeVisible();
    const firstAssistantResponse = page.locator('.bg-gray-100').last();
    await expect(firstAssistantResponse).toBeVisible();
    await expect(firstAssistantResponse).toContainText('The capital of France is Paris');

    // Second message in the same chat
    await mindInput.fill('What is the population of Paris?');
    await sendButton.click();

    // Wait for the second response
    await expect(page.locator('.bg-blue-100').last()).toBeVisible();
    const secondAssistantResponse = page.locator('.bg-gray-100').last();
    await expect(secondAssistantResponse).toBeVisible();
    await expect(secondAssistantResponse).toContainText('As of 2023, the population of Paris');

    // Check that both messages are in the same chat
    const messages = page.locator('.bg-blue-100, .bg-gray-100');
    await expect(messages).toHaveCount(5); // 2 user messages, 2 assistant responses, plus 1 from the page background

    // Check that the conversation context is maintained
    // Note: This would require the API to actually use the context, but we're mocking it
    // For now, we'll just verify that multiple messages can be sent in the same chat
  });

  // Test sending message with Command+Enter key (US-007-003 functionality)
  test('sends message with Command+Enter key', async ({ page, context }) => {
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
    await mindInput.fill('What is the capital of France?');

    // Mock the chat API response
    await context.route('/api/chat', route => {
      route.fulfill({
        status: 200,
        json: {
          response: 'The capital of France is Paris. It is known as the City of Light and is famous for its art, fashion, and cuisine.'
        }
      });
    });

    // Press Command+Enter to send message
    await mindInput.press('Meta+Enter');

    // Wait for the chat messages to appear
    await expect(page.locator('.bg-blue-100')).toBeVisible();

    // Check if user message is displayed
    await expect(page.locator('.bg-blue-100')).toContainText('What is the capital of France?');

    // Check if Qianwen's response is displayed
    const assistantResponse = page.locator('.bg-gray-100').last();
    await expect(assistantResponse).toBeVisible();
    await expect(assistantResponse).toContainText('The capital of France is Paris');
  });

  // Test creating newline with Enter key
  test('creates newline with Enter key', async ({ page }) => {
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

    // Enter text with newline using Enter
    const mindInput = page.locator('textarea');
    await expect(mindInput).toBeVisible();
    await mindInput.fill('Hello');
    await mindInput.press('Enter');
    await mindInput.type('How are you?');

    // Check if the input contains a newline
    const inputValue = await mindInput.inputValue();
    expect(inputValue).toBe('Hello\nHow are you?');
  });
});
