# Campus Event Management - Backend

Simple Express + Mongoose backend for the Campus Event Management assessment.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (see `.env.example`) and set `MONGO_URI` and optional `PORT`.

   Or skip `.env` and use one of these alternatives:
   - Set the environment variable directly before running the app.
   - Create `config.js` with `module.exports = { MONGO_URI: 'your-uri' }`.

3. Start the server:

```bash
npm start
# or
npx nodemon server.js
```

API endpoints

- `POST /api/events` - create event
- `GET /api/events` - list events
- `GET /api/events/:id` - get event by id
- `PUT /api/events/:id` - update event
- `DELETE /api/events/:id` - delete event

Validation

- `eventName`, `eventType`, and `eventDate` are required.
- `maxParticipants` must be a positive number if provided.

Use this backend with the React frontend (Axios) for the full assessment.

See `ASSESSMENT.md` for a complete project explanation and requirements mapping.

---
