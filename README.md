# Nile - Global Gym & Trainer Booking Platform

A modern web application for discovering and booking gyms and personal trainers worldwide.

## Features

- Browse and search gyms and trainers by location
- View detailed profiles with amenities, schedules, and reviews
- Book training sessions and gym access
- Dark mode support
- Responsive design for all devices
- Real-time availability updates
- Secure payment processing
- User reviews and ratings

## Tech Stack

- React + TypeScript
- Vite
- Supabase (Backend & Database)
- TailwindCSS
- Framer Motion
- React Router
- Heroicons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/nile.git
   cd nile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
nile/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── lib/           # Utility functions and API clients
│   ├── context/       # React context providers
│   └── assets/        # Static assets
├── public/            # Public assets
└── ...config files
```

## Database Schema

### Gyms Table
- id (uuid)
- name (text)
- location (text)
- rating (float)
- reviews (int)
- image (text)
- amenities (text[])
- description (text)
- schedule (jsonb)
- price (text)

### Trainers Table
- id (uuid)
- name (text)
- specialty (text)
- location (text)
- rating (float)
- reviews (int)
- image (text)
- experience (text)
- price (text)
- bio (text)
- certifications (text[])
- specialties (text[])
- availability (jsonb)

### Contact Messages Table
- id (uuid)
- name (text)
- email (text)
- subject (text)
- message (text)
- created_at (timestamp)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Supabase](https://supabase.io/) for the backend infrastructure
- [TailwindCSS](https://tailwindcss.com/) for the styling system
- [Heroicons](https://heroicons.com/) for the beautiful icons
- [Framer Motion](https://www.framer.com/motion/) for animations
