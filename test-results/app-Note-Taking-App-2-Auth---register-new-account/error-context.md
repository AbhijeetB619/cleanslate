# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.test.ts >> Note Taking App >> 2. Auth - register new account
- Location: tests/app.test.ts:48:2

# Error details

```
TimeoutError: forURL: Timeout 10000ms exceeded.
=========================== logs ===========================
waiting for navigation to "http://localhost:3000/dashboard" until "load"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
  navigated to "http://localhost:3000/authenticate?mode=signup"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "CleanSlate" [ref=e3] [cursor=pointer]:
      - /url: /dashboard
    - button "Toggle theme" [ref=e5]:
      - img [ref=e6]
  - main [ref=e8]:
    - generic [ref=e9]:
      - generic [ref=e10]:
        - img [ref=e12]
        - heading "CleanSlate" [level=1] [ref=e14]
        - paragraph [ref=e15]: Create your account
      - tablist [ref=e16]:
        - tab "Sign in" [ref=e17]
        - tab "Sign up" [selected] [ref=e18]
      - tabpanel [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]: Name
          - textbox "Name" [ref=e22]:
            - /placeholder: Your name
        - generic [ref=e23]:
          - generic [ref=e24]: Email
          - textbox "Email" [ref=e25]:
            - /placeholder: you@example.com
        - generic [ref=e26]:
          - generic [ref=e27]: Password
          - textbox "Password" [ref=e28]:
            - /placeholder: ••••••••
        - button "Create account" [ref=e29]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const BASE_URL = 'http://localhost:3000';
  4   | const TEST_PASSWORD = 'TestPass123!';
  5   | const TEST_NAME = 'Test User';
  6   | 
  7   | let counter = 0;
  8   | function uniqueEmail() {
  9   |   return `test_${Date.now()}_${++counter}@example.com`;
  10  | }
  11  | 
  12  | async function register(page: Page, email = uniqueEmail()) {
  13  |   await page.goto(`${BASE_URL}/authenticate?mode=signup`);
  14  |   await page.locator('#name').fill(TEST_NAME);
  15  |   await page.locator('#email').fill(email);
  16  |   await page.locator('#password').fill(TEST_PASSWORD);
  17  |   await page.getByRole('button', { name: 'Create account' }).click();
> 18  |   await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
      |             ^ TimeoutError: forURL: Timeout 10000ms exceeded.
  19  |   return email;
  20  | }
  21  | 
  22  | async function login(page: Page, email: string) {
  23  |   await page.goto(`${BASE_URL}/authenticate`);
  24  |   await page.locator('#email').fill(email);
  25  |   await page.locator('#password').fill(TEST_PASSWORD);
  26  |   await page.getByRole('button', { name: 'Sign in' }).click();
  27  |   await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
  28  | }
  29  | 
  30  | async function createNote(page: Page, title: string, content: string) {
  31  |   await page.goto(`${BASE_URL}/notes/new`);
  32  |   await page.locator('#title').click();
  33  |   await page.locator('#title').fill(title);
  34  |   const editor = page.locator('.ProseMirror');
  35  |   await editor.click();
  36  |   await page.keyboard.type(content);
  37  |   await page.getByRole('button', { name: 'Save Note' }).click();
  38  |   await page.waitForURL(/\/notes\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
  39  | }
  40  | 
  41  | test.describe('Note Taking App', () => {
  42  |   test('1. Auth - unauthenticated redirect to /authenticate', async ({ page }) => {
  43  |     await page.goto(BASE_URL);
  44  |     await expect(page).toHaveURL(/authenticate/);
  45  |     await page.screenshot({ path: 'tests/screenshots/01-auth-redirect.png' });
  46  |   });
  47  | 
  48  |   test('2. Auth - register new account', async ({ page }) => {
  49  |     await register(page);
  50  |     await expect(page).toHaveURL(/dashboard/);
  51  |     await page.screenshot({ path: 'tests/screenshots/02-registered.png' });
  52  |   });
  53  | 
  54  |   test('3. Auth - sign out and sign back in', async ({ page }) => {
  55  |     const email = await register(page);
  56  |     await page.getByRole('button', { name: 'Logout' }).click();
  57  |     await expect(page).toHaveURL(/authenticate/);
  58  |     await page.screenshot({ path: 'tests/screenshots/03-signed-out.png' });
  59  | 
  60  |     await login(page, email);
  61  |     await expect(page).toHaveURL(/dashboard/);
  62  |     await page.screenshot({ path: 'tests/screenshots/03-signed-in.png' });
  63  |   });
  64  | 
  65  |   test('4. Dashboard - empty state and New Note button visible', async ({ page }) => {
  66  |     await register(page);
  67  |     await expect(page.getByRole('link', { name: 'New Note' })).toBeVisible();
  68  |     await expect(page.getByText('No notes yet')).toBeVisible();
  69  |     await page.screenshot({
  70  |       path: 'tests/screenshots/04-dashboard-empty.png',
  71  |     });
  72  |   });
  73  | 
  74  |   test('5. Create note', async ({ page }) => {
  75  |     await register(page);
  76  |     await createNote(page, 'My First Note', 'This is test content.');
  77  |     await expect(page.getByText('My First Note')).toBeVisible();
  78  |     await page.screenshot({ path: 'tests/screenshots/05-note-created.png' });
  79  |   });
  80  | 
  81  |   test('6. Note appears on dashboard', async ({ page }) => {
  82  |     await register(page);
  83  |     await createNote(page, 'Dashboard Test Note', 'Content here.');
  84  |     await page.goto(`${BASE_URL}/dashboard`);
  85  |     await expect(page.getByText('Dashboard Test Note')).toBeVisible();
  86  |     await page.screenshot({
  87  |       path: 'tests/screenshots/06-dashboard-with-note.png',
  88  |     });
  89  |   });
  90  | 
  91  |   test('7. Edit note', async ({ page }) => {
  92  |     await register(page);
  93  |     await createNote(page, 'Edit Test Note', 'Original content.');
  94  |     // Now on /notes/[id] page — click Edit
  95  |     await page.getByRole('link', { name: 'Edit' }).click();
  96  |     await page.waitForURL(/\/edit$/);
  97  |     await page.screenshot({ path: 'tests/screenshots/07-edit-page.png' });
  98  | 
  99  |     // Click title to set isTouched, change value
  100 |     await page.locator('#title').click();
  101 |     await page.locator('#title').fill('Edited Note Title');
  102 |     await page.getByRole('button', { name: 'Save Changes' }).click();
  103 |     await page.waitForURL(/\/notes\/[a-zA-Z0-9-]+$/, { timeout: 10000 });
  104 |     await expect(page.getByText('Edited Note Title')).toBeVisible();
  105 |     await page.screenshot({ path: 'tests/screenshots/07-note-edited.png' });
  106 |   });
  107 | 
  108 |   test('8. Public sharing toggle and public view', async ({ page }) => {
  109 |     await register(page);
  110 |     await createNote(page, 'Share Test Note', 'Public content here.');
  111 |     // Click Edit to go to edit page where sharing toggle lives
  112 |     await page.getByRole('link', { name: 'Edit' }).click();
  113 |     await page.waitForURL(/\/edit$/);
  114 | 
  115 |     const sharingToggle = page.locator('button[aria-pressed]');
  116 |     await expect(sharingToggle).toHaveAttribute('aria-pressed', 'false');
  117 |     await sharingToggle.click();
  118 |     await expect(sharingToggle).toHaveAttribute('aria-pressed', 'true');
```