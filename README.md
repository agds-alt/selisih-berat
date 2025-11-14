# Selisih Berat - J&T Express

> Aplikasi pencatatan selisih berat untuk operasional logistik dengan manajemen data profesional dan tracking real-time

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-3ecf8e)](https://supabase.com/)

## Features

### Core Features
- **Weight Entry Management** - Record and track weight discrepancies with barcode scanning
- **Real-time Dashboard** - Live statistics and analytics for operational insights
- **Leaderboard System** - Gamified performance tracking for team members
- **Photo Management** - Upload and manage proof photos with Cloudinary integration
- **Data Management** - Comprehensive CRUD operations with export capabilities
- **User Authentication** - Secure JWT-based authentication with role-based access

### Technical Features
- **Progressive Web App (PWA)** - Install and use offline
- **Responsive Design** - Mobile-first approach for all device sizes
- **Error Boundaries** - Graceful error handling with user-friendly messages
- **Toast Notifications** - Real-time feedback with queue management
- **Analytics Tracking** - Built-in analytics system (extensible to GA/Mixpanel)
- **Type Safety** - Full TypeScript implementation
- **Production Ready** - Comprehensive error handling, logging, and monitoring

### User Roles
- **User** - Entry creation, view dashboard, view leaderboard
- **Admin** - All user features plus data management and photo management

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 3.4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT with bcryptjs
- **Image Upload:** Cloudinary
- **Barcode Scanner:** Quagga2
- **File Processing:** XLSX, JSZip, PapaParse
- **PWA:** next-pwa

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- Cloudinary account (for photo uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd selisih-berat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual values (see Environment Variables section below)

4. **Set up Supabase database**

   Create the following tables in your Supabase project:

   **users table:**
   ```sql
   create table users (
     id uuid default uuid_generate_v4() primary key,
     username text unique not null,
     password text not null,
     role text not null default 'user',
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

   **entries table:**
   ```sql
   create table entries (
     id uuid default uuid_generate_v4() primary key,
     user_id uuid references users(id) not null,
     barcode text not null,
     actual_weight decimal not null,
     system_weight decimal not null,
     difference decimal not null,
     notes text,
     photo_url text,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   ```

5. **Generate JWT secrets**
   ```bash
   # Generate secure random strings for JWT secrets
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```
   Add these to your `.env.local` file

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

See `.env.example` for a complete list. Key variables:

### Required
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- `JWT_SECRET` - Secret for JWT signing (min 32 chars)
- `JWT_REFRESH_SECRET` - Secret for refresh token signing
- `SESSION_SECRET` - Secret for session encryption

### Optional
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - For photo uploads
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Cloudinary preset
- `NEXT_PUBLIC_ANALYTICS_ENABLED` - Enable analytics tracking
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID

## Project Structure

```
selisih-berat/
├── app/
│   ├── (auth)/              # Authentication routes
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/         # Protected routes
│   │   ├── dashboard/
│   │   ├── entry/
│   │   ├── leaderboard/
│   │   ├── data-management/
│   │   ├── foto-management/
│   │   ├── error.tsx        # Protected routes error boundary
│   │   └── loading.tsx      # Loading states
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── entries/
│   │   ├── leaderboard/
│   │   └── photos/
│   ├── offline/             # Offline fallback page
│   ├── error.tsx            # Global error boundary
│   ├── not-found.tsx        # 404 page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles
├── components/
│   └── ui/                  # Reusable UI components
│       ├── toast.tsx
│       └── button.tsx
├── lib/
│   ├── config/
│   │   └── env.ts           # Environment configuration
│   └── analytics.ts         # Analytics tracking
├── public/
│   ├── manifest.json        # PWA manifest
│   └── sw.js               # Service worker
├── .env.example            # Environment template
├── CHANGELOG.md            # Version history
└── README.md              # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/change-password` - Change user password

### Entries
- `GET /api/entries` - List all entries (with pagination)
- `POST /api/entries` - Create new entry
- `GET /api/entries/[id]` - Get single entry
- `PUT /api/entries/[id]` - Update entry
- `DELETE /api/entries/[id]` - Delete entry
- `GET /api/entries/stats` - Get entry statistics

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard rankings

### Photos
- `POST /api/photos` - Upload photo to Cloudinary

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

### Environment Setup for Production

Ensure all required environment variables are set:
- Set `NODE_ENV=production`
- Use strong, unique secrets
- Configure CORS allowed origins
- Enable rate limiting
- Set up analytics if needed

## Development

### Run in development mode
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Run production build locally
```bash
npm run build && npm start
```

### Linting
```bash
npm run lint
```

## PWA Features

The application is a Progressive Web App with:
- Offline support
- Install to home screen
- App shortcuts
- Share target integration
- Service worker caching

To test PWA locally:
```bash
npm run build && npm start
```
Then open Chrome DevTools > Application > Service Workers

## Security

- JWT-based authentication with refresh tokens
- Password hashing with bcryptjs
- Rate limiting on login and API endpoints
- CORS protection
- Environment variable validation
- SQL injection protection via Supabase
- XSS protection via React

## Troubleshooting

### Build Errors

**Problem:** TypeScript errors during build
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Problem:** Module not found errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Runtime Errors

**Problem:** Supabase connection fails
- Check environment variables are set correctly
- Verify Supabase project is active
- Check network connectivity

**Problem:** JWT errors
- Ensure JWT_SECRET is at least 32 characters
- Check token expiration settings
- Clear localStorage and login again

**Problem:** Photo upload fails
- Verify Cloudinary credentials
- Check upload preset settings
- Ensure CORS is configured in Cloudinary

### Development Issues

**Problem:** Hot reload not working
```bash
# Restart dev server
npm run dev
```

**Problem:** Port already in use
```bash
# Use different port
PORT=3001 npm run dev
```

## Analytics

Built-in console-based analytics tracks:
- Page views
- User actions
- Errors
- Performance metrics
- Authentication events
- Entry operations

Extend with Google Analytics or Mixpanel by:
1. Set `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
2. Add your analytics ID
3. The system will automatically send events

## Performance

Optimizations implemented:
- Image optimization with Next.js Image
- Code splitting with dynamic imports
- Lazy loading components
- Service worker caching
- Gzip compression
- Minified CSS/JS

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

ISC License

## Support

For issues and questions:
- Create an issue in the repository
- Contact IT support team

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Version:** 1.0.0
**Last Updated:** November 2025
**Maintained by:** J&T Express IT Team
