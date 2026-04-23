# Issue #42 Detail Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authenticated favorite/visit actions to the buteco detail page with a clear anonymous login CTA, deterministic fixture-mode auth for E2E, and coverage for critical states.

**Architecture:** Keep the detail page as a Server Component that reads buteco data plus user-specific action state on the server. Render a focused client action panel for authenticated interaction and a link-based CTA for anonymous users. Extend fixture mode with a mocked session path so E2E can cover both anonymous and authenticated flows without depending on live NextAuth.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, NextAuth v5, Prisma, Jest, Testing Library, Playwright

---

### Task 1: Auth-Aware Detail Read Model

**Files:**
- Modify: `apps/web/lib/__tests__/public-butecos.test.ts`
- Create: `apps/web/lib/__tests__/detail-actions.test.ts`
- Modify: `apps/web/lib/public-butecos.ts`
- Create: `apps/web/lib/detail-actions.ts`

- [ ] **Step 1: Write the failing tests**
- [ ] **Step 2: Run the Jest targets and verify expected failures**
- [ ] **Step 3: Implement the minimal session/state helper and detail read model**
- [ ] **Step 4: Re-run the Jest targets and verify they pass**
- [ ] **Step 5: Commit**

### Task 2: Detail Page and Action Panel

**Files:**
- Create: `apps/web/components/butecos/buteco-action-panel.tsx`
- Create: `apps/web/components/butecos/__tests__/buteco-action-panel.test.tsx`
- Create: `apps/web/app/(public)/butecos/[slug]/__tests__/page.test.tsx`
- Modify: `apps/web/app/(public)/butecos/[slug]/page.tsx`

- [ ] **Step 1: Write the failing component and page tests**
- [ ] **Step 2: Run the Jest targets and verify expected failures**
- [ ] **Step 3: Implement the minimal authenticated and anonymous UI states**
- [ ] **Step 4: Re-run the Jest targets and verify they pass**
- [ ] **Step 5: Commit**

### Task 3: Route Handler Validation for Detail Actions

**Files:**
- Modify: `apps/web/app/api/butecos/__tests__/route.test.ts`
- Modify: `apps/web/app/api/butecos/route.ts`

- [ ] **Step 1: Write the failing route tests for payload validation and detail-flow expectations**
- [ ] **Step 2: Run the Jest target and verify expected failures**
- [ ] **Step 3: Implement the minimal route changes**
- [ ] **Step 4: Re-run the Jest target and verify it passes**
- [ ] **Step 5: Commit**

### Task 4: Deterministic E2E Coverage

**Files:**
- Modify: `apps/web/e2e/public-flows.spec.ts`
- Modify: `apps/web/playwright.config.ts`
- Modify: `apps/web/lib/detail-actions.ts`

- [ ] **Step 1: Write the failing anonymous and mocked-authenticated detail E2E tests**
- [ ] **Step 2: Run the Playwright targets and verify expected failures**
- [ ] **Step 3: Implement the minimal fixture-mode mock session support**
- [ ] **Step 4: Re-run the Playwright targets and verify they pass**
- [ ] **Step 5: Commit**
