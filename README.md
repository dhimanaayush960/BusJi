# College Bus Tracking System

A real-time bus tracking system for college students with live GPS tracking, route visualization, and estimated arrival times.

## Features

- Real-time bus location tracking
- Interactive route map
- Estimated arrival times
- Student authentication
- Push notifications
- Responsive design
- Admin dashboard for managing bus schedules

## Tech Stack

- Frontend: React.js
- Backend: Node.js, Express.js
- Database: Firebase
- Maps: Google Maps API
- Authentication: Firebase Auth
- Real-time Updates: Firebase Realtime Database

## Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Firebase account
- Google Maps API key

## Setup Instructions

1. Clone the repository
2. Set up Frontend:
   ```bash
   cd frontend
   npm install
   ```

3. Set up Backend:
   ```bash
   cd backend
   npm install
   ```

4. Create a `.env` file in the frontend directory with:
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

5. Create a `.env` file in the backend directory with:
   ```
   PORT=5000
   FIREBASE_ADMIN_SDK_PATH=path_to_firebase_admin_sdk.json
   ```

6. Start the development servers:
   Frontend:
   ```bash
   cd frontend
   npm start
   ```
   
   Backend:
   ```bash
   cd backend
   npm run dev
   ```

## Project Structure

```
college-bus-tracker/
├── frontend/           # React frontend application
├── backend/           # Node.js backend server
└── README.md         # Project documentation
```
