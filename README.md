# Cinema Booking

A full-stack cinema reservation application built with Next.js, React, TypeScript, and Prisma. Customers can browse movies, choose a screening, and reserve seats, while cinema staff manage the catalogue, schedule, and bookings through an admin dashboard.

## Overview

Cinema Booking brings movie discovery, seat selection, and reservation management into one application. It supports both guests who want to book without creating an account and registered customers who want to review their tickets later.

The customer interface is primarily in Armenian, with an English-language administration area. Responsive layouts support desktop and smaller screens.

## Features

- **Movie browsing:** View active movies with posters, genres, running times, and screening times; filter the catalogue by genre.
- **Interactive seat selection:** Choose multiple seats from a hall layout, see booked seats, and review the calculated total.
- **Guest reservations:** Book using a name, email address, and phone number.
- **Customer accounts:** Register, sign in, sign out, restore a session, and view account-linked booking history in My Tickets.
- **Booking conflict handling:** Server-side availability checks, transactional booking creation, and a database uniqueness constraint prevent duplicate reservations for the same seat and screening.
- **Admin dashboard:** View movie, screening, and booking counts, pending bookings, the total value of confirmed bookings, and recent reservations.
- **Movie administration:** Create and edit movies, assign existing genres, and delete or deactivate movies depending on their screening relationships.
- **Hall administration:** Create halls with generated rows and seats, and inspect their seating layouts.
- **Screening administration:** Create, edit, and delete screenings, calculate end times from movie duration, and check for overlapping schedules in a hall.
- **Booking administration:** Filter bookings by status, confirm pending reservations, and cancel bookings while releasing their seats.
- **User directory:** View registered users, roles, join dates, and booking counts.
- **Optional Telegram notifications:** Send booking and customer details to a configured Telegram chat after a reservation succeeds.

Bookings are created with `CONFIRMED` status. Payment processing is not implemented; the dashboard's revenue figure is the sum of confirmed booking totals, not verified payments.

## Tech Stack

| Area | Technology |
| --- | --- |
| Application framework | Next.js 16.3.1, App Router, Server Components |
| Frontend | React 19.2.8, TypeScript 5, React Context and hooks |
| Backend | Next.js Route Handlers and Server Actions |
| Database | MySQL-compatible database with the MariaDB driver adapter |
| ORM | Prisma 7.9.1, generated Prisma Client, SQL migrations |
| Authentication | JWTs with `jose`, password hashing with `bcryptjs` |
| Styling | Tailwind CSS 4, global CSS, CSS Modules |
| External integration | Telegram Bot API |
| Development tooling | npm, ESLint 9, `tsx`, `dotenv` |

Zustand is listed as a dependency, but the current application uses React Context and hooks for client state. No deployment-provider configuration is included.

## Project Structure

```text
app/
  page.tsx                 Movie catalogue and booking page
  login/, register/        Account forms
  my-tickets/              Customer booking history
  admin/                   Dashboard, management pages, and Server Actions
  api/                     Authentication, bookings, tickets, and seat APIs
  layout.tsx               Shared layout and authentication provider
  globals.css              Global styles and responsive layouts
components/
  home/                    Movie browser, cards, and seat booking interface
  auth/                    Client authentication context
  admin/                   Admin navigation
  layout/                  Shared header and footer
lib/                       Prisma, authentication, admin access, Telegram helpers
prisma/
  schema.prisma            Database models and constraints
  migrations/              SQL migration history
  seed.ts                  Destructive development demo seed
generated/prisma/          Generated Prisma Client
public/movies/             Local movie posters
prisma.config.ts           Database URL, migrations, and seed configuration
```

## How It Works

