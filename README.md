# QueMe Frontend

Modern queue management system frontend built with React, Vite, and Tailwind CSS.

## Features

- 🎨 Modern glassmorphic UI design
- 🔐 User authentication (Customer & Provider)
- 📱 Fully responsive design
- 🎯 Real-time queue tracking
- 🔔 Multiple notification methods
- 📊 Dashboard with analytics
- ⚡ Fast and optimized with Vite

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Vite
- Bricolage Grotesque Font

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd queme-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update `.env` with your backend API URL
```
VITE_API_URL=http://localhost:5000/api
```

5. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React Context providers
├── pages/          # Page components
├── App.jsx         # Main app component
├── main.jsx        # Entry point
└── index.css       # Global styles
```

## API Integration

All API endpoints are configured in the component files. Update the base URL in `.env`:

```
VITE_API_URL=http://your-backend-url/api
```

### Required API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### User
- `GET /api/user` - Get user profile
- `GET /api/user/bookings` - Get user bookings
- `GET /api/user/active-queue` - Get active queue status

#### Bookings
- `POST /api/bookings` - Create new booking
- `POST /api/bookings/:id/cancel` - Cancel booking

#### Provider
- `GET /api/providers` - Get all providers
- `GET /api/provider/profile` - Get provider profile
- `GET /api/provider/services` - Get provider services
- `GET /api/provider/queue` - Get queue status
- `GET /api/provider/stats` - Get provider statistics
- `POST /api/provider/services/:id/call-next` - Call next in queue
- `POST /api/provider/services/:id/pause` - Pause queue
- `POST /api/provider/queue/:id/complete` - Mark complete
- `POST /api/provider/queue/:id/noshow` - Mark no-show

#### Queue
- `GET /api/queue/status?token=:token` - Get queue status by token

## Design System

### Colors
- Primary: `#000000` (Black)
- Secondary: `#0F0F0F` (Near Black)
- Text Primary: `#EEEEEE` (Light Gray)
- Text Secondary: `#999999` (Gray)
- Accent Green: `#24FB94`
- Accent Cyan: `#13C0BD`

### Typography
- Font: Bricolage Grotesque
- Weights: 200 (Extralight), 300 (Light)

### Components
- Glass cards with backdrop blur
- Gradient buttons
- Minimalist design with subtle glows
- Noise texture overlay

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Educational purposes only.

## ============================================
## IMPORTANT NOTES FOR BACKEND INTEGRATION
## ============================================

/*
AUTHENTICATION:
- All API calls include `credentials: 'include'` for cookie-based auth
- Backend should set HTTP-only cookies for session management
- CORS must be configured to allow credentials

EXPECTED API RESPONSE FORMATS:

1. User object:
{
  id: string,
  name: string,
  email: string,
  phone: string,
  userType: 'customer' | 'provider'
}

2. Booking object:
{
  id: string,
  providerName: string,
  serviceType: string,
  date: string,
  time: string,
  status: 'upcoming' | 'completed' | 'cancelled',
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  notificationMethod: 'sms' | 'email' | 'app',
  notes: string (optional)
}

3. Active Queue object:
{
  token: string,
  tokenId: string,
  position: number,
  eta: string,
  serviceName: string
}

4. Provider object:
{
  id: string,
  businessName: string,
  businessType: string,
  address: string,
  phone: string
}

5. Error response:
{
  message: string,
  error: string (optional)
}

SECURITY CONSIDERATIONS:
- All forms include CSRF protection via cookies
- Passwords must be at least 6 characters
- Input validation on both frontend and backend
- Rate limiting recommended on API endpoints
- Sanitize all user inputs on backend

DEPLOYMENT:
- Build: npm run build
- Serve static files from dist/ folder
- Configure backend proxy for /api routes
- Set up HTTPS for production
- Configure environment variables
*/