# Widget Task Manager with Document360 JWT auth

A lightweight task manager with a Document360 knowledge base widget that authenticates through a backend `/authenticate` endpoint.

## Features

- Add new tasks
- Assign low / medium / high priority
- Mark tasks complete or active
- Filter by all, active, and completed tasks
- Delete individual tasks
- Clear all completed tasks
- Browser persistence via localStorage
- Document360 JWT token generation through a backend endpoint

## Setup

1. Create a local `.env` file from `.env.example`.
2. Add your Document360 client details.
3. Install dependencies:

```bash
npm install
```

4. Start the backend:

```bash
npm start
```

5. Start the frontend app:

```bash
cd "C:\Users\​AshiyaParveen\Documents\WidgetTest"
py -m http.server 8000
```

6. Open the app at:

```text
http://localhost:8000
```

The help icon triggers the Document360 widget, and the widget calls the backend endpoint at `http://localhost:3000/authenticate` to fetch a JWT-backed access token.

## Backend endpoint

The backend exposes:

- `GET /authenticate`
- `POST /authenticate`

Response example:

```json
{
  "accessToken": "...",
  "expiresIn": 900
}
```
