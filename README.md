# Build Together

A collaborative platform for property development projects, enabling users to create, discover, and join real estate development opportunities.

## Features

- **User Authentication**: Secure sign-up and sign-in using NextAuth.js with MongoDB
- **Property Management**: Create and browse property development projects
- **Real-time Chat**: Collaborate with project members using Pusher-powered chat rooms
- **My Projects**: Track and manage your property development projects
- **Dark/Light Mode**: Toggle between themes for better user experience
- **Responsive Design**: Built with Tailwind CSS for mobile-first design

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Authentication**: NextAuth.js v4
- **Database**: MongoDB with Auth MongoDB Adapter
- **Real-time**: Pusher for live chat functionality
- **Styling**: Tailwind CSS v4
- **UI Components**: Lucide React icons
- **Theme**: next-themes for dark/light mode

## Project Structure

```
src/
├── app/
│   ├── (private)/          # Protected routes
│   │   └── create/         # Create property page
│   ├── (public)/           # Public routes
│   │   ├── signin/         # Sign in page
│   │   └── signup/         # Sign up page
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth configuration
│   │   ├── chat/           # Chat endpoints
│   │   ├── my-projects/    # User projects API
│   │   ├── properties/     # Property CRUD operations
│   │   ├── pusher/         # Pusher authentication
│   │   └── register/       # User registration
│   ├── components/         # Reusable components
│   │   ├── Home/           # Homepage sections
│   │   ├── layout/         # Header and Footer
│   │   └── properties/     # Property-related components
│   ├── my-projects/        # User projects page
│   ├── properties/         # Properties listing page
│   └── property/[id]/      # Individual property details
├── lib/                    # Utility functions
│   ├── auth.ts             # NextAuth configuration
│   ├── dbConnect.ts        # MongoDB connection
│   ├── properties.ts       # Property utilities
│   └── pusher.ts           # Pusher configuration
└── types/                  # TypeScript definitions
```

## Getting Started

### Prerequisites

- Node.js 20 or higher
- MongoDB database
- Pusher account (for real-time chat)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Pusher
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Key Features Explained

### Authentication
Users can register and sign in using email and password. Authentication is handled by NextAuth.js with credentials provider, storing user data in MongoDB.

### Property Management
- Create new property development projects
- Browse available properties
- Join existing projects
- View detailed property information

### Real-time Chat
Each property has a dedicated chat room where project members can communicate in real-time using Pusher.

### My Projects
Users can view all their property projects in one place for easy management and tracking.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Pusher Documentation](https://pusher.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
