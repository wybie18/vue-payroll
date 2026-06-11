# Performance Patterns

These improvements should be applied where they fit naturally — not forced into every file. Each one trades a small amount of code complexity for a measurable runtime or bundle-size win, so it's worth a one-line comment explaining the "why" if it's not obvious (e.g. `// shallowRef: this dataset is large and replaced wholesale, never mutated in place`).

## Prefer `computed` over methods for template-derived values

A method called in a template re-runs on _every_ render. A `computed` only re-runs when its reactive dependencies change, and caches the result in between.

```html
<!-- Before: recalculates on every render -->
<p>{{ formatTotal() }}</p>

<!-- After: cached until `items` changes -->
<p>{{ formattedTotal }}</p>
```

```js
// Before
function formatTotal() {
  return items.value.reduce((sum, i) => sum + i.price, 0).toFixed(2)
}

// After
const formattedTotal = computed(() => items.value.reduce((sum, i) => sum + i.price, 0).toFixed(2))
```

## `v-show` vs `v-if`

`v-if` adds/removes the element from the DOM (cheap toggle, expensive create/destroy). `v-show` toggles `display: none` (expensive initial render, cheap toggle). For elements that toggle frequently — tabs, dropdowns, modals that open/close often — `v-show` avoids repeated mount/unmount cost.

## `v-once` and `v-memo`

- `v-once` renders an element/subtree once and never updates it again — good for content that's truly static after initial render (e.g. a header derived from a prop that never changes).
- `v-memo="[dep1, dep2]"` skips re-rendering a subtree unless one of the listed dependencies changed — useful for expensive list items where most updates don't actually affect that particular row.

```html
<div v-for="item in list" :key="item.id" v-memo="[item.id === selectedId]">
  <!-- expensive row content that only cares whether it's the selected one -->
</div>
```

## Avoid unnecessary deep reactivity

`reactive()` and `ref()` on objects/arrays make every nested property reactive, which has a cost for large structures. If something is large and either replaced wholesale (not mutated in place) or never needs to be reactive at all, use a lighter-weight tool:

- `shallowRef` / `shallowReactive` — only the top-level is reactive; good for big datasets fetched from an API and replaced as a whole.
- `markRaw` — opts an object out of reactivity entirely; good for third-party library instances (charting libraries, map instances, etc.) stored in component state.
- `Object.freeze` — for static lookup data/config that never changes.

## Lazy-load routes and heavy components

Route-level code splitting keeps the initial bundle small:

```js
// Before
import Dashboard from './views/Dashboard.vue'

// After
const Dashboard = () => import('./views/Dashboard.vue')
```

For heavy components used conditionally (large charts, rich text editors, modals), `defineAsyncComponent` does the same thing at the component level:

```js
const ChartPanel = defineAsyncComponent(() => import('./ChartPanel.vue'))
```

## Debounce/throttle high-frequency handlers

Handlers attached to `input`, `scroll`, `resize`, or `mousemove` can fire dozens of times per second. If the handler does anything non-trivial (API calls, heavy computation, DOM measurement), debounce or throttle it.

```js
import { useDebounceFn } from '@vueuse/core' // or a small custom debounce

const search = useDebounceFn((query) => {
  fetchResults(query)
}, 300)
```

If `@vueuse/core` (or a similar utility library) isn't already a dependency, a small local debounce helper is fine — don't add a new dependency just for this unless the user wants it.

## Tree-shakeable imports

Importing an entire library when only a few functions are used bloats the bundle.

```js
// Before: pulls in all of lodash
import _ from 'lodash'
_.debounce(...)

// After: only pulls in what's used
import debounce from 'lodash-es/debounce'
debounce(...)
```

Most modern UI/utility libraries support named ESM imports — check whether the project's existing imports are already doing this consistently, and align stragglers.

## Virtualize long lists

Rendering hundreds/thousands of `v-for` items at once is a common source of jank. If a list can realistically grow large (and isn't already paginated), suggest a virtual-scroll approach (e.g. `vue-virtual-scroller` or `@tanstack/vue-virtual`) rather than implementing one from scratch — but treat this as a suggestion to discuss with the user rather than a silent dependency addition, since it usually requires restructuring the list's markup.

## Hoist static values out of reactive scope

An object or array literal that's truly constant (never depends on props/state) doesn't need to be recreated — and doesn't need to be reactive — every time `setup()` runs. Module-level constants avoid both costs:

```js
// Before: recreated (and made reactive) on every component instance
const STATUS_OPTIONS = reactive([
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
])

// After: created once, shared across instances
const STATUS_OPTIONS = Object.freeze([
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
])
```
