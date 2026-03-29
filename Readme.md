# SecureDesk

SecureDesk is a role-based dashboard application with a separate Express MVC backend and a Vite + React frontend. It supports secure login, JWT authentication, role-based access control, and CRUD workflows for Super Admin, Admin, and User roles.

## Stack

- `Backend/`: Express, MongoDB, Mongoose, JWT, bcrypt, MVC structure
- `Frontend/`: Vite, React `.jsx`, React Router, Redux Toolkit

## Features

- Single login page with email and password
- Password hashing with `bcryptjs`
- JWT-based authentication
- Role-based dashboard redirects
- Super Admin CRUD for Admins
- Super Admin CRUD for Users under any Admin
- Admin CRUD for only their own Users
- User dashboard with task CRUD
- Frontend route protection with React Router guards
- API protection with backend JWT and RBAC middleware
- Search and pagination for listings

## Roles and permissions

### Super Admin

- Can create, list, update, and delete Admins
- Can create, list, update, and delete Users under any Admin

### Admin

- Can create, list, update, and delete only the Users assigned to them
- Cannot access Admin management
- Cannot access Users belonging to other Admins

### User

- Can log in to a personal dashboard
- Can create, list, update, and delete personal Tasks

## Folder structure

```text
SecureDesk/
├── Backend/
│   └── src/
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Frontend structure notes

- Redux Toolkit is used for auth and session restoration
- React Router handles route protection by role
- CRUD modules stay inside feature folders so the code is easy to follow
- Shared UI pieces live under `src/components`

## Setup

### 1. Backend env

Copy `Backend/.env.example` to `Backend/.env` and update the values. `FRONTEND_URL` should point to your Vite frontend origin, and it can be comma-separated if you want to allow more than one local dev URL.

### 2. Frontend env

Copy `Frontend/.env.example` to `Frontend/.env`.

### 3. Install dependencies

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

### 4. Start MongoDB

Run a local MongoDB instance, or replace `MONGO_URI` with a cloud connection string.

### 5. Run the apps

Backend:

```bash
cd Backend
npm run dev
```

Frontend:

```bash
cd Frontend
npm run dev
```

## Default super admin

On backend startup, the app seeds a Super Admin automatically if the configured email does not already exist.

Default example credentials from the env template:

- Email: `superadmin@example.com`
- Password: `SuperAdmin123`

## API summary

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Admin management

- `GET /api/admins`
- `POST /api/admins`
- `PUT /api/admins/:id`
- `DELETE /api/admins/:id`

### User management

- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`

### Task management

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

## Approach

- A single `User` model stores `super-admin`, `admin`, and `user` roles
- Regular users are linked to an owning admin through `createdByAdmin`
- Tasks belong only to logged-in users
- Backend access is enforced with JWT auth middleware and role checks
- Frontend access is enforced with protected React Router routes and Redux session restore

## Development thread link

This local Codex environment does not expose a shareable conversation or thread URL, so no public thread link was available to include during development.
