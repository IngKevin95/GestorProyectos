# docker-frontend

React 18 + Vite frontend containerizado con environment-driven API URL y backend connectivity fallback.

## ADDED Requirements

### Requirement: React frontend in Docker with Vite build
The system SHALL build and serve the React frontend using Vite in a Docker container, with development mode for local work and production build for deployments.

#### Scenario: Frontend starts and serves on port 3000
- **WHEN** `docker-compose up -d` completes
- **THEN** `curl http://localhost:3000` returns HTML and frontend is interactive at http://localhost:3000

#### Scenario: Frontend waits for backend health before rendering app
- **WHEN** backend is not yet healthy when frontend container starts
- **THEN** frontend displays "Conectando..." message and retries backend health check every 2 seconds

#### Scenario: Frontend shows app once backend is healthy
- **WHEN** backend becomes healthy (GET /health returns 200)
- **THEN** frontend automatically transitions from "Conectando..." to rendering the full app

### Requirement: Environment-driven API URL
The system SHALL accept VITE_API_URL environment variable to configure the backend API endpoint, with default http://localhost:8000.

#### Scenario: Frontend connects to configured backend URL
- **WHEN** docker-compose.yml sets VITE_API_URL=http://my-backend:8000
- **THEN** frontend makes API requests to that URL (verify via browser DevTools Network tab)

#### Scenario: Frontend uses default localhost URL
- **WHEN** VITE_API_URL is not set
- **THEN** frontend defaults to http://localhost:8000 and connects successfully

### Requirement: CORS headers accepted for localhost:3000
The system SHALL allow the backend to accept requests from http://localhost:3000 via CORS headers.

#### Scenario: Frontend can call backend API without CORS errors
- **WHEN** frontend running on localhost:3000 calls GET http://localhost:8000/health
- **THEN** response includes Access-Control-Allow-Origin: * (or specific origin localhost:3000) and request succeeds

### Requirement: Error handling for backend disconnection
The system SHALL detect when the backend becomes unavailable and show a user-friendly fallback UI.

#### Scenario: Fallback UI on backend failure
- **WHEN** backend becomes unavailable after initial load
- **THEN** frontend shows "Desconectado" or similar message and continues retrying every 2s
