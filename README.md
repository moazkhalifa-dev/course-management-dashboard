# Course Management Dashboard

A single-page **Course Management Dashboard** built with **Angular 20** and **PrimeNG**. It lets users browse, search, filter, sort, create, edit, view, and delete courses, backed by a **JSON Server** mock REST API. The project demonstrates clean Angular architecture, reactive forms, services, full CRUD, and robust UI state handling (loading / empty / error).

---

## Technologies Used

| Area         | Stack                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Framework    | [Angular 20](https://angular.dev) (standalone components, signals)                                               |
| Language     | TypeScript 5.9                                                                                                   |
| Reactivity   | RxJS 7, Angular Signals                                                                                          |
| Routing      | Angular Router (lazy loading, `withComponentInputBinding`)                                                       |
| Forms        | Angular **Reactive Forms** (strongly typed)                                                                      |
| UI Library   | [PrimeNG 20](https://primeng.org) + [PrimeIcons](https://primeng.org/icons) + [PrimeFlex](https://primeflex.org) |
| Theme        | `@primeuix/themes` — Aura preset                                                                                 |
| Mock Backend | [JSON Server](https://github.com/typicode/json-server)                                                           |
| Tooling      | Angular CLI 20                                                                                                   |

---

## Features Implemented

- **Courses List** — paginated, sortable table of all courses with ID, Course Name, Instructor, Category, Duration, Price, Status, and Created Date columns.
- **Search** — live search by course name.
- **Filter** — filter courses by status (Active / Draft / Archived).
- **Sorting** — single-column sorting on every column.
- **Pagination** — client-side pagination with selectable page sizes (5 / 10 / 20).
- **Course Details** — dedicated page showing all course fields, loaded by route id.
- **Add Course** — create a new course through a reusable reactive form.
- **Edit Course** — the same form component pre-filled and used to update an existing course.
- **Delete Course** — delete with a confirmation dialog and a success toast.
- **Reactive Form Validation:**
  - Course Name — required, minimum 3 characters
  - Instructor Name — required
  - Category — required
  - Duration — required, numeric, greater than 0
  - Price — required, numeric, minimum 0
  - Status — required (Active / Draft / Archived)
  - Description — optional, maximum 500 characters
- **Application States** — Loading (skeletons), Empty ("No Courses Found"), and Error ("Something went wrong") with a Retry action, all handled by a shared `PageStateComponent`.
- **Toast Notifications** — success and error feedback for all CRUD operations.
- **Confirmation Dialog** — guards course deletion.
- **Status Tags** — color-coded status (Active → success, Draft → warning, Archived → danger).
- **Responsive Layout** — works across desktop, tablet, and mobile.

---

## Bonus Features

**Required bonus (implemented):**

- Pagination
- Sorting
- Confirmation Dialog
- Toast Notifications
- Lazy Loading (feature routes loaded on demand)

**Nice-to-have (implemented):**

- **Route Guard** — `CanDeactivate` unsaved-changes guard on the Add/Edit form.
- **Loading Skeletons** — skeleton rows while data loads.
- **Shared UI Components** — `PageStateComponent` (loading/empty/error) and `StatusTagComponent`.
- **HTTP Error Interceptor** — centralized error-to-toast handling.
- **Reusable Form Component** — one `CourseFormComponent` powering both Add and Edit.
- **Application Shell** — consistent layout and navigation structure.

---

## Folder Structure

```text
src/
├── app/
│   ├── core/                         # App-wide singletons
│   │   ├── models/
│   │   │   └── course.model.ts        # Course interface + Category/Status types
│   │   ├── interceptors/
│   │   │   └── error.interceptor.ts   # HTTP error → toast
│   │   └── guards/
│   │       └── unsaved-changes.guard.ts
│   │
│   ├── shared/                       # Reusable, presentational building blocks
│   │   ├── constants/
│   │   │   └── course.constants.ts    # Category/status options, severities
│   │   └── components/
│   │       ├── page-state/            # Loading / empty / error wrapper
│   │       └── status-tag/            # Color-coded status tag
│   │
│   ├── features/
│   │   └── courses/
│   │       ├── pages/
│   │       │   ├── list/              # Courses list (smart)
│   │       │   ├── details/           # Course details (smart)
│   │       │   └── form/              # Add/Edit page (smart)
│   │       ├── components/
│   │       │   └── course-form/       # Reusable reactive form (presentational)
│   │       ├── models/
│   │       │   └── course-form.model.ts
│   │       ├── services/
│   │       │   └── course.service.ts  # All API calls + state
│   │       └── courses.routes.ts      # Feature routes
│   │
│   ├── app.ts / app.html / app.scss   # Root shell (top bar, toast, dialog)
│   ├── app.config.ts                  # Providers (router, http, PrimeNG, theme)
│   └── app.routes.ts                  # Root routes (lazy-loads courses)
│
├── environments/                      # environment.ts / environment.prod.ts
├── styles.scss                        # Global styles
└── main.ts                            # Bootstrap

db.json                                # JSON Server seed data (10 courses)
mock-server.mjs                        # Custom id-aware JSON Server launcher
```

> **Architecture rule:** components handle UI and user interaction only; all API calls, data handling, and business logic live in services.

---

## How to Run the Project

### Prerequisites

- [Node.js](https://nodejs.org) 18.19+ (or 20+)
- npm 9+

### 1. Install dependencies

```bash
npm install
```

> If you hit a peer-dependency conflict, install with `npm install --legacy-peer-deps`.

### 2. Start the mock API (terminal 1)

```bash
npm run mock-api
```

This serves the REST API at `http://localhost:3000/courses`.

### 3. Start the Angular app (terminal 2)

```bash
npm start
```

Open `http://localhost:4200/` in your browser. The app reloads automatically on source changes.

### 4. Production build (optional)

```bash
npm run build
```

Build artifacts are emitted to `dist/`.

---

## Mock API

The application uses a lightweight mock REST API powered by JSON Server.

- Base URL: `http://localhost:3000/courses`
- Data source: `db.json`
- Seed data: 10 sample courses

### Available Endpoints

| Method | Endpoint     |
| ------ | ------------ |
| GET    | /courses     |
| GET    | /courses/:id |
| POST   | /courses     |
| PUT    | /courses/:id |
| DELETE | /courses/:id |

---

## Available Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `npm start`        | Run the Angular dev server (`ng serve`). |
| `npm run mock-api` | Start JSON Server on port 3000.          |
| `npm run build`    | Production build to `dist/`.             |
| `npm run watch`    | Development build in watch mode.         |
| `npm test`         | Run unit tests with Karma/Jasmine.       |

---

## Assumptions

- Course categories are limited to: Frontend, Backend, and Design.
- Course statuses are limited to: Active, Draft, and Archived.
- Created Date is generated automatically when a new course is created.
- Search, filtering, sorting, and pagination are implemented client-side.
- Course description is optional and limited to 500 characters.
- The Angular application runs on port 4200.
- The mock API runs on port 3000.

---

## Submission Notes

- Built for the ElectroPi Angular Technical Assignment.
- Developed using Angular 20 standalone components and PrimeNG 20.
- Focused on clean architecture, maintainability, reusable components, and proper separation of concerns.
- All application data is managed through services.
- Follow the setup instructions above to run the project locally.
