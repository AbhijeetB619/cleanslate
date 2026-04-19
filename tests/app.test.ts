import { test, expect, type Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const TEST_PASSWORD = 'TestPass123!';
const TEST_NAME = 'Test User';

let counter = 0;
function uniqueEmail() {
  return `test_${Date.now()}_${++counter}@example.com`;
}

async function register(page: Page, email = uniqueEmail()) {
  await page.goto(`${BASE_URL}/authenticate?mode=signup`);
  await page.locator('#name').fill(TEST_NAME);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  return email;
}

async function login(page: Page, email: string) {
  await page.goto(`${BASE_URL}/authenticate`);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

async function createNote(page: Page, title: string, content: string) {
  await page.goto(`${BASE_URL}/notes/new`);
  await page.locator('#title').click();
  await page.locator('#title').fill(title);
  const editor = page.locator('.ProseMirror');
  await editor.click();
  await page.keyboard.type(content);
  await page.getByRole('button', { name: 'Save Note' }).click();
  await page.waitForURL(/\/notes\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
}

test.describe('Note Taking App', () => {
  test('1. Auth - unauthenticated redirect to /authenticate', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/authenticate/);
    await page.screenshot({ path: 'tests/screenshots/01-auth-redirect.png' });
  });

  test('2. Auth - register new account', async ({ page }) => {
    await register(page);
    await expect(page).toHaveURL(/dashboard/);
    await page.screenshot({ path: 'tests/screenshots/02-registered.png' });
  });

  test('3. Auth - sign out and sign back in', async ({ page }) => {
    const email = await register(page);
    await page.getByRole('button', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/authenticate/);
    await page.screenshot({ path: 'tests/screenshots/03-signed-out.png' });

    await login(page, email);
    await expect(page).toHaveURL(/dashboard/);
    await page.screenshot({ path: 'tests/screenshots/03-signed-in.png' });
  });

  test('4. Dashboard - empty state and New Note button visible', async ({ page }) => {
    await register(page);
    await expect(page.getByRole('link', { name: 'New Note' })).toBeVisible();
    await expect(page.getByText('No notes yet')).toBeVisible();
    await page.screenshot({
      path: 'tests/screenshots/04-dashboard-empty.png',
    });
  });

  test('5. Create note', async ({ page }) => {
    await register(page);
    await createNote(page, 'My First Note', 'This is test content.');
    await expect(page.getByText('My First Note')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/05-note-created.png' });
  });

  test('6. Note appears on dashboard', async ({ page }) => {
    await register(page);
    await createNote(page, 'Dashboard Test Note', 'Content here.');
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page.getByText('Dashboard Test Note')).toBeVisible();
    await page.screenshot({
      path: 'tests/screenshots/06-dashboard-with-note.png',
    });
  });

  test('7. Edit note', async ({ page }) => {
    await register(page);
    await createNote(page, 'Edit Test Note', 'Original content.');
    // Now on /notes/[id] page — click Edit
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.waitForURL(/\/edit$/);
    await page.screenshot({ path: 'tests/screenshots/07-edit-page.png' });

    // Click title to set isTouched, change value
    await page.locator('#title').click();
    await page.locator('#title').fill('Edited Note Title');
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.waitForURL(/\/notes\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
    await expect(page.getByText('Edited Note Title')).toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/07-note-edited.png' });
  });

  test('8. Public sharing toggle and public view', async ({ page }) => {
    await register(page);
    await createNote(page, 'Share Test Note', 'Public content here.');
    // Click Edit to go to edit page where sharing toggle lives
    await page.getByRole('link', { name: 'Edit' }).click();
    await page.waitForURL(/\/edit$/);

    const sharingToggle = page.locator('button[aria-pressed]');
    await expect(sharingToggle).toHaveAttribute('aria-pressed', 'false');
    await sharingToggle.click();
    await expect(sharingToggle).toHaveAttribute('aria-pressed', 'true');
    await page.screenshot({
      path: 'tests/screenshots/08-sharing-enabled.png',
    });

    // Get the public URL from the readonly input
    const publicUrlInput = page.locator('input[readonly]');
    await expect(publicUrlInput).toBeVisible();
    const publicUrl = await publicUrlInput.inputValue();
    expect(publicUrl).toMatch(/\/public\//);

    // Visit the public page
    await page.goto(publicUrl);
    await page.screenshot({ path: 'tests/screenshots/08-public-view.png' });
    await expect(page.getByText('Share Test Note')).toBeVisible();
    // No Edit or Delete buttons in public view
    await expect(page.getByRole('link', { name: 'Edit' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).not.toBeVisible();

    // Disable sharing
    await page.goBack();
    await sharingToggle.click();
    await expect(sharingToggle).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({
      path: 'tests/screenshots/08-sharing-disabled.png',
    });

    // Public URL should now return not-found
    const response = await page.request.get(publicUrl);
    expect(response.status()).toBe(404);
  });

  test('9. Delete note', async ({ page }) => {
    await register(page);
    await createNote(page, 'Delete Test Note', 'This will be deleted.');
    await page.screenshot({
      path: 'tests/screenshots/09-before-delete.png',
    });

    // Click Delete to open dialog
    await page.getByRole('button', { name: 'Delete' }).click();
    // Confirm in dialog - the second Delete button
    await page.getByRole('button', { name: 'Delete' }).last().click();

    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    await expect(page.getByText('Delete Test Note')).not.toBeVisible();
    await page.screenshot({ path: 'tests/screenshots/09-after-delete.png' });
  });

  test('10. Unauthenticated access to /dashboard redirects', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL(/authenticate/);
  });
});
