# Backend Architecture

This document explains how the Elixir/Phoenix backend integrates with the React frontend for the Nuzlocke Generator.

## Overview

The backend provides:
- **User authentication** via JWT tokens
- **Persistent storage** for nuzlocke runs in PostgreSQL
- **Real-time synchronization** via Phoenix Channels (WebSockets)
- **Optimistic updates** with monotonic server-side revisions (server-ordered “last write wins” for overlapping keys)
- **Debounced writes** to minimize database load (frontend batches at ~150ms; backend debounces DB flushes at 200ms)

Implementation notes:
- Phoenix is running on **Phoenix 1.8** with **Bandit** (`Bandit.PhoenixAdapter`).
- CORS is configured in `server/lib/nuzlocke_api_web/endpoint.ex` and (by default) allows `http://localhost:5173`, `http://localhost:3000`, and `http://localhost:8080`.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Frontend                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Redux     │  │  API Client │  │   useRunChannel Hook    │  │
│  │   Store     │◄─┤  (REST)     │  │   (WebSocket)           │  │
│  └─────────────┘  └──────┬──────┘  └───────────┬─────────────┘  │
└──────────────────────────┼─────────────────────┼────────────────┘
                           │                     │
                     HTTP/JSON              WebSocket
                           │                     │
┌──────────────────────────┼─────────────────────┼────────────────┐
│                          ▼                     ▼                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   Phoenix Endpoint                          ││
│  │  • CORS middleware                                          ││
│  │  • JSON parsing                                             ││
│  │  • WebSocket upgrade                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                     │                │
│            ┌─────────────┴───────┐    ┌───────┴──────────┐     │
│            ▼                     │    ▼                  │     │
│  ┌──────────────────┐           │  ┌────────────────┐   │     │
│  │     Router       │           │  │   UserSocket   │   │     │
│  │  • /api/auth/*   │           │  │  • JWT verify  │   │     │
│  │  • /api/runs/*   │           │  │  • Channels    │   │     │
│  │  • /api/roadmap  │           │  └───────┬────────┘   │     │
│  │  • /api/releases │           │          │            │     │
│  │  • /api/report   │           │          │            │     │
│  └────────┬─────────┘           │          ▼            │     │
│           │                     │  ┌────────────────┐   │     │
│           ▼                     │  │  RunChannel    │   │     │
│  ┌──────────────────┐           │  │  • join/leave  │   │     │
│  │   Controllers    │           │  │  • patch msgs  │   │     │
│  │  • AuthController│           │  │  • broadcasts  │   │     │
│  │  • RunController │           │  └───────┬────────┘   │     │
│  └────────┬─────────┘           │          │            │     │
│           │                     │          ▼            │     │
│           ▼                     │  ┌────────────────┐   │     │
│  ┌──────────────────┐           │  │   RunStore     │   │     │
│  │    Contexts      │           │  │  (GenServer)   │   │     │
│  │  • Accounts      │◄──────────┴──┤  • In-memory   │   │     │
│  │  • Runs          │              │  • Debounce    │   │     │
│  └────────┬─────────┘              │  • Broadcast   │   │     │
│           │                        └───────┬────────┘   │     │
│           ▼                                │            │     │
│  ┌─────────────────────────────────────────┴────────────┘     │
│  │                     PostgreSQL                              │
│  │  ┌─────────────┐  ┌─────────────────────────────────┐      │
│  │  │   users     │  │            runs                 │      │
│  │  │  • id       │  │  • id                           │      │
│  │  │  • email    │  │  • user_id (FK)                 │      │
│  │  │  • password │  │  • name                         │      │
│  │  │    _hash    │  │  • data (map/JSONB)             │      │
│  │  └─────────────┘  │  • revision                     │      │
│  │                   └─────────────────────────────────┘      │
│  └────────────────────────────────────────────────────────────┘│
│                        Phoenix Backend                          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Authentication Flow

```
User                    Frontend                   Backend
  │                        │                          │
  │  Enter credentials     │                          │
  ├───────────────────────►│                          │
  │                        │  POST /api/auth/login    │
  │                        ├─────────────────────────►│
  │                        │                          │ Verify password
  │                        │                          │ Generate JWT
  │                        │  { user, token }         │
  │                        │◄─────────────────────────┤
  │                        │                          │
  │                        │ Store token in           │
  │                        │ localStorage             │
  │  Logged in!            │                          │
  │◄───────────────────────┤                          │
```

### 2. Loading a Run

```
Frontend                              Backend
   │                                     │
   │  GET /api/runs/:id                  │
   │  Authorization: Bearer <token>      │
   ├────────────────────────────────────►│
   │                                     │ Verify JWT
   │                                     │ Load from DB
   │  { run: { id, name, data, revision } }   │
   │◄────────────────────────────────────┤
   │                                     │
   │  Connect WebSocket                  │
   │  ws://localhost:4000/socket?token=<jwt>  │
   ├────────────────────────────────────►│
   │                                     │
   │  Join channel "run:<id>"            │
   ├────────────────────────────────────►│
   │                                     │ Start/get RunStore
   │  { revision, data }                 │ GenServer process
   │◄────────────────────────────────────┤
```

### 3. Making Edits (Patch Flow)

This is the core of the real-time sync system:

```
User Edit          Frontend                    RunStore              Database
    │                 │                           │                      │
    │ Change nickname │                           │                      │
    ├────────────────►│                           │                      │
    │                 │                           │                      │
    │                 │ Optimistic update         │                      │
    │                 │ (immediate UI change)     │                      │
    │                 │                           │                      │
    │                 │ Queue patch in            │                      │
    │                 │ patchSender (150ms)       │                      │
    │                 │                           │                      │
    │ Another edit    │                           │                      │
    ├────────────────►│                           │                      │
    │                 │ Merge into pending        │                      │
    │                 │ Reset debounce timer      │                      │
    │                 │                           │                      │
    │                 │     ... 150ms passes ...  │                      │
    │                 │                           │                      │
    │                 │ Send batched patch        │                      │
    │                 │ via WebSocket             │                      │
    │                 ├──────────────────────────►│                      │
    │                 │                           │ Merge patch          │
    │                 │                           │ Increment revision   │
    │                 │                           │ Broadcast to clients │
    │                 │                           │                      │
    │                 │ ◄─ "update" broadcast ────┤                      │
    │                 │                           │                      │
    │                 │                           │ Start 200ms timer    │
    │                 │                           │                      │
    │                 │                           │  ... 200ms passes ...│
    │                 │                           │                      │
    │                 │                           │ Flush to database    │
    │                 │                           ├─────────────────────►│
    │                 │                           │                      │
```

### 4. Conflict Resolution

The backend includes a `revision` counter on every run update (REST and WebSocket) and increments it on every patch it applies.

Important details for this project:
- The server does **not** accept/compare a “client revision” when applying patches, so there is no true conflict detection. Updates are applied in the order the backend processes them.
- Patch merges are **deep merges for maps**. For non-map values (including arrays), the right-hand value **replaces** the left-hand value.
- The frontend’s `useRunChannel` hook forwards every `update` event to consumers and tracks `currentRevision`, but it does not itself reject out-of-order events. If you need strict ordering, compare `payload.revision` against your current revision before applying.

## Key Components

### Backend Components

#### Guardian (JWT Authentication)

Located in `server/lib/nuzlocke_api/guardian.ex`:

```elixir
defmodule NuzlockeApi.Guardian do
  use Guardian, otp_app: :nuzlocke_api

  # Encodes user ID into JWT subject
  def subject_for_token(%{id: id}, _claims), do: {:ok, to_string(id)}

  # Decodes JWT subject back to user
  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user(id) do
      nil -> {:error, :resource_not_found}
      user -> {:ok, user}
    end
  end
end
```

#### Auth Pipeline + EnsureAuth plug

Located in:
- `server/lib/nuzlocke_api_web/plugs/auth_pipeline.ex`
- `server/lib/nuzlocke_api_web/plugs/ensure_auth.ex`

How it works:
- `AuthPipeline` verifies a `Bearer <token>` header and (if present/valid) loads the user into the connection (`allow_blank: true`).
- `EnsureAuth` blocks protected routes if there is no authenticated user (`401 { "error": "Unauthorized" }`).

#### RunStore GenServer

Located in `server/lib/nuzlocke_api/run_store.ex`:

The RunStore is the heart of the real-time system. Each active run gets its own GenServer process that:

1. **Holds state in memory** - Fast reads without DB queries
2. **Merges patches** - Deep merge of incoming changes
3. **Debounces DB writes** - 200ms batching to reduce load
4. **Broadcasts updates** - Notifies all connected clients
5. **Auto-terminates** - Shuts down after 30 minutes of inactivity
6. **Retries DB flushes** - If a DB write fails, it re-schedules another flush

Processes are registered under `NuzlockeApi.RunStoreRegistry` and started via the `NuzlockeApi.RunStoreSupervisor` (`DynamicSupervisor`).

```elixir
# Process lifecycle
def init(run_id) do
  # Load from DB on first access
  run = Runs.get_run(run_id)
  {:ok, %{data: run.data, revision: run.revision, ...}, @idle_timeout}
end

def handle_call({:apply_patch, patch}, _from, state) do
  # 1. Merge patch into current state
  new_data = deep_merge(state.data, patch)
  new_revision = state.revision + 1

  # 2. Schedule DB write (debounced)
  timer = Process.send_after(self(), :flush_to_db, 200)

  # 3. Broadcast to all connected clients
  Endpoint.broadcast("run:#{run_id}", "update", %{
    revision: new_revision,
    data: new_data
  })

  {:reply, {:ok, %{revision: new_revision}}, new_state}
end
```

#### Phoenix Channels

Located in `server/lib/nuzlocke_api_web/channels/`:

```elixir
# RunChannel handles real-time communication per run
def join("run:" <> run_id, _payload, socket) do
  # Verify ownership
  # Start RunStore process
  # Return current state
end

def handle_in("patch", %{"patch" => patch}, socket) do
  # Forward to RunStore
  RunStore.apply_patch(run_id, patch)
end
```

#### UserSocket / UserChannel

Located in:
- `server/lib/nuzlocke_api_web/channels/user_socket.ex`
- `server/lib/nuzlocke_api_web/channels/user_channel.ex`

Notes:
- WebSocket connections support `?token=<jwt>`. If the token is valid, the socket is assigned `user_id`.
- The socket also allows connecting without a token (`user_id` is `nil`), but protected channels (like `run:<id>`) enforce ownership on join.
- The `user:<user_id>` channel is intended for server→client broadcasts. Today, `RunController.create` broadcasts `run_created` on `user:<user_id>`.

### Frontend Components

#### API Client

Located in `src/api/client.ts`:

```typescript
// Automatically attaches JWT to all requests
export async function apiRequest<T>(endpoint: string, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
}
```

#### useRunChannel Hook

Located in `src/api/useRunChannel.ts`:

```typescript
export function useRunChannel(runId: string, options = {}) {
  const { onUpdate, onJoin } = options;

  useEffect(() => {
    const socket = new Socket(SOCKET_URL, { params: { token } });
    socket.connect();

    const channel = socket.channel(`run:${runId}`);
    channel.join()
      .receive('ok', onJoin)   // Initial state
      .receive('error', ...);

    channel.on('update', onUpdate);  // Real-time updates

    return () => channel.leave();
  }, [runId]);

  return { sendPatch, isConnected, ... };
}
```

#### Patch Sender

Located in `src/api/patchSender.ts`:

```typescript
// Batches rapid edits into single requests
const pendingPatches = new Map();
const DEBOUNCE_MS = 150;

export function sendPatch(runId: string, patch: Partial<State>, sendFn) {
  const existing = pendingPatches.get(runId);

  if (existing) {
    // Merge with pending patch
    existing.patch = deepMerge(existing.patch, patch);
    clearTimeout(existing.timer);
  } else {
    pendingPatches.set(runId, { patch: { ...patch }, timer: null });
  }

  // Reset debounce timer
  pendingPatches.get(runId).timer = setTimeout(() => {
    sendFn(runId, pendingPatches.get(runId).patch);
    pendingPatches.delete(runId);
  }, DEBOUNCE_MS);
}
```

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | Get JWT token | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Run Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/runs` | List all runs | Yes |
| POST | `/api/runs` | Create new run | Yes |
| GET | `/api/runs/:id` | Get run details | Yes |
| PUT | `/api/runs/:id` | Update run | Yes |
| POST | `/api/runs/:id/patch` | Apply patch | Yes |
| DELETE | `/api/runs/:id` | Delete run | Yes |

### Roadmap Endpoints

These routes are authenticated in this project.

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/roadmap` | List versions + features | Yes |
| POST | `/api/roadmap/versions` | Create a version | Yes |
| PUT | `/api/roadmap/versions/:id` | Update a version | Yes |
| DELETE | `/api/roadmap/versions/:id` | Delete a version | Yes |
| POST | `/api/roadmap/features` | Create a feature | Yes |
| PUT | `/api/roadmap/features/:id` | Update a feature | Yes |
| DELETE | `/api/roadmap/features/:id` | Delete a feature | Yes |

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/releases/:type` | Get GitHub releases (`latest` or `all`) |
| POST | `/api/report` | Submit bug report |

Notes on public endpoint payloads:
- `/api/releases/latest` returns `{ status: 200, payload: { notes: [release] } }` (or an empty list if none)
- `/api/releases/all` returns `{ status: 200, payload: { notes: [...] } }` (excluding the latest release)
- `/api/report` requires `GH_ACCESS_TOKEN` on the backend and returns `{ status: <http-status-from-github> }` on success

### WebSocket Channels

**Connection:** `ws://localhost:4000/socket?token=<jwt>`

**Channels:**
- `run:<run_id>` - Real-time run synchronization
- `user:<user_id>` - User-level notifications

**Run Channel Events:**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `patch` | client→server | `{ patch: {...} }` | Apply a patch |
| `get_state` | client→server | `{}` | Request current state |
| `update` | server→client | `{ revision, data }` | State updated |

**User Channel Events:**

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `run_created` | server→client | `{ run_id }` | Run was created via REST |

## Database Schema

### users

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | string | Unique email |
| password_hash | string | Bcrypt hash |
| inserted_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

### runs

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| name | string | Run name |
| data | map (JSONB) | Full run state |
| revision | integer | Version number |
| inserted_at | datetime | Created timestamp |
| updated_at | datetime | Updated timestamp |

The `data` JSONB column stores the complete run state matching the frontend's Redux state shape:

```json
{
  "pokemon": [...],
  "box": [...],
  "trainer": {...},
  "game": {...},
  "checkpoints": [...],
  "rules": [...],
  "style": {...},
  ...
}
```

### versions / features (roadmap)

| Table | Column | Type | Description |
|------|--------|------|-------------|
| versions | id | UUID | Primary key |
| versions | name | string | Version name |
| versions | position | integer | Ordering |
| features | id | UUID | Primary key |
| features | version_id | UUID | FK to versions |
| features | title | string | Feature title |
| features | status | string | `planned` / `in_progress` / `done` |
| features | position | integer | Ordering (within a version + status lane) |

## Development

### Running Locally

```bash
# Terminal 1: Start both servers
npm run dev

# Or separately:
npm run dev:frontend  # Vite on :5173
npm run dev:backend   # Phoenix on :4000
```

### Database Commands

```bash
npm run db:setup    # Create DB, run migrations, seed
npm run db:migrate  # Run pending migrations
npm run db:reset    # Drop and recreate DB
```

### Environment Variables

Frontend (`.env`):
```
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000/socket
```

Backend (`server/.env`):
```
GH_ACCESS_TOKEN=<github_token>
GUARDIAN_SECRET_KEY=<jwt_secret>  # Production only
SECRET_KEY_BASE=<phoenix_secret>  # Production only
DATABASE_URL=<postgres_url>        # Production only (required in prod)
PHX_HOST=<backend_host>            # Production only
PORT=4000                          # Optional (defaults to 4000)
PHX_SERVER=true                    # Required when running as a release
```

## Production Deployment

### Backend Requirements

1. PostgreSQL database
2. Environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `SECRET_KEY_BASE` - Phoenix secret (run `mix phx.gen.secret`)
   - `GUARDIAN_SECRET_KEY` - JWT secret (run `mix guardian.gen.secret`)
   - `GH_ACCESS_TOKEN` - GitHub API token
   - `PHX_HOST` - Production hostname

### Frontend Requirements

1. Set `VITE_API_URL` and `VITE_WS_URL` to production backend URL
2. Build with `npm run build:production`

### CORS Configuration

Update `server/lib/nuzlocke_api_web/endpoint.ex` to include your production frontend domain(s).

Note: CORS is currently a hard-coded allowlist of localhost ports for development. For production, you’ll want to replace/extend it with your deployed frontend origin(s) (or make it configurable via env var).

```elixir
plug CORSPlug,
  origin: ["https://your-frontend-domain.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Authorization", "Content-Type", "Accept"]
```

