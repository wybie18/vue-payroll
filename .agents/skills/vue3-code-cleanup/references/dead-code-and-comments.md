# Dead Code & Comment Cleanup

The goal of this pass is to make the file shorter and easier to read by removing things that no longer do anything — without removing things that merely _look_ like they don't do anything. See `SKILL.md` Step 3 before deleting anything from this list.

## Remove

- **Unused imports** — components, composables, utilities, types, icons, CSS/SCSS files no longer referenced anywhere in the file.
- **Unused local state** — `ref`/`reactive`/`computed` declarations, plain variables, and Options API `data()` fields that are never read in the template or script.
- **Unused functions/methods** — including event handlers that aren't bound to anything anymore, and helper functions only the function you just removed used to call.
- **Unused props** — declared in `defineProps`/`props: {}` but never read in script or template _and_ never passed by any parent (check parent usages first — see SKILL.md Step 3).
- **Unused emits** — declared in `defineEmits`/`emits: []` but never called with `emit(...)`, _and_ no parent listens for them.
- **Unused components** — registered/imported but never used in the template.
- **Unused CSS** — selectors and classes in `<style>` that no longer match anything in the template (including dynamic `:class` bindings — check those before removing).
- **Commented-out code** — old implementations, alternative approaches, disabled blocks. If it's been sitting there, it's almost always safe to delete; git history preserves it if it's ever needed again.
- **Leftover debug statements** — `console.log`, `debugger`, temporary `alert()` calls used during development. Be more careful with `console.warn`/`console.error` calls that look like intentional error reporting — those are often meant to stay.
- **Empty or trivial lifecycle hooks** — e.g. `onMounted(() => {})` or `created() {}` with nothing inside.
- **Obvious/restating comments** — comments that just restate what the very next line of code does, e.g.:

  ```js
  // increment the counter
  counter.value++

  // loop through users
  for (const user of users) { ... }
  ```

  These add noise without adding information.

- **Stale comments** — comments that describe behavior the code no longer has (e.g. referencing a prop, function, or approach that's since been renamed or removed). A wrong comment is worse than no comment, so either fix it to match the current code or remove it.

## Keep

- **Comments that explain _why_, not _what_** — workarounds for browser/library quirks, links to issues/tickets, non-obvious business rules ("refunds must be processed before midnight UTC per finance policy"). These are exactly the kind of context that's expensive to reconstruct later.
- **TODO / FIXME / HACK markers** — don't silently delete these even if they look old. If one seems clearly resolved or irrelevant, you can mention it in your summary and ask the user whether to remove it, but don't make that call unilaterally.
- **JSDoc / type-doc comments on exported functions, composables, and components** — these are part of the public API documentation, even if they look "verbose".
- **License/copyright headers.**
- **Tooling directives** — `// eslint-disable-next-line ...`, `// @ts-expect-error ...`, `<!-- prettier-ignore -->`, etc. These exist for a reason even if it's not obvious from the surrounding code; if removing one causes a new lint/type error in Step 5, that's your signal it was load-bearing.
- **`<!-- TODO -->`-style placeholders for genuinely incomplete sections** — e.g. a component that intentionally renders a placeholder while a feature is mid-development.

## A note on "unused" exports from composables/utils

A function exported from `src/composables/useThing.ts` might have zero usages _in the file you're looking at_ but several usages elsewhere in the project. Always grep the whole project for the export name before removing it, and treat anything exported from a barrel/`index.ts` file as more likely to be a public API than an internal-only helper.
