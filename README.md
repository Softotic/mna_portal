# MNA Portal Project

This is a full-stack portal for MNA covering User Management, Role-Based Access Control (RBAC), and Schemes Management. 

The stack involves a Django + Django Rest Framework (DRF) backend and a React + Vite + Material UI frontend, with a PostgreSQL database.

## Prerequisites

- Node.js ≥ 18
- Python ≥ 3.12 (the deployment runtime is defined in `backend/runtime.txt`)
- PostgreSQL database running locally

---

## 1. Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate one virtual environment:**

   If another environment is already active (its name appears at the start of
   your terminal prompt), run `deactivate` before creating this one. Do not
   create `backend/venv` while the project-level `.venv` is active.

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Mac/Linux
   # venv\Scripts\activate   # Windows
   ```

3. **Install dependencies:**
   ```bash
   python -m pip install --upgrade pip
   python -m pip install -r requirements.txt
   python -m pip check
   ```

   If pip reports a missing `cacert.pem`, deactivate the environment, recreate
   it with `python3 -m venv --clear venv`, activate it again, and repeat this
   step. This indicates an incomplete pip installation, not a Django error.

4. **Configure Database:**
   Create an `.env` file in the `backend/` root directory.
 
   Example `.env` content:
   ```env
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DATABASE_URL=postgresql://postgres:root@localhost:5432/mna_portal_db
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
   ```

5. **Run migrations and seed the database:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   python manage.py seed_data
   ```

6. **Start the backend server:**
   ```bash
   python manage.py runserver
   ```
   The API will run on `http://localhost:8000/api/`.

---

## 2. Admin Panel Setup

**Important:** Make sure the backend server is running on `http://localhost:8000` before starting the admin panel.

1. **Navigate to the Admin Panel directory:**
   ```bash
   cd adminPanel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The admin panel will run on `http://localhost:5173`.
   - API requests to `/api` are automatically proxied to `http://localhost:8000`

---

## Local Development Workflow

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   source venv/bin/activate  # or appropriate activate command
   python manage.py runserver
   ```

2. **Terminal 2 - Admin Panel:**
   ```bash
   cd adminPanel
   npm run dev
   ```

3. **Terminal 3 - Public Website:**
   ```bash
   cd publicWebsite
   npm run dev
   ```

4. Open the apps in your browser:
   - Admin Panel: `http://localhost:5173` or `http://localhost:5173/admin`
   - Public Website: `http://localhost:4173`

5. Login to the admin panel with:
   - **Email:** `admin@mna.gov.pk`
   - **Password:** `Admin@123`

---

## Accessing the Application

- **Admin Panel URL:** `http://localhost:5173`
- **Public Website URL:** `http://localhost:4173`
- **Backend API:** `http://localhost:8000/api/`
- **Default Superadmin Login:**
  - **Email:** `admin@mna.gov.pk`
  - **Password:** `Admin@123`

You can use this default admin user to start managing the system, creating schemes, custom roles, and users with granular permissions.

---
 
 ## 4. Vercel Deployment (Full Stack)
 
 This project is configured for a unified deployment on Vercel.
 
 ### Deployment Steps:
 1. **Connect your Git repository** to Vercel.
 2. **Environment Variables**: Set the following in Vercel Dashboard:
    - `SECRET_KEY`: A random secure string.
    - `DATABASE_URL`: Your production PostgreSQL URL (e.g., from Neon.tech).
    - `DEBUG`: `False`
    - `ALLOWED_HOSTS`: `.vercel.app`
 3. **Automatic Database Setup**:
    - Migrations are automatically run when the first request hits the backend (no manual setup needed).
    - Initial data (admin user, roles, modules) is seeded on first deployment.
    - Default admin credentials:
      - **Email:** `admin@mna.gov.pk`
      - **Password:** `Admin@123`
 4. **Build Settings**: Vercel will automatically detect the root `vercel.json` and configure:
    - **Backend**: Python 3.12 runtime for `config.wsgi`.
    - **Admin Panel**: Static build from `adminPanel/`.
    - **Public Website**: Static build from `publicWebsite/`.
 
 ### Key Features
 - **RBAC**: Advanced role-based access control out of the box. Configurable roles with varied permissions (View, Add, Edit, Delete).
 - **JWT Authentication**: Secured with expiring tokens and rotation.
 - **Premium UI**: Uses Material UI, fully customized with aesthetic glassmorphism, responsive navigation components, and clear notifications/alerts.
 - **One-Click Deployment**: Unified routing via `vercel.json`.
