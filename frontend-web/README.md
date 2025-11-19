# Odanet Frontend

Production-ready React + TypeScript + Vite frontend for Odanet.

## Features

- ⚡️ Vite for fast development and optimized builds
- ⚛️ React 18 with TypeScript
- 🎨 Tailwind CSS for styling
- 🌐 i18next for internationalization (TR/EN)
- 🧭 React Router for navigation
- 📱 Mobile-first responsive design
- 🔒 JWT authentication with token management
- 🎯 SEO-optimized with react-helmet

## Pages

- `/` - Homepage with hero search and feed
- `/auth/login` - Login page
- `/oda-ilani/:slug` - Listing detail page
- `/profil` - User profile dashboard
- `/oda-ilani-ver` - Add listing form
- `/oda-arkadasi-ara` - Roommate search

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

All API calls use relative paths (`/api/*`) and are configured to work with the backend proxy.

Authentication is handled via JWT tokens stored in localStorage.

## Environment

- Development server: http://localhost:5000
- API base: `/api`

## Project Structure

```
src/
├── components/      # Reusable components
├── pages/          # Page components
├── utils/          # Utilities (API client, auth)
├── types/          # TypeScript types
├── locales/        # i18next translations
├── App.tsx         # Main app with routing
├── main.tsx        # Entry point
└── index.css       # Global styles
```

## Technologies

- React 18.2
- TypeScript 5.2
- Vite 5.0
- Tailwind CSS 3.3
- React Router 6.20
- i18next 23.7
- Lucide React (icons)
