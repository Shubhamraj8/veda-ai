# Frontend Architecture

## `src/app`
- Next.js App Router entries and route layouts.
- `src/app/(dashboard)/layout.tsx` mounts shared shell (sidebar + topbar).
- `src/app/(dashboard)/assignments/page.tsx` composes the Assignment Dashboard screen from feature components.

## `src/components`
- App-level reusable presentation building blocks.

### `src/components/ui`
- Primitive components (`Button`, `Input`, `Card`) with reusable Tailwind variants.

### `src/components/shared`
- Cross-feature shell components (`Sidebar`, `Topbar`, `DashboardShell`).

## `src/features/assignment`
- Assignment domain module, kept isolated for scalability.

### `components`
- Dashboard-specific UI blocks (`AssignmentsDashboard`, grid, card, header, empty state).

### `hooks`
- Feature behavior hooks (`useAssignmentGenerationSocket`).

### `store`
- Zustand stores for assignment draft state and realtime generation job state.

### `services`
- Assignment API methods and mock data source for UI composition.

### `types`
- Feature domain types and screen view-model types.

## `src/lib`
- Technical foundations shared across features.

### `api`
- Axios wrapper and consistent HTTP client behavior.

### `websocket`
- Reusable socket client + shared socket lifecycle hook.

### `constants`
- Runtime-safe environment config (`NEXT_PUBLIC_*` validation).

### `utils`
- Shared utility helpers.

## `src/styles`
- Theme tokens and CSS variables used by Tailwind utility classes.
