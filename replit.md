# Mockup Generator Application

## Overview

This is a full-stack web application that generates professional device mockups from website URLs. Users can input any website URL and receive a high-quality mockup of that website displayed on a MacBook frame. The application is built with a React frontend using Vite and shadcn/ui components, and an Express.js backend with Puppeteer for screenshot generation and Sharp for image processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Screenshot Generation**: Puppeteer for automated browser screenshots
- **Image Processing**: Sharp for image manipulation and mockup generation
- **Data Storage**: In-memory storage for generated mockups (temporary)
- **Database ORM**: Drizzle ORM configured for PostgreSQL (ready for future use)

### Development Environment
- **Package Manager**: npm with lockfile version 3
- **TypeScript Configuration**: Strict mode enabled with modern ESNext target
- **Development Server**: Vite dev server with HMR and error overlay
- **Build Process**: Vite for frontend, esbuild for backend bundling

## Key Components

### Frontend Components
1. **Home Page** (`client/src/pages/home.tsx`)
   - Main interface for mockup generation
   - Form with URL input, quality selection, and device frame options
   - Progress tracking during generation
   - Result display with download functionality

2. **UI Component Library** (`client/src/components/ui/`)
   - Complete shadcn/ui component set
   - Form components, buttons, inputs, progress bars
   - Toast notifications for user feedback
   - Responsive design components

3. **Hooks and Utilities**
   - Custom toast hook for notifications
   - Mobile detection hook
   - API request utilities with error handling

### Backend Services
1. **Mockup Generator** (`server/services/mockup-generator.ts`)
   - Puppeteer browser automation
   - Website screenshot capture
   - Image processing with Sharp
   - Device frame overlay application

2. **Storage Service** (`server/storage.ts`)
   - In-memory storage implementation
   - Interface for future database integration
   - Mockup metadata management

3. **API Routes** (`server/routes.ts`)
   - POST `/api/generate-mockup` - Generate new mockup
   - GET `/api/mockups/:id/download` - Download generated mockup
   - Error handling and validation

## Data Flow

1. **User Input**: User enters website URL and selects options on frontend form
2. **Validation**: Zod schema validates request data on both client and server
3. **Screenshot Generation**: Puppeteer launches headless browser and captures website
4. **Image Processing**: Sharp processes screenshot and applies device frame overlay
5. **Storage**: Generated mockup is stored in memory with unique ID
6. **Response**: Frontend receives mockup metadata and displays result
7. **Download**: User can download the generated mockup image

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon database adapter (prepared for future use)
- **puppeteer**: Headless browser automation for screenshots
- **sharp**: High-performance image processing
- **drizzle-orm**: Type-safe ORM for database operations

### UI Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form handling and validation
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking and compilation
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Build Process
- Frontend: Vite builds optimized React bundle to `dist/public`
- Backend: esbuild bundles server code to `dist/index.js`
- Static assets served from build output directory

### Environment Configuration
- Database URL configured via `DATABASE_URL` environment variable
- Drizzle migrations stored in `./migrations` directory
- Production mode detection via `NODE_ENV`

### Development Workflow
- `npm run dev`: Starts development server with hot reloading
- `npm run build`: Builds both frontend and backend for production
- `npm run start`: Runs production server
- `npm run db:push`: Pushes database schema changes

### Hosting Considerations
- Application designed for deployment on platforms like Replit
- Puppeteer requires appropriate system dependencies for headless browser
- In-memory storage suitable for development; database integration ready for production scaling
- Static file serving configured for production builds

The application architecture supports easy migration from in-memory storage to persistent database storage when needed, with Drizzle ORM already configured for PostgreSQL integration.