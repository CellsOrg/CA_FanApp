# Cloud Alpacas UI Prototype — Development Rules

## 1. Goal

This is a reusable HTML/CSS/JavaScript prototype for Cloud Alpacas.

The goal is NOT to build independent pages.
Build a consistent UI system where shared components, styles, behavior,
and data are implemented once and reused.

**Preserve the approved visual design. Do not redesign it during refactoring.**

---

## 2. Project Structure

```text
pages/              Page-specific HTML
components/         Shared HTML components
assets/
  css/              All CSS
  js/               All JavaScript
  images/           Image assets
data/               Dummy data
design-system/      Design system documentation/tokens
docs/               Project documentation
```

### CSS

* `assets/css/` contains all CSS.
* Repeated colors, spacing, typography, radius, borders, etc. → CSS tokens.
* Do not create tokens for one-off values.
* Remove duplicated and unused CSS.

### JavaScript

* `assets/js/` contains all JavaScript.
* Shared behavior must be implemented **ONCE** and reused.
* Never copy-paste the same functionality between pages.
* Before creating a function, check whether an existing function can be reused or extended.
* Prefer small reusable functions and shared utilities.

Examples:
`loadComponent()`, `initBottomNav()`, `initTabs()`,
`openModal()`, `closeModal()`, `formatPrice()`, `navigateTo()`

### Components

Shared UI such as Header, Bottom Navigation, Tabs, Cards, and Modals
must live in `components/`.

Do not duplicate shared HTML in individual pages.
Load shared components through JavaScript.

---

## 3. Before Creating Anything

Before creating a new:

* CSS token
* CSS class
* JavaScript function
* component
* utility

**Check the existing project first.**

Priority:

**Reuse → Extend → Create**

Only create something new when an existing pattern cannot reasonably be reused.

---

## 4. Refactoring Rules

When converting Claude Design exports:

1. Preserve the visual design.
2. Identify repeated UI and extract shared components.
3. Identify repeated CSS values and create appropriate tokens.
4. Centralize shared JavaScript.
5. Remove duplicated / unused code.
6. Test the result against the original design.

**Do not change the design to make the code easier to implement.**

---

## 5. Documentation

Documentation is part of the implementation.

Keep code and documentation synchronized.

Update the relevant document when architecture, components,
data, user flow, or design-system decisions change.

Maintain:

* `REFACTOR_DECISIONS.md` → refactoring rules and decisions
* `COMPONENT_MAP.md` → shared components and responsibilities
* `ARCHITECTURE.md` → project structure, code architecture, and navigation/user flow (which pages link to which, how `initBottomNav()` / `initTabs()` / `navigateTo()` connect them)
* `DESIGN_SYSTEM.md` → tokens and UI rules

**Do not create a separate dummy-data document.** Dummy data used in this
prototype must reuse the same names/values already defined in the Salesforce
project's `SAMPLE_DATA.md` and `DEMO_DATASETS.md` (e.g. 이루키, 문태양, product
names, game schedule). If a value is missing there, add it to those documents
first rather than inventing a parallel data source here.

For meaningful architectural decisions:
**check existing patterns first → choose the simplest reusable approach → document the decision.**

---

## 6. Definition of Done

Before considering the work complete:

* Visual design matches the approved design.
* Shared HTML is not duplicated.
* Shared JavaScript is not duplicated.
* Repeated CSS values are appropriately tokenized.
* Unused code is removed.
* Relevant documentation is updated.
* All affected pages are tested.