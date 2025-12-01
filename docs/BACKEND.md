# Backend Architecture

This document explains how the Elixir/Phoenix backend integrates with the React frontend for the Nuzlocke Generator.

## Overview

The backend provides:
- **User authentication** via JWT tokens
- **Persistent storage** for nuzlocke runs in PostgreSQL
- **Real-time synchronization** via Phoenix Channels (WebSockets)
- **Optimistic updates** with revision-based conflict resolution
- **Debounced writes** to minimize database load

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
│  │  • /api/releases │           │  └───────┬────────┘   │     │
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
│  │  │    _hash    │  │  • data (JSONB)                 │      │
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
   │  { run: { id, name, data, rev } }   │
   │◄────────────────────────────────────┤
   │                                     │
   │  Connect WebSocket                  │
   │  ws://localhost:4000/socket         │
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

Conflicts are resolved using revision numbers:

```elixir
# When a client receives an update:
channel.on("update", ({ revision, data }) => {
  setRun(current => {
    if (revision > current.revision) {
      return data;  # Accept newer revision
    }
    return current; # Ignore stale update
  });
});
```

## Key Components

### Backend Components

#### Guardian (JWT Authentication)

Located in `lib/nuzlocke_api/guardian.ex`:

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

#### RunStore GenServer

Located in `lib/nuzlocke_api/run_store.ex`:

The RunStore is the heart of the real-time system. Each active run gets its own GenServer process that:

1. **Holds state in memory** - Fast reads without DB queries
2. **Merges patches** - Deep merge of incoming changes
3. **Debounces DB writes** - 200ms batching to reduce load
4. **Broadcasts updates** - Notifies all connected clients
5. **Auto-terminates** - Shuts down after 30 minutes of inactivity

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

Located in `lib/nuzlocke_api_web/channels/`:

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

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/releases/:type` | Get GitHub releases (`latest` or `all`) |
| POST | `/api/report` | Submit bug report |

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
| data | JSONB | Full run state |
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

Update `lib/nuzlocke_api_web/endpoint.ex` to include production frontend domain:

```elixir
plug CORSPlug,
  origin: ["https://your-frontend-domain.com"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  headers: ["Authorization", "Content-Type", "Accept"]
```

