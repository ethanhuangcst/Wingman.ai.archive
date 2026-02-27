import { test, expect } from '@playwright/test';

test.describe('Predefined Prompts Management', () => {
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

  // US-002-001: Navigate to Prompt Management page
  test('navigates to Prompt Management page when Manage Prompts button is clicked', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');

    // Find and click the Manage Prompts button
    // Note: The actual button text may vary, let's use a more flexible selector
    const manageButton = page.locator('text="Manage"');
    await expect(manageButton).toBeVisible();
    await manageButton.click();

    // Wait for navigation to predefined-prompts
    await page.waitForURL('/predefined-prompts');
    await expect(page).toHaveURL('/predefined-prompts');

    // Check if the page title is correct
    await expect(page.locator('h1')).toHaveText('Edit your prompts');
  });

  // US-002-002: Create new prompt
  test('creates new prompt when Create button is clicked', async ({ page, request }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Navigate to predefined-prompts page
    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Click Create New Prompt button (icon only)
    const createButton = page.locator('button[aria-label="Create new prompt"]');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Fill in the form
    const nameInput = page.locator('input[placeholder="Enter prompt name"]');
    const textInput = page.locator('textarea[placeholder="Enter prompt text"]');
    const saveButton = page.locator('button:has-text("Create Prompt")');

    await expect(nameInput).toBeVisible();
    await expect(textInput).toBeVisible();
    await expect(saveButton).toBeVisible();

    const promptName = `Test Prompt ${Date.now()}`;
    const promptText = `This is a test prompt created at ${new Date().toISOString()}`;

    await nameInput.fill(promptName);
    await textInput.fill(promptText);
    await saveButton.click();

    // Wait for success message
    await expect(page.locator('.bg-green-50')).toBeVisible();
    await expect(page.locator('.bg-green-50')).toHaveText('Prompt created successfully');

    // Check if the prompt appears in the list
    await expect(page.locator(`text=${promptName}`)).toBeVisible();

    // Verify the prompt was actually created in the database
    const response = await request.get('/api/prompts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.prompts).toBeInstanceOf(Array);

    const createdPrompt = data.prompts.find((p: any) => p.name === promptName);
    expect(createdPrompt).toBeTruthy();
    expect(createdPrompt.text).toBe(promptText);
  });

  test('displays no prompts message when no prompts exist', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Navigate to predefined-prompts page
    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Check if the no prompts message is displayed
    const noPromptsMessage = page.locator('text="No predefined prompts yet"');
    await expect(noPromptsMessage).toBeVisible({ timeout: 10000 });
  });

  test('allows editing existing prompt', async ({ page, request }) => {
    // First, create a prompt using the API
    const createResponse = await request.post('/api/prompts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Prompt to Edit',
        text: 'Original text'
      }
    });

    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);
    const promptId = createData.prompt.id;

    // Login and navigate to predefined-prompts page
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Find and click the Edit button for the created prompt
    const editButton = page.locator(`text="Prompt to Edit"`).locator('..').locator('button[aria-label="Edit prompt"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Update the prompt
    const nameInput = page.locator('input[placeholder="Enter prompt name"]');
    const saveButton = page.locator('button:has-text("Save Changes")');

    await nameInput.fill('Updated Prompt Name');
    await saveButton.click();

    // Wait for success message
    await expect(page.locator('.bg-green-50')).toBeVisible();
    await expect(page.locator('.bg-green-50')).toHaveText('Prompt updated successfully');

    // Check if the updated prompt appears in the list
    await expect(page.locator('text="Updated Prompt Name"')).toBeVisible();
  });

  // US-002-009: Save button disabled when no changes
  test('disables Save button when no changes in edit form', async ({ page, request }) => {
    // First, create a prompt using the API
    const createResponse = await request.post('/api/prompts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Test Prompt',
        text: 'Test text'
      }
    });

    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);

    // Login and navigate to predefined-prompts page
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Find and click the Edit button for the created prompt
    const editButton = page.locator(`text="Test Prompt"`).locator('..').locator('button[aria-label="Edit prompt"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Check if Save button is disabled (no changes made)
    const saveButton = page.locator('button:has-text("Save Changes")');
    await expect(saveButton).toBeDisabled();

    // Make a change and check if Save button is enabled
    const nameInput = page.locator('input[placeholder="Enter prompt name"]');
    await nameInput.fill('Updated Test Prompt');
    await expect(saveButton).toBeEnabled();

    // Revert the change and check if Save button is disabled again
    await nameInput.fill('Test Prompt');
    await expect(saveButton).toBeDisabled();

    // Cancel the edit
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();
  });

  // US-002-012: Delete prompt
  test('deletes prompt when Delete button is clicked in edit form', async ({ page, request }) => {
    // First, create a prompt using the API
    const createResponse = await request.post('/api/prompts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Prompt to Delete',
        text: 'Text to delete'
      }
    });

    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);

    // Login and navigate to predefined-prompts page
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Find and click the Edit button for the created prompt
    const editButton = page.locator(`text="Prompt to Delete"`).locator('..').locator('button[aria-label="Edit prompt"]');
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await editButton.click();

    // Find and click the Delete button in the edit form
    const deleteButton = page.locator('button:has-text("Delete")');
    await expect(deleteButton).toBeVisible();

    // Handle the confirmation dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await deleteButton.click();

    // Wait for success message
    await expect(page.locator('.bg-green-50')).toBeVisible();
    await expect(page.locator('.bg-green-50')).toHaveText('Prompt deleted successfully');

    // Check if the prompt is no longer in the list
    await expect(page.locator('text="Prompt to Delete"')).not.toBeVisible();
  });

  // US-002-013: Return to Wingman Panel
  test('returns to Wingman Panel when return button is clicked', async ({ page }) => {
    // Login and navigate to predefined-prompts page
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');

    // Find and click the return button
    const returnButton = page.locator('button[aria-label="Return to wingman panel"]');
    await expect(returnButton).toBeVisible({ timeout: 10000 });
    await returnButton.click();

    // Wait for navigation to wingman-panel
    await page.waitForURL('/wingman-panel');
    await expect(page).toHaveURL('/wingman-panel');
  });

  // US-002-015: Network error when loading prompts
  test('displays error message when network error occurs while loading prompts', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    // Intercept the API call to prompts and mock a network error
    await context.route('/api/prompts', route => {
      route.abort('failed');
    });

    // Navigate to predefined-prompts page
    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Check if error message is displayed
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('.bg-red-50')).toHaveText('An error occurred while fetching prompts');

    // Check if create button is still available
    const createButton = page.locator('button[aria-label="Create new prompt"]');
    await expect(createButton).toBeVisible();
  });

  // US-002-016: Network error when saving prompt
  test('displays error message when network error occurs while saving prompt', async ({ page, context }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Click Create New Prompt button
    const createButton = page.locator('button[aria-label="Create new prompt"]');
    await expect(createButton).toBeVisible();
    await createButton.click();

    // Fill in the form
    const nameInput = page.locator('input[placeholder="Enter prompt name"]');
    const textInput = page.locator('textarea[placeholder="Enter prompt text"]');
    
    await nameInput.fill('Test Prompt');
    await textInput.fill('Test text');

    // Intercept the API call to prompts and mock a network error
    await context.route('/api/prompts', route => {
      if (route.request().method() === 'POST') {
        route.abort('network');
      } else {
        route.continue();
      }
    });

    // Click Save button
    const saveButton = page.locator('button:has-text("Create Prompt")');
    await saveButton.click();

    // Check if error message is displayed
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('.bg-red-50')).toHaveText('An error occurred while saving prompt');

    // Check if form is still open
    await expect(nameInput).toBeVisible();

    // Cancel the form
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();
  });

  // US-002-017: Network error when deleting prompt
  test('displays error message when network error occurs while deleting prompt', async ({ page, request, context }) => {
    // First, create a prompt using the API
    const createResponse = await request.post('/api/prompts', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      data: {
        name: 'Prompt to Delete',
        text: 'Text to delete'
      }
    });

    expect(createResponse.status()).toBe(200);
    const createData = await createResponse.json();
    expect(createData.success).toBe(true);

    // Login and navigate to predefined-prompts page
    await page.goto('/login');
    await page.fill('input[type="email"]', testUserEmail);
    await page.fill('input[type="password"]', testUserPassword);
    await page.click('button[type="submit"]');

    await page.goto('/predefined-prompts');
    await page.waitForURL('/predefined-prompts');

    // Find and click the Edit button for the created prompt
    const editButton = page.locator(`text="Prompt to Delete"`).locator('..').locator('button[aria-label="Edit prompt"]');
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Intercept the API call to prompts and mock a network error
    await context.route('/api/prompts', route => {
      if (route.request().method() === 'DELETE') {
        route.abort('network');
      } else {
        route.continue();
      }
    });

    // Find and click the Delete button in the edit form
    const deleteButton = page.locator('button:has-text("Delete")');
    await expect(deleteButton).toBeVisible();

    // Handle the confirmation dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await deleteButton.click();

    // Check if error message is displayed
    await expect(page.locator('.bg-red-50')).toBeVisible();
    await expect(page.locator('.bg-red-50')).toHaveText('An error occurred while deleting prompt');

    // Check if prompt is still in the list
    await expect(page.locator('text="Prompt to Delete"')).toBeVisible();

    // Cancel the edit
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();
  });
});
