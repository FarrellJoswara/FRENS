# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Google Sign-In (local setup)

This project uses `@react-oauth/google` for a client-side Google Sign-In flow.

1. Create OAuth 2.0 credentials in the Google Cloud Console: https://console.cloud.google.com/apis/credentials
	- Create an OAuth Client ID (type: Web application)
	- Add `http://localhost:5173` (or your dev URL) to the Authorized JavaScript origins.
	- Copy the Client ID.

2. Create a `.env` file at the project root (copy from `.env.example`) and set:

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

3. Start the dev server:

```powershell
npm install; npm run dev
```

Notes:
- The app reads the client id from `import.meta.env.VITE_GOOGLE_CLIENT_ID` and wraps the app with `GoogleOAuthProvider`.
- After signing in via the Login page, the app stores the Google credential JWT in `sessionStorage` under `google_token` and redirects to `/front`.
- If the dev server warns about Node version, upgrade Node.js to >= 22.12.0.
