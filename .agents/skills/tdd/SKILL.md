---
name: tdd
description: Use before writing or modifying any .ts or .tsx file. Enforces test-first workflow (Red→Green→Refactor), co-located test file convention, and deploy gate.
---

# TDD Enforcement — Replit Agent Workflow

Every code change in this project follows **Red → Green → Refactor**. Tests come first, always — not as an afterthought.

The test stack is already configured: Vitest (globals mode) + Testing Library + MSW.

```
npm test            # single run (CI / deploy gate)
npm run test:watch  # watch mode for TDD
```

## Critical rules (read before writing any code)

1. **Test before implementation** — never create the implementation file before the `.test.ts(x)`. RED must happen before GREEN.
2. **Co-location required** — the test file lives in the same directory as the source, same name: `Button.tsx` → `Button.test.tsx`.
3. **Confirm RED** — run `npm test` and see the test fail before implementing. Expected failure is "cannot find module" or an assertion error — not a syntax error.
4. **Run lint after every change — and fix all errors before proceeding** — after modifying any `.ts` or `.tsx` file: run `npm run lint:fix` first (auto-fixes what it can), then `npm run lint` to confirm zero errors. You cannot mark a task as done or move to the next step while lint errors remain. Deploy will fail if lint is not clean.
5. **Deploy gate** — `npm run lint` and `npm test` must both pass before any deploy, no exceptions.

## Anti-patterns

- Creating implementation and tests at the same time
- Not running `npm test` in RED mode to confirm the failure
- Using `it.skip` or `xit` to work around failing tests
- Skipping `npm run lint` after changes and leaving errors for the build to catch
- Running only `lint:fix` without checking `lint` afterwards — auto-fix doesn't catch everything

---

## File Convention

Test files live **next to the source file** they test, same directory. Never in a separate `__tests__/` folder.

```
src/
  hooks/
    useAxios.tsx
    useAxios.test.tsx           ← named after the hook
  utils/
    api/
      transform.ts
      transform.test.ts         ← named after the module
  components/
    GlobalLoading/
      index.tsx
      GlobalLoading.test.tsx    ← named after the component, NOT index.test.tsx
    Button/
      Button.tsx
      Button.test.tsx
```

Naming: `<ComponentName>.test.tsx` or `<utilName>.test.ts`. Never name a test file `index.test.tsx` — use the actual component or module name so tabs are identifiable in the editor.

---

## The Workflow — Follow This Every Time

### 1. Write the failing test (RED)

Before touching implementation, create the `.test.ts(x)` file and write a test that describes the behavior you're about to build. Run `npm test` and confirm it **fails with a clear reason** (not a syntax error — an assertion failure or "cannot find module").

The test should read like a specification: what does this code do, from the caller's point of view?

```ts
// Button.test.tsx — written BEFORE Button.tsx exists
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

it('calls onClick when clicked', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Save</Button>);
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(onClick).toHaveBeenCalledOnce();
});
```

### 2. Implement to make the test pass (GREEN)

Write the minimum code that makes the test pass. Don't add untested behavior yet. Run `npm test` — it must pass.

### 3. Refactor (if needed)

Clean up the implementation without changing behavior. Run `npm test` again — must still pass.

---

## What to Test

### Components

Focus on behavior the user sees, not implementation details:

- Renders the right content given props
- Responds correctly to user interactions (click, type, submit)
- Shows/hides elements based on state
- Calls callbacks when expected

```ts
it('shows error message when submission fails', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);
  await user.type(screen.getByLabelText('Email'), 'bad@email');
  await user.click(screen.getByRole('button', { name: 'Login' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email');
});
```

### Hooks

Use `renderHook` from `@testing-library/react`. Wrap in a provider if the hook depends on context.

```ts
import { renderHook, waitFor } from '@testing-library/react';

it('returns data after successful fetch', async () => {
  const { result } = renderHook(() => useWorkspaces());
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toHaveLength(2);
});
```

