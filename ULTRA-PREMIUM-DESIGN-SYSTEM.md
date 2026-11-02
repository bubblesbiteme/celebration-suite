# Celebration Suite Ultra-Premium Design System

## Core principle

Tenant branding identifies the planner. Neutral structure protects usability. Brand colors should accent the experience, not overpower it.

## Visual rules

### Surfaces

- Canvas: warm neutral, never pure saturated brand color.
- Primary surface: near-white paper.
- Secondary surface: subtle warm tint.
- Borders: one pixel with low opacity.
- Shadows: soft and layered; avoid hard black offsets.

### Typography

- Display headings: editorial serif fallback stack.
- UI, forms and data: modern system sans-serif.
- Major headings use sentence/title case, not permanent all caps.
- Uppercase is limited to short eyebrow labels and data categories.

### Color

- Tenant primary: primary calls to action, selected states and highlights.
- Tenant secondary: controlled dark header or high-emphasis areas.
- Tenant accent: small premium details, secondary emphasis and status.
- Never apply tenant colors to all headings or entire page backgrounds.
- Always calculate a readable foreground color for tenant-defined colors.

### Controls

- One dominant primary action per working area.
- Secondary actions use neutral surfaces.
- Destructive actions are explicit and visually separated.
- Minimum touch target: 40–44 pixels.
- Avoid rows of equally loud pill buttons.

### Cards

- Cards communicate hierarchy, not decoration.
- Use border + shadow only when the element is independently actionable or grouped.
- Avoid nesting multiple heavy cards inside one another.

### Navigation

- Use line icons from one visual family.
- Do not use emoji as product navigation.
- Preserve active event context across tools.
- Provide Command/Ctrl + K for frequent users.
- Guided mode hides professional navigation noise without disabling capability.

### Client-facing screens

- The planner's identity should be clear within the first screen.
- Client actions should use plain language.
- Raw database/provider errors are never shown.
- A client should always understand the next decision, due item or action.
- Planner Preview must reflect real client permissions and branding.

### Motion

- Motion explains transitions or state changes.
- Avoid decorative motion that delays work.
- Respect `prefers-reduced-motion`.
- Page-exit progress should be subtle and never block navigation.

## Avoid

- thick black borders;
- neon color combinations across large surfaces;
- all-caps page headings;
- heavy drop shadows on every element;
- inconsistent icon families;
- visible JSON, SQL or provider errors;
- unexplained empty screens;
- duplicated navigation systems;
- full-page brand-color flooding;
- scripts injected after `</html>`;
- external font dependencies for core usability.
