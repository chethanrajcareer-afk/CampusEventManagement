 Campus Event Management System - Assessment Reference

## Overview
This project is a MERN-stack event management application for the Department of Computer Science. It allows an administrator to create, view, update, and delete campus events.

## Project Structure
- `server.js` - Express backend with MongoDB/Mongoose.
- `config.example.js` - Optional direct MongoDB config fallback instead of `.env`.
- `client/` - React frontend built with Vite and Axios.
- `client/src/` - React app source.
- `client/src/components/` - Event form and event list components.

## Requirements Coverage

### 1. Create Event with Express Server
- Backend route: `POST /api/events`
- The React frontend form calls this route to create a new event.
- Data is stored in MongoDB using Mongoose.

### 2. Display Events
- Backend route: `GET /api/events`
- Frontend shows events in a card list with:
  - Event Name
  - Event Type
  - Resource Person
  - Date
  - Venue
  - Registration Status

### 3. Update Event
- Backend route: `PUT /api/events/:id`
- Frontend allows selecting an event and editing its details.

### 4. Delete Event
- Backend route: `DELETE /api/events/:id`
- Frontend shows a Delete button and asks for confirmation.

### 5. Backend/API Implementation
Routes implemented in `server.js`:
- `POST /api/events`
- `GET /api/events`
- `GET /api/events/:id`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### 6. Validation and React UI
Validation implemented:
- `eventName` cannot be empty
- `eventType` is required
- `eventDate` is required
- `maxParticipants` must be a positive number
- Error messages are displayed in the form

## MongoDB Configuration
The backend supports these options:
1. `.env` file with `MONGO_URI`
2. `config.js` file exporting `{ MONGO_URI: '...' }`
3. direct environment variable

Example `config.js`:
```js
module.exports = {
  MONGO_URI: 'mongodb://<username>:<password>@host1:27017,host2:27017,host3:27017/<dbname>?replicaSet=<replicaSet>&authSource=admin&tls=true',
};
```

## How to Run

### Backend
```bash
npm install
npm start
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Notes for Assessment Explanation
- The backend uses Express for routing and Mongoose for database models.
- The frontend uses React with function components, hooks, and Axios.
- Components are separated into `EventForm` and `EventList`.
- The project is intentionally simple and human-readable, with plain CSS instead of Tailwind to avoid extra build complexity.

## What Still Needs a Live DB Connection
The backend currently works and starts even without a DB connection, but API routes return `503` until the Atlas connection is available.

To fix MongoDB Atlas connectivity:
- whitelist your IP in Atlas Network Access
- or use a standard non-SRV URI from Atlas if SRV lookups are blocked by your network

## Assessment Submission
Include this file along with your project source to explain:
- the feature list
- routes and endpoints
- validation rules
- how MongoDB is configured
- how to run the project
