# ManageMyPg - React frontend (Demo)

This is a starter React + Vite + Tailwind project for **ManageMyPg**.

Features included (demo):
- Login page (demo navigation)
- Dashboard (tiles) with clickable tiles
- My PGs: create PG, view PG tiles
- PG detail: add floors, view rooms & beds, bed color states (occupied / free / upcoming vacate)
- Mock backend using axios-mock-adapter (`src/mock.js`) with sample data
- Invoice generation using jsPDF (sample export)

## How to run locally

1. Download and unzip the project.
2. Install dependencies:
```bash
npm install
```
3. Run dev server:
```bash
npm run dev
```
4. The app runs at http://localhost:5173 by default.

## Connecting to your Spring Boot backend

The project currently uses a mock adapter. To connect to your Spring Boot + MySQL API:
- Remove the import of `src/mock.js` from `src/main.jsx`.
- Use `axios` with a baseURL (e.g., `axios.defaults.baseURL = 'http://localhost:8080'`) or create an `api.js` wrapper.
- Ensure APIs implement the expected endpoints (examples):
  - `GET /api/stats`
  - `GET /api/pgs`
  - `POST /api/pgs`
  - `GET /api/pgs/:id`
  - `POST /api/pgs/:id/floors`

## Future improvements (next steps)
- Full CRUD for floors, rooms, beds and tenant management
- Authentication (JWT) and role-based access
- WhatsApp integration (use Twilio/WhatsApp Cloud API or other provider)
- Better UI/UX polish (icons, charts, filters)
- PDF invoice template enhancement

