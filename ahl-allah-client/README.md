# Ahl Allah Client

A comprehensive React frontend application for the Ahl Allah Node.js backend, built with TypeScript, Tailwind CSS, and React Router.

## Features

- **Complete CRUD Operations**: Full Create, Read, Update, Delete functionality for all resources
- **Authentication**: Login, Register (Normal User & Mohafez), Forgot Password
- **User Management**: View, edit, and manage users with role-based access
- **Organizations**: Create and manage organizations with member management
- **Notes**: Mohafez-only feature to create and manage notes for students
- **Complaints**: Create complaints, update status, and add ratings
- **Calls**: Schedule and manage calls between students and mohafez
- **Sessions**: Admin-only session management
- **Admin Panel**: Approve/reject mohafez applications, view statistics, manage user roles

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications
- **React Context** for state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Navigate to the project directory:
```bash
cd ahl-allah-client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/         # Reusable components (DataTable, Modal, Layout, etc.)
├── contexts/          # React Context providers (AuthContext)
├── pages/             # Page components (Login, Dashboard, Users, etc.)
├── services/          # API service layer
├── types/             # TypeScript type definitions
├── App.tsx            # Main application component with routing
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## API Integration

The frontend connects to the backend API at `http://localhost:60772/api` (configured via Vite proxy).

All API calls are handled through the `apiService` in `src/services/api.ts`, which includes:
- Automatic token injection
- Error handling
- Automatic redirect on 401 (unauthorized)

## Authentication

- **Login**: POST `/api/auth/login`
- **Register**: POST `/api/auth/register` (Normal User)
- **Register Mohafez**: POST `/api/auth/register-mohafez`
- **Forgot Password**: POST `/api/auth/forgot-password`

Tokens are stored in `localStorage` and automatically included in API requests.

## Protected Routes

Routes are protected based on user roles:
- **Admin**: Sessions, Admin Panel
- **Mohafez**: Notes
- **All Authenticated Users**: Dashboard, Users, Organizations, Complaints, Calls

## Available Pages

1. **Login** (`/login`) - User authentication
2. **Register** (`/register`) - Normal user registration
3. **Register Mohafez** (`/register-mohafez`) - Mohafez registration
4. **Forgot Password** (`/forgot-password`) - Password recovery
5. **Dashboard** (`/dashboard`) - Overview and quick access
6. **Users** (`/users`) - User management (Admin can edit/delete)
7. **Organizations** (`/organizations`) - Organization management
8. **Notes** (`/notes`) - Notes management (Mohafez only)
9. **Complaints** (`/complaints`) - Complaint management
10. **Calls** (`/calls`) - Call scheduling and management
11. **Sessions** (`/sessions`) - Session management (Admin only)
12. **Admin Panel** (`/admin`) - Admin dashboard with statistics and pending approvals

## Components

### DataTable
A reusable table component for displaying paginated data with edit/delete actions.

### Modal
A flexible modal component for forms and confirmations.

### Layout
Main layout component with sidebar navigation and top bar.

### ProtectedRoute
Route guard component that ensures authentication and role-based access.

## Features

### Toast Notifications
All user actions show toast notifications:
- Success (green)
- Error (red)
- Warning (yellow)

### Pagination
List pages support pagination with Previous/Next navigation.

### Delete Confirmations
Delete actions show confirmation modals to prevent accidental deletions.

### Responsive Design
The UI is fully responsive and works on mobile, tablet, and desktop devices.

## Development

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Add navigation link in `src/components/Layout.tsx` if needed

### Adding New API Endpoints

1. Add the method to `src/services/api.ts`
2. Use the method in your component/page
3. Handle loading states and errors appropriately

## License

This project is part of the Ahl Allah platform.

