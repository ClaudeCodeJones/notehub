---

## Colours — Paper & Moss palette

These CSS variables are defined in `globals.css`. Always use them — never hardcode hex values in components.
```css
:root {
  --color-bg-primary: #fafaf8;
  --color-bg-secondary: #f0ede8;
  --color-bg-tertiary: #e8e4dc;
  --color-accent: #2d5a27;
  --color-accent-hover: #224520;
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #4a4a4a;
  --color-text-muted: #8a8580;
  --color-border: #d8d4cc;
}

.dark {
  --color-bg-primary: #1a1c18;
  --color-bg-secondary: #21241e;
  --color-bg-tertiary: #2a2e26;
  --color-accent: #5a9e52;
  --color-accent-hover: #6db864;
  --color-text-primary: #f0ede8;
  --color-text-secondary: #b8b4ac;
  --color-text-muted: #6a6760;
  --color-border: #333630;
}
```

`--color-accent` is used for: active project highlight, selected note indicator, NoteHUB logo mark, toolbar active states, and action buttons.

---

## TypeScript types
```typescript
// types/index.ts
export interface Project {
  id: string
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  project_id: string
  title: string
  content: string
  sort_order: number
  created_at: string
  updated_at: string
}
```

---

## Coding conventions

- Use `cn()` from `lib/utils.ts` for all className merging — never string concatenation
- All components are functional with typed props interfaces
- Hooks live in `/hooks` — no data fetching inside components directly
- No `useEffect` for data fetching — use the custom hooks
- Auto-save uses a 600ms debounce via `useRef<NodeJS.Timeout>` — no save buttons
- Supabase client is a singleton from `lib/supabase.ts` — never instantiate it elsewhere
- Real-time subscriptions are managed in `useRealtime.ts` — cleaned up on unmount
- Always handle loading and error states in hooks
- Use `lucide-react` for all icons — no emoji, no other icon libraries

---

## Key behaviours

### Auto-save
Notes save automatically 600ms after the user stops typing. Show "Saving..." and "Saved" status in the editor footer. Never show a save button.

### Drag to reorder
Both projects and notes are draggable via @dnd-kit. On drop, update `sort_order` in Supabase immediately. Optimistic UI — update local state first, then persist.

### Real-time sync
Supabase channel subscribes to all changes on `projects` and `notes` tables. When a remote change arrives, update React state without triggering a write back to the database (avoid infinite loops).

### New project
Clicking "New project" opens an inline input in the sidebar. On Enter or blur, save to Supabase. Assign the next colour from PROJECT_COLORS automatically.

### New note
Clicking "+" creates a blank note, saves it to Supabase immediately, and focuses the title input in the editor.

### Delete note
Delete button in editor footer shows a confirmation state ("Are you sure?") inline — no modals. Second click confirms deletion.

---

## Project dot colours
```typescript
export const PROJECT_COLORS = [
  '#7F77DD', // purple
  '#1D9E75', // teal
  '#D85A30', // coral
  '#D4537E', // pink
  '#378ADD', // blue
  '#BA7517', // amber
  '#639922', // green
  '#E24B4A', // red
  '#888780', // gray
]
```

---

## Supabase

- Client singleton in `lib/supabase.ts` using `createClient` from `@supabase/supabase-js`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- RLS is disabled — this is a single-user private app
- Real-time is enabled on both the `projects` and `notes` tables
- Always use `.eq('id', id)` for targeted updates — never update without a filter

---

## Commands
```bash
npm run dev       # start dev server on localhost:3000
npm run build     # production build
npm run lint      # ESLint check
```

---

## What NOT to do

- Never hardcode colours — always use CSS variables
- Never use `any` in TypeScript
- Never fetch data directly in a component — use hooks
- Never commit `.env.local` — it contains private Supabase keys
- Never add authentication — this app is intentionally single-user
- Never use modals — use inline confirmation patterns instead
- Never add a manual save button — auto-save only
- Never install new packages without checking if existing ones cover the need first