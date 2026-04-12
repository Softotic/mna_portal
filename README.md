# MNA Portal Project

This is a full-stack portal for MNA covering User Management, Role-Based Access Control (RBAC), and Schemes Management. 

The stack involves a Django + Django Rest Framework (DRF) backend and a React + Vite + Material UI frontend, with a PostgreSQL database.

## Prerequisites

- Node.js ≥ 18
- Python ≥ 3.10
- PostgreSQL database running locally

---

## 1. Backend Setup

1. **Navigate to the Backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Mac/Linux
   # venv\Scripts\activate   # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install django djangorestframework djangorestframework-simplejwt django-cors-headers django-filter python-decouple psycopg2-binary django-ratelimit
   ```

4. **Configure Database:**
   Create an `.env` file in the `backend/` root directory. By default, it's expecting a PostgreSQL database named `mna_portal_db` with user `postgres` and password `root` on `localhost:5432`. Ensure that matches your local PostgreSQL setup.

   Example `.env` content:
   ```env
   SECRET_KEY=your_secret_key_here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   DB_NAME=mna_portal_db
   DB_USER=postgres
   DB_PASSWORD=root
   DB_HOST=localhost
   DB_PORT=5432
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

## 2. Frontend Setup

1. **Navigate to the Frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The React application will run on `http://localhost:5173`.

---

## Accessing the Application

- **Frontend URL:** `http://localhost:5173`
- **Default Superadmin Login:**
  - **Email:** `admin@mna.gov.pk`
  - **Password:** `Admin@123`

You can use this default admin user to start managing the system, creating departments, schemes, custom roles, and users with granular permissions.

---
 
 ## 3. Vercel Deployment (Full Stack)
 
 This project is configured for a unified deployment on Vercel.
 
 ### Deployment Steps:
 1. **Connect your Git repository** to Vercel.
 2. **Environment Variables**: Set the following in Vercel Dashboard:
    - `SECRET_KEY`: A random secure string.
    - `DATABASE_URL`: Your production PostgreSQL URL (e.g., from Neon.tech).
    - `DEBUG`: `False`
    - `ALLOWED_HOSTS`: `.vercel.app`
 3. **Build Settings**: Vercel will automatically detect the root `vercel.json` and configure:
    - **Backend**: Python 3.10 runtime for `config.wsgi`.
    - **Frontend**: Static build for `frontend/`.
 
 ### Key Features
 - **RBAC**: Advanced role-based access control out of the box. Configurable roles with varied permissions (View, Add, Edit, Delete).
 - **JWT Authentication**: Secured with expiring tokens and rotation.
 - **Premium UI**: Uses Material UI, fully customized with aesthetic glassmorphism, responsive navigation components, and clear notifications/alerts.
 - **One-Click Deployment**: Unified routing via `vercel.json`.
