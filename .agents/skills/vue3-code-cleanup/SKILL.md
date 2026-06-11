---
name: vue3-code-cleanup
description: Clean up, optimize, and refactor Vue 3 code (Composition API or Options API) — remove unused imports, variables, functions, props, emits, and dead/commented-out code; trim unnecessary or stale comments; fix common Vue 3 bugs and reactivity pitfalls; improve runtime performance (computed vs methods, v-memo/v-once, lazy-loading, debouncing, watcher/listener cleanup, tree-shaking); and polish UI/UX (accessibility, spacing consistency, loading/empty/error states). Always verifies the app still builds, lints, type-checks, and behaves the same so nothing breaks. Use this whenever the user asks to "clean up", "optimize", "refactor", "tidy up", "remove unused code/comments", "improve performance", "fix bugs in", or "polish the UI/UX" of a Vue 3 component, page, or project — even if they mention only one of these aspects (e.g. "just remove the unused stuff" or "this component feels sluggish").
---

# Vue 3 Code Cleanup & Optimization

## Prime directive

The single most important rule: **the app must work at least as well after the cleanup as before.** Every change here is in service of making the code cleaner, leaner, and faster — never at the cost of breaking a feature, a route, a build, or a visual layout. When in doubt about whether something is safe to remove or change, don't guess: search the whole project for evidence, and if it's still ambiguous, leave it alone and flag it for the user instead of deleting it.

This means working in small, verifiable passes rather than one giant rewrite. A pass that breaks the build is much easier to debug (and revert) than a 500-line diff that touches everything at once.

## Step 1 — Survey the scope

Figure out what you're working with before changing anything:

- Is this a single component file, a folder of related components, or a whole project? Adapt the depth of the cleanup accordingly — a single file still benefits from passes 2-5 below, but cross-file usage checks (Step 3) become even more important since you can't see the whole picture from one file.
- If it's a project, check `package.json` for the framework setup (Vite, Vue CLI, Nuxt), the `scripts` section (lint, type-check, build, test commands), and whether it's TypeScript or JavaScript.
- Check whether `node_modules` exists. If not, and the user wants build/lint verification, ask whether you should run `npm install` (or `pnpm install` / `yarn install`, matching whichever lockfile is present) — this can take a while and needs network access, so it's worth confirming first.

## Step 2 — Establish a safety net

Before touching any files:

- If the project is a git repo, run `git status`. If there are uncommitted changes, point this out and suggest committing or stashing first so there's a clean point to diff against and revert to. Don't refuse to proceed if the user would rather not — just make sure they know the tradeoff.
- If it's not a git repo (or the user doesn't want to commit), copy the file(s) you're about to edit to a `.bak` alongside the original, or into a scratch directory, before making changes.
- Establish a baseline: run whatever combination of lint / type-check / build / test scripts exist (see "Verify" below) and note the current results. If the project already has failing tests or lint errors, that's not your problem to fix unless asked — but you need to know about it so you don't get blamed for pre-existing issues, and so you can confirm afterward that you didn't make things worse.

## Step 3 — Build a picture of usage

This is the step that prevents accidental breakage, so don't skip it even when something "obviously" looks unused.

For anything you're considering removing or renaming — a function, a composable, a prop, an emit, a CSS class, an exported type, a Pinia/Vuex store property — search **the whole project**, not just the current file, for every reference to that name:

- `grep -rn "identifierName" src/` (or the project root) catches usages in other components, composables, stores, router config, tests, and stories.
- For component **props**: search for the component's tag name (in both PascalCase and kebab-case) across the project to see what's actually passed in from parent components.
- For component **emits**: search for `@event-name` / `v-on:event-name` usages of that component.
- For **CSS classes**: check both the `<template>` and any dynamic `:class` bindings — a class might only appear as a string inside a computed or a ternary.
- For things exported from an `index.ts`/barrel file: treat them as part of the public API and be more conservative — they may be consumed by code outside the folder you're looking at, or even outside the repo if it's a library.
- Things that _look_ unused but often aren't: global properties (`app.config.globalProperties`), `provide`/`inject` keys (search for the injection key string, not a variable name), dynamically-constructed class/route/i18n-key strings, and anything referenced only via `$refs` or template refs.

