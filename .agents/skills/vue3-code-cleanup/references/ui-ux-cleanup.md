# UI/UX Cleanup

This pass is about polish and consistency, not a redesign. The test for every change here: would the user recognize this as "the same screen, but tidier and more usable" — not "wait, this looks different now"? If a change would noticeably alter the look or layout, mention it in the summary even if you think it's an improvement, rather than assuming it's wanted.

## Accessibility basics

These are usually quick fixes with outsized impact:

- **Images**: every meaningful `<img>` needs a descriptive `alt`. Purely decorative images should have `alt=""` (not a missing attribute) so screen readers skip them.
- **Icon-only buttons**: a `<button>` containing only an icon needs an `aria-label` (or visually-hidden text) describing its action — e.g. `aria-label="Close dialog"`.
- **Form inputs**: every `<input>`/`<select>`/`<textarea>` needs an associated `<label>` (via `for`/`id`, or wrapping). A placeholder is not a substitute for a label.
- **Clickable `<div>`s**: a `<div @click="...">` that acts like a button should usually be a `<button>` (gets keyboard focus, Enter/Space activation, and correct semantics for free). If it must stay a `div` for layout reasons, add `role="button"`, `tabindex="0"`, and a `@keydown.enter`/`@keydown.space` handler.
- **Focus states**: don't remove `outline`/focus styles without replacing them with an equally visible alternative — keyboard users need to see what's focused.
- **Color contrast**: if you're touching colors anyway (e.g. consolidating into CSS variables), check that text/background combinations meet roughly WCAG AA contrast — but don't go on a contrast-auditing expedition unless asked.

## Consistency

- **Spacing**: look for one-off pixel values (`margin: 13px`, `padding: 7px 11px`) scattered near consistent values (`8px`, `16px`, `24px`) elsewhere in the same file/project — these are often typos or copy-paste drift rather than intentional. Align them to the existing scale if there is one.
- **Design tokens / CSS variables**: if the project defines CSS custom properties or a theme (e.g. `var(--color-primary)`, a Tailwind config, a Vuetify/Element Plus theme), prefer those over hardcoded hex values or magic numbers you find nearby. Don't introduce a new token system in a cleanup pass — work within what's already there.
- **Component variants**: if the same visual element (button, card, badge) is implemented slightly differently in multiple places (different padding, border-radius, font-weight) with no apparent reason, consider consolidating — but check whether the difference is intentional (e.g. a "compact" variant) before merging them.
- **Naming**: class names and component names that don't match what they actually represent (leftover from a rename) are worth fixing — but treat renames carefully if the name is referenced elsewhere (Step 3 in SKILL.md).

## Missing feedback states

- **Loading**: async data fetches that show nothing (or a blank/empty-looking UI) while pending should get a loading indicator — a spinner, skeleton, or at minimum a "Loading…" message.
- **Empty states**: lists/tables that render nothing when the data array is empty should show a friendly empty-state message instead of just... nothing, which can look like a bug.
- **Error states**: a failed fetch that's only logged to the console (or silently swallowed) leaves the user staring at stale or empty UI with no explanation. Surface a visible error message.
- **Disabled-during-action**: buttons that trigger async actions (form submit, delete, save) should be disabled (or show a spinner) while the action is in flight, to prevent double-submits.

## Forms

- Use semantic input types (`type="email"`, `type="number"`, `type="tel"`, `type="date"`) instead of generic `type="text"` where applicable — improves mobile keyboards and built-in validation.
- Validation errors should be associated with their field (visually adjacent, and ideally with `aria-describedby`) rather than shown only in a generic banner at the top.
- Required fields should be indicated (visually and with the `required` attribute / `aria-required`).

## Responsive layout

- Look for fixed `width`/`height` values (especially in `px`) on containers that hold variable-length content — these are common sources of overflow or clipping on smaller screens.
- Check that any new or adjusted spacing/sizing still makes sense at common breakpoints if the project has responsive styles (media queries, Tailwind responsive classes, etc.).

## Transitions

If you add or adjust transitions for polish, keep them subtle (150-300ms, standard easing) and consistent with any existing transition durations/easings in the project. Don't introduce new animation libraries for a cleanup pass.

## Dark mode / theming

If the project supports a theme or dark mode, make sure any styles you touch (or add) reference theme variables rather than hardcoded colors that would look wrong in the other theme.
