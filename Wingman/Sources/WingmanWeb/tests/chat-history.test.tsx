import { test, expect } from '@playwright/test';

test.describe('US-005-001: Historical Chat list', () => {
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

  test('should display vertical list of historical chats in left column', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Check that left column exists with Chat History header
    const chatHistoryHeader = await page.locator('h2:has-text("Chat History")');
    await expect(chatHistoryHeader).toBeVisible();

    // Check that left column exists
    const leftColumn = await page.locator('.bg-white').first();
    await expect(leftColumn).toBeVisible();
  });

  test('should display New chat button in left column', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Check that New chat button exists
    const newChatButton = await page.locator('button[aria-label="New chat"]');
    await expect(newChatButton).toBeVisible();
  });

  test('should have fixed height items in chat history list', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Check that chat history items have fixed height
    const chatItems = await page.locator('[data-testid="chat-history-item"]');
    await chatItems.first(); // Wait for at least one chat to load

    for (const item of await chatItems.all()) {
      const boundingBox = await item.boundingBox();
      expect(boundingBox?.height).toBeGreaterThan(45);
      expect(boundingBox?.height).toBeLessThan(55);
    }
  });

  test('should display chat names in history list', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Check that chat names are displayed
    const chatNames = await page.locator('[data-testid="chat-name"]');
    await expect(chatNames).toHaveCount(await page.locator('[data-testid="chat-history-item"]').count());
  });

  test('should display ... button at end of each chat item', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Check that ... buttons exist for each chat item
    const chatItems = await page.locator('[data-testid="chat-history-item"]');
    const moreButtons = await page.locator('button[aria-label="More options"]');
    await expect(moreButtons).toHaveCount(await chatItems.count()); // One for each chat
  });
});

test.describe('US-005-002: Click "..." button', () => {
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
  });

  test('should show menu with Rename and Delete options when ... button is clicked', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Find and click the first ... button
    const moreButtons = await page.locator('button[aria-label="More options"]');
    await moreButtons.first().click();

    // Check that menu appears with Rename and Delete options
    await expect(page.locator('text="Rename"')).toBeVisible();
    await expect(page.locator('text="Delete"')).toBeVisible();
  });

  test('should close menu when clicking outside', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Find and click the first ... button
    const moreButtons = await page.locator('button[aria-label="More options"]');
    await moreButtons.first().click();

    // Check that menu appears
    await expect(page.locator('text="Rename"')).toBeVisible();

    // Click outside the menu
    await page.click('h2:has-text("Chat History")');

    // Check that menu disappears
    await expect(page.locator('text="Rename"')).not.toBeVisible();
  });

  test('should delete chat when Delete option is clicked', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Mock the confirm dialog
    page.on('dialog', dialog => {
      dialog.accept();
    });

    // Check if there are any chats
    let chatItems = await page.locator('[data-testid="chat-history-item"]');
    const chatCount = await chatItems.count();
    
    if (chatCount === 0) {
      // If no chats, create one first
      await page.click('button[aria-label="New chat"]');
      chatItems = await page.locator('[data-testid="chat-history-item"]');
      await chatItems.first().waitFor();
    }

    // Get initial chat count
    const initialCount = await chatItems.count();

    // Find and click the first ... button
    const moreButtons = await page.locator('button[aria-label="More options"]');
    await moreButtons.first().click();

    // Click Delete option
    await page.click('text="Delete"');

    // Check that chat is deleted
    chatItems = await page.locator('[data-testid="chat-history-item"]');
    await expect(chatItems).toHaveCount(initialCount - 1);
  });

  test('should create new chat when New Chat button is clicked', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Wait for chats to load
    let chatItems = await page.locator('[data-testid="chat-history-item"]');
    await chatItems.first().waitFor();
    const initialCount = await chatItems.count();

    // Click New Chat button
    await page.click('button[aria-label="New chat"]');

    // Check that new chat is created
    chatItems = await page.locator('[data-testid="chat-history-item"]');
    await expect(chatItems).toHaveCount(initialCount + 1);
  });
});
