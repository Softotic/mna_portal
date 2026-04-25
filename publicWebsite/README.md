# MNA Public Website

This directory contains the public-facing website for the MNA Portal. It is a separate React/Vite application from the admin panel.

## Local development

1. Install dependencies:
   ```bash
   cd publicWebsite
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit `http://localhost:4173` to view the public site.

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Notes

- The public website fetches content from the backend at `http://localhost:8000/api/`.
- The public site is managed through the admin panel and displays dynamic landing page settings and news updates.