### Utilities / Pure Functions

Test every branch — happy path, edge cases, invalid inputs:

```ts
it('returns null for null input', () => {
  expect(formatCurrency(null)).toBeNull();
});

it('formats positive numbers with two decimal places', () => {
  expect(formatCurrency(1500)).toBe('$1,500.00');
});

it('formats negative numbers correctly', () => {
  expect(formatCurrency(-50)).toBe('-$50.00');
});
```

### API Calls (MSW)

Override handlers per-test with `server.use(...)`. The MSW server is already wired up in `src/test/setup.ts` — it resets between tests automatically.

```ts
import { server } from '@src/test/mocks/server';
import { http, HttpResponse } from 'msw';

it('renders workspace names from API', async () => {
  server.use(
    http.get('/api/workspaces', () =>
      HttpResponse.json([{ id: '1', name: 'Alpha' }, { id: '2', name: 'Beta' }])
    )
  );
  render(<WorkspaceList />);
  expect(await screen.findByText('Alpha')).toBeInTheDocument();
  expect(await screen.findByText('Beta')).toBeInTheDocument();
});

it('shows error state when API fails', async () => {
  server.use(
    http.get('/api/workspaces', () => HttpResponse.error())
  );
  render(<WorkspaceList />);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
});
```

---

## Common Gotchas

- **MUI `Backdrop` hides children from accessibility queries** — elements inside `<Backdrop>` are wrapped with `aria-hidden="true"`. Use `{ hidden: true }` to find them: `screen.getByRole("progressbar", { hidden: true })`.
- **MUI exit transitions keep elements in the DOM** — components like `Snackbar`, `Dialog`, and `Drawer` use slide/fade-out animations. In jsdom there are no real CSS transitions, so the element stays in the DOM until the transition timeout fires (~195ms). Use `waitFor` when asserting disappearance: `await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument())`.
- **jsdom resolves color names to RGB** — `color: "green"` becomes `rgb(0, 128, 0)` in `toHaveStyle` assertions. Use the computed value.

---

## What NOT to Test

| Skip | Why |
|------|-----|
| `*.d.ts` / pure type files | TypeScript compiler handles this |
| Constants with no logic (`ROUTES`, `COLORS`, plain enums) | Nothing to assert — no behavior |
| Style-only files (`.css`, theme tokens) | No logic |
| `src/test/mocks/*` | Test infrastructure itself |
| Snapshot tests | Break on any UI change and don't express intent |
| Component internals (state variable names, unexported functions) | Test behavior, not implementation — internals can change without breaking the contract |
| Third-party component behavior (MUI `<Dialog>`, `<Button>`, `<TextField>`, animations) | Not our code — don't test that the Dialog closes with an animation, test that your logic calls onClose |

A file is testable if it has **logic**: branching, transformations, side effects, state. If a file is just declarations, skip it.

---

## Modifying Existing Code

**File already has a test:** run existing tests first to understand coverage, then write a failing test for the new behavior, then implement.

**File has no test:** before making any change, create the test file and write characterization tests for the current behavior. This protects against regressions. Then add your new test, then implement.

Never modify a file and leave it without a test. Every `.ts`/`.tsx` file that contains logic must have a corresponding `.test.ts(x)`.

---

## Deploy Gate

`npm test` must pass before any deploy. No exceptions.

If tests fail:
1. Read the failure output — understand why
2. Fix the code or the test (never skip or comment out a failing test)
3. Run `npm test` again to confirm green
4. Then proceed with the deploy

Do not use `--passWithNoTests`, `it.skip`, or `xit` to bypass failures.

---

## Checklist — Before Marking Any Task Done

- [ ] Test file exists co-located next to the source file
- [ ] Tests failed (RED) before implementing
- [ ] Tests pass (GREEN) after implementing
- [ ] `npm run lint` passes with zero errors
- [ ] `npm test` passes with zero failures
- [ ] No tests were skipped without explicit justification in a comment
