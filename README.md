# Dental Clinic Web Application

## Project Structure

This project follows a monorepo-style structure, separating the frontend, backend, and shared resources.

### `/client` (Frontend)
React application built with Vite.
- `src/components`: Reusable UI components.
- `src/pages`: Application routes/views.
- `src/services`: API integration layer.
- `src/context`: Global state management.

### `/server` (Backend)
Node.js + Express application.
- `src/controllers`: Request handlers.
- `src/services`: Business logic.
- `src/routes`: API endpoint definitions.
- `config/supabase.js`: Admin-level Supabase client.

### `/shared`
Code shared between client and server to ensure consistency.
- `constants`: Shared enums (Roles, Statuses).

### `/docs`
Project documentation and specifications.
