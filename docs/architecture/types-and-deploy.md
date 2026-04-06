# Types and Deploy

## TypeScript Types (src/types/)

### Workflow Types
```typescript
interface Workflow {
  id, name, description, workspace, status, tags,
  trigger_config, trigger_enabled, trigger_type,
  starter_worker_id, ender_worker_id,
  version, created, updated
}
interface WorkflowExecution {
  id, workflow_id, workflow_name, workspace,
  run_status, status, resume,
  started, started_worker_id,
  ender_worker_id, ender_worker_execution_id,
  duration, real_execution_time, total_execution_time,
  trigger, version, created, updated
}
interface Workspace { name, description, group, version, created, updated }
WorkflowExecutionStatus  // enum-like variable
```

### Entity Types (Zod-based)
- `Portfolio`, `Security` — portfolio/securities Zod schemas
- `Datastore`, `DatastoreData`, `DatastoreRow` — datastore Zod schemas
- `DefaultObject` — generic object type
- `EntityQuery` — API query structure

## Deploy Pipeline

### Run Command
```bash
python run.py deploy
# → scripts/deploy.py (subprocess)
```

### Scripts
- `scripts/entrypoint.sh` → `python run.py deploy`
- `scripts/check-env.sh` → validates required env vars (EVERYSK_API_SID, EVERYSK_API_TOKEN, EVERYSK_APP_NAME)
- `scripts/deploy.py` → actual deploy logic
- `scripts/helpers.py` → deploy helpers

### Required Secrets / Env Vars
| Variable | Required | Purpose |
|----------|----------|---------|
| EVERYSK_API_SID | YES | API authentication SID |
| EVERYSK_API_TOKEN | YES | API authentication token |
| EVERYSK_APP_NAME | YES | App name for deploy |
| ANTHROPIC_API_KEY | Optional | For AI/chat features |
| EVERYSK_API_URL | Optional | Override API base URL (default: https://api.everysk.com/v2) |
| PORT | Optional | Dev server port (default: 5000) |
| PROJECT_ROOT | Optional | Override project root for .env loading |

## Replit Integration Templates (.replit_integration_files/)
NOT active code — templates for users to copy:
- `server/replit_integrations/chat/` — Anthropic SDK chat routes + storage
- `server/replit_integrations/batch/` — Batch processing with Anthropic
- `shared/models/chat.ts` — Chat model types