1. The home page reads active movies and their screenings from the database.
2. Selecting a screening loads its hall layout and booked seats through the seat API.
3. The customer selects seats and either uses their signed-in account or supplies guest contact details.
4. The booking API validates the request, checks that seats belong to the hall and are available, calculates the price, and creates the booking and seat records in a transaction. Conflicting reservations return HTTP `409`.
5. The application displays the booking result and optionally sends a Telegram notification. Notification failure does not cancel a successful booking.
6. Registered customers can view their account-linked reservations in My Tickets. Administrators manage the cinema through `/admin`.

Authentication uses 15-minute access tokens held in client memory and a seven-day refresh token in an HTTP-only cookie. Refresh-token hashes are stored in the database. The refresh endpoint issues a new access token, and logout removes the stored refresh token and clears the cookie. Server-rendered admin access checks the session and the user's `ADMIN` role.

## Getting Started

### Prerequisites

- Node.js compatible with the installed Prisma engine requirement: `^20.19`, `^22.12`, or `>=24.0`.
- npm.
- A running MySQL or MariaDB server and an empty database for this application.
- Database credentials with permission to apply the included migrations.

### 1. Get the project and install dependencies

Replace `https://github.com/Narek-Melkumyan/cinema-booking.git` with this repository's clone URL:

```bash
git clone https://github.com/Narek-Melkumyan/cinema-booking.git
cd cinema-booking
npm install
```

### 2. Configure the environment

