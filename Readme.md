# SecureDesk

SecureDesk is a role-based dashboard application with a separate Express MVC backend and a Vite + React frontend. It supports secure login, JWT authentication, role-based access control, and CRUD workflows for Super Admin, Admin, and User roles.

## Stack

- `Backend/`: Express, MongoDB, Mongoose, JWT, bcrypt, MVC structure
- `Frontend/`: Vite, React `.jsx`, Tailwind CSS v4, React Router, Redux Toolkit

## Features

- Single login page with email and password
- Password hashing with `bcryptjs`
- JWT-based authentication
- Role-based dashboard redirects
- Super Admin CRUD for Admins
- Super Admin CRUD for Users under any Admin
- Admin CRUD for only their own Users
- User dashboard with task CRUD
- Public signup with role selection
- Secret coupon checks for admin and super admin self-signup
- Glassmorphism UI with Tailwind CSS on the frontend
- Frontend route protection with React Router guards
- API protection with backend JWT and RBAC middleware
- Search and pagination for listings
- Deployment-ready setup for Vercel frontend and Render backend

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
│       ├── seeds/
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
│   ├── vercel.json
│   └── vite.config.mjs
├── render.yaml
└── README.md
```

## Frontend structure notes

- Redux Toolkit is used for auth and session restoration
- React Router handles route protection by role
- Tailwind CSS v4 is loaded through `src/styles/index.css`
- The Vite Tailwind plugin is configured in `Frontend/vite.config.mjs`
- CRUD modules stay inside feature folders so the code is easy to follow
- Shared UI pieces live under `src/components`

## Deployment

### Vercel frontend

Create a Vercel project with `Frontend` as the root directory.

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`
- Environment variable: `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`

`Frontend/vercel.json` includes a rewrite to `index.html` so React Router routes such as `/login` and `/register` keep working after deployment.

### Render backend

The repo includes a Render Blueprint in `render.yaml` for the Express API.

Recommended steps:

1. Create a new Web Service on Render from this repository.
2. Use the Blueprint or point the service root directory to `Backend`.
3. Set the required environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `SUPER_ADMIN_EMAIL`
   - `SUPER_ADMIN_PASSWORD`
4. Optionally set:
   - `FRONTEND_URL_PATTERNS`
   - `ADMIN_SIGNUP_COUPON`
   - `SUPER_ADMIN_SIGNUP_COUPON`
   - `SUPER_ADMIN_NAME`
   - `SUPER_ADMIN_PHONE`

Use `FRONTEND_URL` for your primary Vercel production URL or custom domain. If you also want preview deployments to reach the API, set `FRONTEND_URL_PATTERNS` to a wildcard pattern that matches your Vercel preview URLs, for example `https://securedesk-*.vercel.app`.

## Setup

### 1. Backend env

Copy `Backend/.env.example` to `Backend/.env` and update the values. `FRONTEND_URL` should point to your main frontend origin, and `FRONTEND_URL_PATTERNS` can be used for wildcard preview domains such as Vercel preview URLs.

### 2. Frontend env

Copy `Frontend/.env.example` to `Frontend/.env`. For production on Vercel, set `VITE_API_BASE_URL` to your Render backend URL plus `/api`.

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

## Registration coupons

Privileged self-signup coupons live in `Backend/src/seeds/registrationCoupons.js`.

- `user` signup does not need a coupon
- `admin` signup requires the admin coupon
- `super-admin` signup requires the super admin coupon

You can edit the seeded defaults in that file, or override them with:

- `ADMIN_SIGNUP_COUPON`
- `SUPER_ADMIN_SIGNUP_COUPON`

## API summary

### Auth

- `POST /api/auth/register`
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
