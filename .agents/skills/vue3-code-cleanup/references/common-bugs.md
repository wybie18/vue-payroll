# Common Vue 3 Bugs & Reactivity Pitfalls

These are the issues that show up over and over in Vue 3 codebases — most are quick, low-risk fixes once spotted, but a few require understanding what the surrounding code is trying to do. If you're not confident a "fix" actually preserves the intended behavior, flag it instead of changing it.

## Reactivity loss from destructuring

Destructuring a `reactive()` object (or props) breaks the reactive connection — the destructured variables become plain values frozen at that moment.

```js
// Bug: `count` is a snapshot, not reactive
const state = reactive({ count: 0 })
const { count } = state // count will never update

// Fix: keep the reference, or use toRefs
const { count } = toRefs(state) // count is now a ref that stays in sync
```

The same applies to props: `const { title } = props` loses reactivity. Use `toRefs(props)` or reference `props.title` directly (e.g. inside a `computed`).

## Missing `.value` on refs

In `<script setup>`, refs need `.value` everywhere except the template (where Vue unwraps them automatically). A common bug is forgetting `.value` in script code, or — less commonly — manually adding `.value` inside the template.

```js
// Bug: comparing the ref object itself, not its value
if (isLoading) { ... }

// Fix
if (isLoading.value) { ... }
```

## Mutating props directly

Props are meant to be one-way. Mutating them directly works in some cases but produces warnings and breaks the parent's expectations.

```js
// Bug
props.items.push(newItem)

// Fix: emit an event, or work on a local copy
emit('update:items', [...props.items, newItem])
// or, for local-only derived state:
const localItems = ref([...props.items])
```

## `v-if` and `v-for` on the same element

In Vue 3, `v-if` has **higher precedence** than `v-for` on the same element, which is the opposite of Vue 2. If both appear together, the `v-if` condition can't access the `v-for` variable, causing a runtime error or silently wrong output.

```html
<!-- Bug: `user` is not defined in the v-if's scope -->
<li v-for="user in users" v-if="user.active" :key="user.id">{{ user.name }}</li>

<!-- Fix: filter before the loop, or wrap in a template -->
<li v-for="user in activeUsers" :key="user.id">{{ user.name }}</li>

<!-- or -->
<template v-for="user in users" :key="user.id">
  <li v-if="user.active">{{ user.name }}</li>
</template>
```

## Missing or unstable `:key` in `v-for`

A missing `:key`, or using the array index as the key for a list that can be reordered/filtered/inserted into, causes Vue to misidentify which DOM nodes correspond to which data — leading to stale input values, broken transitions, and subtle rendering bugs.

```html
<!-- Bug: index breaks if `items` is ever reordered or filtered -->
<Item v-for="(item, index) in items" :key="index" :item="item" />

<!-- Fix: use a stable, unique identifier from the data -->
<Item v-for="item in items" :key="item.id" :item="item" />
```

## Leaked listeners, timers, and subscriptions

Anything set up in `onMounted` (or `created`) — `addEventListener`, `setInterval`/`setTimeout`, third-party library subscriptions, `ResizeObserver`/`IntersectionObserver` — should be torn down in `onUnmounted`. Left running, these cause memory leaks and "ghost" handlers firing after a component is gone.

```js
let intervalId
onMounted(() => {
  intervalId = setInterval(refreshData, 5000)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  clearInterval(intervalId)
  window.removeEventListener('resize', onResize)
})
```

This also applies to `watch`/`watchEffect` that create their own subscriptions inside — make sure any cleanup happens via the `onCleanup` callback or `onUnmounted`.

## `v-model` on custom components

Vue 3's default `v-model` maps to a `modelValue` prop and `update:modelValue` event (not `value`/`input` like Vue 2). A component that declares `props: ['value']` and emits `input` won't work with plain `v-model` in Vue 3.

```js
// Fix for a custom input component
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
```

For multiple `v-model`s on one component, use named ones: `v-model:title="..."` ↔ `props.title` / `emit('update:title', ...)`.

## Watchers that just mirror state

A `watch` whose only job is to copy one ref's value into another, with no side effect, can usually be replaced by a `computed` — simpler, and avoids ordering/timing bugs.

```js
// Often unnecessary
const doubled = ref(0)
watch(count, (val) => {
  doubled.value = val * 2
})

// Simpler and less error-prone
const doubled = computed(() => count.value * 2)
```

## `this` left over in `<script setup>`

`<script setup>` has no `this`. Leftover `this.something` from an Options API → Composition API migration is a runtime error, not just a style issue — search for `this.` if the file mixes patterns.

## Async `setup()` without `<Suspense>`

A component using `async setup()` (or top-level `await` in `<script setup>`) needs a `<Suspense>` boundary in its parent, or it won't render as expected. If you find one without a corresponding `<Suspense>`, flag it — fixing it may require a template change in a different file.

## Template refs accessed before mount

Reading a template ref's `.value` outside of `onMounted` (or before the element it points to has rendered, e.g. inside a `v-if="false"` branch) returns `null` and is a common source of "Cannot read property of null" errors.
