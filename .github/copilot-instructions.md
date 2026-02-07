# Copilot Instructions for ManageMyPg_FE

## Project Overview
- **Framework:** React (Vite, JSX)
- **Styling:** Tailwind CSS (see `tailwind.config.cjs`, `postcss.config.cjs`)
- **Entry Point:** `src/main.jsx` mounts `App.jsx`.
- **Pages:** Located in `src/pages/` (e.g., `AdminDashboard.jsx`, `Login.jsx`, `PgDetail.jsx`).
- **Components:** Shared UI in `src/components/` (e.g., charts, headers, loaders).
- **Assets:** Static files in `src/assets/`.
- **Data:** Mock/sample data in `src/mock.js`, `src/sampleData.js`.

## Key Patterns & Conventions
- **Routing:** Managed in `App.jsx` using React Router (check for custom hooks in `src/hooks/`).
- **Charts:** Custom chart components in `src/components/` (e.g., `OwnersByCityChart.jsx`).
- **State/Props:** Data flows from page to component via props; no global state manager detected.
- **Loader Pattern:** Use `PageLoader.jsx` for loading states.
- **Column Renderers:** Use `TenantStatusColumn.jsx` for custom table columns.
- **Admin Features:** All admin-related UI in `src/pages/` prefixed with `Admin`.

## Developer Workflows
- **Start Dev Server:** `npm run dev` (Vite)
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Styling:** Use Tailwind utility classes; configure in `tailwind.config.cjs`.
- **No explicit test setup** detected—add tests in `src/` if needed.

## Integration & Extensibility
- **Add new pages:** Place in `src/pages/`, import and route in `App.jsx`.
- **Add new components:** Place in `src/components/`, use in pages as needed.
- **Mock data:** Extend `mock.js` or `sampleData.js` for local development.

## Notable Files
- `src/App.jsx`: Main app structure and routing
- `src/pages/`: All major app screens
- `src/components/`: Shared UI widgets
- `vite.config.js`: Vite build config
- `tailwind.config.cjs`: Tailwind setup

## Project-Specific Advice
- **Follow file/folder naming conventions** (PascalCase for components/pages).
- **Keep business logic in pages, UI logic in components.**
- **Use mock/sample data for local development.**
- **No backend integration** is present in this repo—API calls should be mocked or stubbed.

---
For more, see `README.md` (if present) or ask maintainers for backend/API details.
