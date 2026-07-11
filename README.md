# Nile — Global Gym & Trainer Booking Platform

A multi-role marketplace for discovering and booking gyms and personal trainers, with separate experiences for members, gym owners, coaches, and admins.

Live demo: [nile27.netlify.app](https://nile27.netlify.app/)

---

## What This App Does

Nile isn't just a booking form in front of a listings page — it's a small marketplace with four distinct roles, each with their own dashboard and permissions, backed by Supabase Row Level Security.

- **Members** can browse gyms and trainers by location, view detailed profiles (amenities, schedules, reviews, certifications), and book sessions through a calendar-based booking flow
- **Gym owners** can list and manage their own gyms, including gym details, images, and amenities (`AddGym`, `EditGym`, `GymOwnerDashboard`)
- **Coaches** register separately, manage their own profile and availability, and can publish tutorials that go through an approval workflow before being published (`CoachRegistration`, `CoachDashboard`, `CoachTutorials`)
- **Admins** oversee the platform through a dedicated dashboard (`AdminDashboard`)

Other features:
- Location-based gym/trainer search with map integration (Leaflet)
- Calendar-based session booking (React Big Calendar, React Date Range)
- Dark mode support
- Password reset flow (forgot/reset password pages)
- Contact form with FAQ
- Booking and payment status are tracked in the data model (`pending` / `paid` / `refunded`), though this repo does not include a third-party payment processor integration — payment handling is not wired to a live provider yet

---

## Roles & Access

Role is stored on the user's profile and checked throughout the app (`AuthContext`):

| Role | Capabilities |
|---|---|
| `user` | Browse, search, and book gyms/trainers |
| `gym_owner` | Add/edit their own gym listings, manage bookings for their gym |
| `coach` | Manage their profile, availability, and tutorials (subject to approval) |
| `admin` | Platform-wide oversight via the admin dashboard |

Row Level Security policies (see the `database-*.sql` files) enforce these boundaries at the database level — e.g. gym owners can only edit their own gyms, coaches only their own tutorials.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend & Database | Supabase (PostgreSQL, Auth, Row Level Security, Storage for gym/coach images) |
| Maps | Leaflet |
| Scheduling | React Big Calendar, React Date Range, date-fns |
| UI/UX | Framer Motion, Headless UI, Heroicons, React Hot Toast |
| Routing | React Router |
| Deployment | Netlify |

---

## Project Structure

```
nile/
├── src/
│   ├── pages/            # Home, Gyms, Trainers, GymProfile, TrainerProfile,
│   │                     # AddGym, EditGym, GymOwnerDashboard,
│   │                     # CoachRegistration, CoachDashboard, CoachTutorials,
│   │                     # AdminDashboard, SignIn, SignUp, Profile, Contact, About
│   ├── components/       # Reusable UI components
│   ├── context/          # AuthContext (roles & session), ThemeContext (dark mode)
│   ├── lib/               # Supabase client, typed table interfaces
│   └── assets/
├── database-setup.sql               # Base schema
├── database-booking-*.sql           # Booking system + permissions
├── database-gym-*.sql               # Gym images, coaches, RLS policies
├── database-tutorial-approval.sql   # Coach tutorial approval workflow
└── database-fix-*.sql               # Incremental RLS/schema fixes
```

> Note: the many `database-fix-*.sql` and `database-update-*.sql` files reflect iterative RLS policy and schema fixes made directly against the running Supabase project rather than a single migration history — worth consolidating into an ordered `migrations/` folder if this project continues to grow.

---

## Getting Started (Development)

### Prerequisites

- Node.js 16+
- A Supabase project

### Setup

```bash
git clone https://github.com/NiniMerabishvili/nile.git
cd nile
npm install
cp .env.example .env   # add your Supabase credentials
```

**`.env` keys:**

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the SQL files in `database-setup.sql` first, then the feature-specific and fix files in `SETUP.md`'s recommended order (gym images → coaches → bookings → tutorial approval).

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Database Schema (core tables)

**Gyms** — id, name, location, rating, reviews, image, amenities, description, schedule, price
**Trainers/Coaches** — id, name, specialty, location, rating, reviews, image, experience, price, bio, certifications, specialties, availability
**Bookings** — user, gym/trainer reference, time slot, `payment_status` (`pending` / `paid` / `refunded`)
**Contact Messages** — name, email, subject, message, created_at

Full table definitions and RLS policies are in the root `database-*.sql` files.

---

## License

MIT