Optional: for larger projects, `npx knip` can surface a project-wide report of unused files, exports, and dependencies in one shot. It's a useful starting point, but it has false positives (especially around dynamic usage), so always cross-check its findings with the manual searches above before removing anything.

If after a real search something is still ambiguous, don't delete it — leave it in place and mention it in your summary so the user can make the final call.

## Step 4 — Clean in passes

Work through these passes roughly in order, **verifying after each one** (Step 5) before moving to the next. For a small single-file cleanup you can combine passes more loosely, but for anything multi-file, keep them separate — it makes it much easier to isolate what broke if something does.

1. **Dead code & comments** — see `references/dead-code-and-comments.md`. Remove unused imports, variables, functions, props, emits, components, and CSS, plus commented-out code and stale/obvious comments, while preserving comments that explain _why_.
2. **Bug fixes** — see `references/common-bugs.md`. Look for the recurring Vue 3 footguns (reactivity loss, missing `.value`, prop mutation, `v-if`/`v-for` ordering, leaked listeners/timers, `v-model` mismatches, etc.) and fix the ones you find with confidence. If you spot something that _might_ be a bug but depends on business logic you can't verify, flag it instead of guessing at a fix.
3. **Performance** — see `references/performance-patterns.md`. Apply targeted improvements (computed vs. methods, lazy loading, debouncing, avoiding unnecessary deep reactivity, virtualizing huge lists, etc.) where they fit naturally — don't force a pattern where it doesn't apply just to tick a box.
4. **UI/UX polish** — see `references/ui-ux-cleanup.md`. Tidy up spacing/consistency, accessibility basics, and missing loading/empty/error states. Keep changes restrained and consistent with the existing design language — this pass is about polish, not a redesign, unless the user explicitly asked for one.

## Step 5 — Verify

After each pass (and definitely at the end), re-run the same checks from your Step 2 baseline:

- **Type-check**: `vue-tsc --noEmit` (or whatever the project's `type-check` script does) for TypeScript projects.
- **Lint**: `npm run lint` (or `eslint .`) — this also tends to surface unused-variable warnings that confirm your dead-code removals were safe.
- **Build**: `npm run build` (or `vite build`) — catches things the type-checker/linter miss, like template compilation errors.
- **Tests**: `npm run test` / `npm run test:unit` if present.

Compare against the baseline: anything that was passing before should still pass; anything that was failing before is OK to still be failing (but shouldn't gain _new_ failures). If a verification step fails because of your change, fix it or revert just that change before moving on — don't let failures pile up across passes.

If none of these tooling options exist (no scripts, no `node_modules`, can't install), say so, and rely more heavily on the cross-reference searches from Step 3 plus careful manual reading of the template/script for each file you touch.

## Step 6 — Summarize

End with a clear, organized summary of what changed, grouped by pass (dead code, bugs, performance, UI/UX), plus a "flagged for your review" section for anything ambiguous you deliberately left alone. For each change, a one-line "what and why" is enough — the user can read the diff for the details. If verification was run, report the results, including any pre-existing failures that were already there before you started.

## Working with a single file vs. a whole project

- **Single file**: Steps 1-2 are quick (just note whether the broader project is reachable for cross-referencing). Step 3's searches should still scan the rest of the project if it's available — a component's props/emits/exports are only safe to touch once you've checked how it's used elsewhere.
- **Whole project**: consider tackling one component/module at a time rather than editing everything simultaneously, especially for the bug-fix and performance passes — it keeps each verification cycle meaningful and any regressions easy to trace to a specific change.
