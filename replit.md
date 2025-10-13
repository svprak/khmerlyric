# Music Sheet Application

## Overview
This is a music sheet/songbook management application built with Node.js, Express, and MongoDB. It allows users to create, manage, and view songbooks with lyrics, particularly focused on Khmer (Cambodian) songs with custom font support.

## Project Structure
- **app.js**: Main Express application configuration
- **bin/www**: Server startup script (configured for port 5000)
- **models/**: Mongoose data models
  - `user.js`: User authentication model with Passport.js
  - `songbook.js`: Songbook metadata model
  - `songlists.js`: Song list model
- **routes/**: Express route handlers
  - `index.js`: Main routes
  - `books.js`: Songbook management routes
  - `songs.js`: Song management routes  
  - `users.js`: User authentication routes
- **views/**: EJS templates for frontend
- **public/**: Static assets (CSS, JavaScript, fonts, images)
- **uploads/**: User-uploaded images for songs/books

## Technology Stack
- **Backend**: Node.js 16.x with Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Passport.js with Local Strategy
- **Template Engine**: EJS
- **File Uploads**: Multer
- **Session Management**: Cookie-session

## Configuration

### Environment Variables
- `DATABASEURL`: MongoDB connection string (required)
- `PORT`: Server port (defaults to 5000 for Replit compatibility)

### Current Setup Status
- ✅ Server configured to run on port 5000
- ✅ Server configured to bind to 0.0.0.0 for Replit proxy
- ✅ All dependencies installed
- ⚠️ **REQUIRES VALID MongoDB CONNECTION**: The DATABASEURL environment variable must point to a working MongoDB instance

## Database Setup

### Current Issue
The application requires a MongoDB database connection. The current DATABASEURL points to a cluster that no longer exists or is unavailable.

### Solution Options

**Option 1: MongoDB Atlas (Recommended - Free)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster (M0 tier)
3. Get connection string: Connect → Connect your application
4. Update DATABASEURL secret in Replit with the new connection string
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

**Option 2: Alternative MongoDB Service**
- Any MongoDB-compatible service will work
- Update DATABASEURL with your connection string

**Option 3: Migrate to PostgreSQL**
- Replit provides a built-in PostgreSQL database
- Would require converting Mongoose models to PostgreSQL (Sequelize/Prisma)
- Significant code changes needed

## Running the Application

### Development
The workflow is already configured. Once a valid DATABASEURL is set:
1. The server will automatically restart
2. Access the application through the Replit webview
3. Server runs on port 5000

### Deployment
Deployment configuration will be set up once the application runs successfully.

## Features
- User authentication (signup/login)
- Role-based access (admin/operator)
- Songbook creation and management
- Song lyrics with custom Khmer fonts
- Image upload for book covers
- Search functionality
- Responsive design

## Next Steps
1. ✅ Install dependencies: `npm install` (completed)
2. ✅ Configure server for Replit (completed)
3. ⏳ Set up valid MongoDB connection (in progress - waiting for user)
4. ⏳ Test application functionality
5. ⏳ Configure deployment settings

## Recent Changes (October 13, 2025)
- Imported project from GitHub
- Updated server to use port 5000 (Replit requirement)
- Changed server binding to 0.0.0.0 for Replit proxy compatibility
- Installed all npm dependencies
- Created project documentation
- Identified MongoDB connection issue requiring user action