Create a `.env` file in the project root using the placeholders in [Environment Variables](#environment-variables). Set the database URL and both token secrets before starting the application. Prisma CLI configuration and the seed script load `.env` through `dotenv`.

### 3. Prepare the database

For a new, empty application database, generate the client and apply the existing migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

The client is generated into `generated/prisma/`, which the application imports directly. The migration history includes destructive schema changes; review it before applying it to an existing database containing data.

### 4. Optionally load demo data

**Use the seed only against a disposable development database.** It deletes existing booking seats, bookings, screenings, movie-genre associations, movies, genres, seats, and halls before inserting demo data.

```bash
npx prisma db seed
```

The seed creates one hall with 70 seats, four genres, four movies, and eight screenings. Screening dates are fixed to August 22–23, 2026; they do not advance automatically. It does not create users or an administrator account.

### 5. Start the application

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

To access the admin area, register an account and have its database `User.role` set to `ADMIN` through your database administration tool. Registration defaults to `USER`; no role-management interface or admin bootstrap script is included.

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

For a production build and local production server:

```bash
npm run build
npm start
```

Provide the database connection and authentication environment variables for the build and server. The project requires a server runtime and database access. No automated test script is currently defined in `package.json`.

## Environment Variables

Example values below are placeholders only:

```env
DATABASE_URL="mysql://your_user:your_password@localhost:3306/your_database"
ACCESS_TOKEN_SECRET="replace_with_a_long_random_access_secret"
REFRESH_TOKEN_SECRET="replace_with_a_different_long_random_refresh_secret"

# Optional Telegram booking notifications
TELEGRAM_BOT_TOKEN="your_telegram_bot_token"
TELEGRAM_CHAT_ID="your_telegram_chat_id"
CINEMA_TIME_ZONE="UTC"
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Database connection used by Prisma configuration, the application, and the seed |
| `ACCESS_TOKEN_SECRET` | Yes, for authentication | Signs and verifies access JWTs |
| `REFRESH_TOKEN_SECRET` | Yes, for authentication | Signs and verifies refresh JWTs |
| `TELEGRAM_BOT_TOKEN` | No | Telegram bot credential; notifications require both Telegram variables |
| `TELEGRAM_CHAT_ID` | No | Destination chat for booking notifications |
| `CINEMA_TIME_ZONE` | No | IANA time zone for dates in Telegram messages; defaults to `UTC` |

`CINEMA_TIME_ZONE` only affects Telegram message formatting; it does not configure all application date handling. The code also reads `NODE_ENV` for production cookie settings and development Prisma-client reuse; Next.js sets it through its standard scripts.

Keep real credentials out of version control. Use separate, strong values for the two token secrets.

## Database

The Prisma schema uses the `mysql` provider, with database connections handled by `@prisma/adapter-mariadb`.

| Model | Responsibility |
| --- | --- |
| `User` | Customer or administrator identity, hashed password, and role |
| `RefreshToken` | Hashed refresh token, owner, and expiry |
| `Movie` | Movie details, poster path, duration, release date, and active status |
| `Genre`, `MovieGenre` | Genres and the many-to-many movie relationship |
| `Hall`, `Seat` | Cinema halls and numbered seating layouts |
| `Screening` | Movie, hall, start/end time, and ticket price |
| `Booking` | Account or guest reservation, status, and total price |
| `BookingSeat` | Reserved seats and their prices for a screening |

Each seat position is unique within its hall, and each `(screeningId, seatId)` pair is unique in `BookingSeat`. Prices use decimal database fields. Cancelling a booking through the admin action removes its seat reservations while retaining the cancelled booking record.

The schema defines `PENDING`, `CONFIRMED`, `CANCELLED`, and `EXPIRED` booking statuses. An automatic expiration workflow is not currently implemented.

## API / Routes

### Pages

| Route | Purpose |
| --- | --- |
| `/` | Movie browsing, screening selection, and booking |
| `/register`, `/login` | Account registration and sign-in |
| `/my-tickets` | Signed-in customer's booking history |
| `/admin` | Administrator dashboard |
| `/admin/movies`, `/admin/movies/new`, `/admin/movies/[id]/edit` | Movie listing, creation, and editing |
| `/admin/halls`, `/admin/halls/new`, `/admin/halls/[id]` | Hall listing, creation, and seating layout |
| `/admin/screenings`, `/admin/screenings/new`, `/admin/screenings/[id]/edit` | Screening management |
| `/admin/bookings` | Booking status filtering and management |
| `/admin/users` | Registered-user directory |

### HTTP endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register with `name`, `email`, and `password`; create a session |
| `POST` | `/api/auth/login` | Authenticate with `email` and `password` |
| `POST` | `/api/auth/refresh` | Use the refresh cookie to obtain an access token |
| `POST` | `/api/auth/logout` | Revoke the current refresh token and clear its cookie |
| `GET` | `/api/screenings/[id]/seats` | Return screening details, seats, and booking availability |
| `POST` | `/api/bookings` | Reserve `seatIds` for a `screeningId`; guests also supply `guestName`, `guestEmail`, and `guestPhone` |
| `GET` | `/api/my-tickets` | Return the authenticated user's bookings |

Account-linked booking requests and the My Tickets API use an `Authorization: Bearer <access-token>` header. Guests can submit bookings without that header. Admin form mutations use Server Actions rather than a separate set of REST endpoints.

## Screenshots

### Customer Interface

<img width="3028" height="5540" alt="screencapture-localhost-3000-2026-09-05-21_07_34" src="https://github.com/user-attachments/assets/c51da6f7-9d0d-4b72-83cb-2ee50c983d22" />


### Admin Dashboard
<img width="3028" height="1524" alt="screencapture-localhost-3000-admin-movies-2026-09-05-21_09_03" src="https://github.com/user-attachments/assets/8ae8d446-27d6-4ba5-8bf7-f8f94808bdb5" />




## Future Improvements

These are future ideas, not current features:

- Integrate payment processing and payment-status tracking.
- Add downloadable tickets or QR codes and email confirmations.
- Add automated tests for authentication, concurrent reservations, and admin actions.
- Add date-based browsing and prevent bookings for past screenings.
- Introduce timed seat holds with automatic expiration.
- Provide administrator onboarding and role-management tools.
- Apply consistent currency and time-zone formatting throughout the application.

## Author

- **Name:** Narek Melkumyan
- **GitHub:** [Narek-Melkumyan](https://github.com/Narek-Melkumyan)
- **LinkedIn:** [Narek Melkumyan](https://www.linkedin.com/in/narek-melkumyan-60164a374/)
