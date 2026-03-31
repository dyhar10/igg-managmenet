# Rules for IGG Management Project

This document establishes the ground rules and architectural guidelines to keep the project's development aligned and consistent.

## 🏛️ Architecture Overview

### Backend (Node.js + Prisma)
The backend is designed to be **lightweight and dependency-minimal**. It avoids using bloated frameworks like Express in favor of a custom, highly performant `Router`.

1.  **NO EXPRESS**: Always use the custom `Router` (`src/utils/router.js`).
2.  **Layered Separation**:
    *   **Repository (`/repositories`)**: Encapsulates Prisma queries. No business logic here.
    *   **Service (`/services`)**: Business logic, data validation, and normalization. This is where you `throw` errors.
    *   **Controller (`/controllers`)**: Orchestrates HTTP requests. Parses body, calls service, sends response.
    *   **Routes (`/routes`)**: Defines endpoint mappings.
3.  **Error Handling**:
    *   Throw an `Error` object.
    *   Always attach a `statusCode` property (e.g., `error.statusCode = 400`).
    *   The router handles catching and formatting these errors.
4.  **Standard Response Format**:
    ```json
    {
      "message": "Human readable status",
      "data": { ... }
    }
    ```
5.  **Documentation**:
    *   Any endpoint change **MUST** be reflected in `backend/docs/API.md` and `backend/docs/openapi.yaml`.
    *   The Swagger UI (`/api-docs`) loads from the local YAML.

### Frontend (React + Vite)
1.  **API Integration**:
    *   All API calls must go through `src/api/client.js`.
    *   Use the existing `fetchWithAuth` pattern to handle JWT tokens automatically.
    *   Handle `loading` and `error` states for every fetch operation to ensure smooth UX.
2.  **State Management**:
    *   Keep it simple: standard React `useState` and `useEffect`.
    *   Context API is reserved for global cross-cutting concerns (Auth, Theme).
3.  **UI/UX Standards**:
    *   **Premium Aesthetics**: Use modern design principles—vibrant gradients, subtle glassmorphism, and clear spacing.
    *   **Interactive**: Use hover effects and micro-animations for feedback.
    *   **Consistency**: Sidebar navigation must use `Layout.jsx`. Standardize headers and card styles.

---

## 🛠️ Feature Development Workflow

Follow this sequence for every new feature:

1.  **Schema**: Update `backend/prisma/schema.prisma` → `npx prisma migrate dev`.
2.  **Backend Logic**: Repository → Service → Controller → Route registration.
3.  **API Docs**: Update `API.md` and `openapi.yaml`.
4.  **Frontend API**: Add function to `frontend/src/api/client.js`.
5.  **Frontend UI**: Create/Update page in `frontend/src/pages/`.
6.  **Navigation**: Register route in `App.jsx` and nav item in `Layout.jsx`.

---

## 🚫 Forbidden Practices

-   Installing heavy backend dependencies (Express, Lodash, etc.) without explicit reason.
-   Mixing database queries directly in Controllers or Services (Keep them in Repositories).
-   Directly using `fetch` inside JSX components (Use the central `apiClient`).
-   Leaving large commented-out code blocks or `console.log` in production-ready files.
-   Skipping API documentation for "small" changes.
