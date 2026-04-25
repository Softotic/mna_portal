# MNA Admin Panel

This directory contains the admin panel frontend for the MNA Portal.

## Local development

1. Install dependencies:
   ```bash
   cd adminPanel
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:5173` to access the admin panel.

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Notes

- The admin panel communicates with the backend API at `http://localhost:8000`.
- This app is separate from `publicWebsite/`, which is the public-facing landing site.
