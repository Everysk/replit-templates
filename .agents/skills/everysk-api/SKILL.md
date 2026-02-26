---
name: everysk-api
description: Comprehensive Everysk platform SDK, REST API, and brand guidelines for agentic app development. Use when building applications with Everysk entities (portfolios, datastores, reports, files, workflows, custom indexes), performing risk calculations (Monte Carlo, stress tests, exposure, sensitivity), creating workers, interacting with the Everysk REST API, or creating any Everysk-branded content (marketing, presentations, web pages, proposals, UI, documentation). Covers SDK entities, engines, core utilities, WorkerBase patterns, all CRUD endpoints, and 2026 brand identity (colors, typography, voice, visual guidelines).
---

# Everysk API

Unified Python library and REST API for portfolios, datastores, workflows, risk calculations, and automation on the Everysk platform.

## Quick Start

```python
# Install
pip install everysk-lib

# Core imports
from everysk.sdk.entities import Datastore, Portfolio, Report, File, Email
from everysk.sdk.worker_base import WorkerBase
from everysk.core.object import BaseDict, BaseObject
from everysk.core.serialize import dumps, loads
```

## Architecture

```
everysk-lib/
├── sdk/                    # High-level SDK
│   ├── entities/           # Datastore, Portfolio, Report, File, Email, CustomIndex, PrivateSecurity
│   ├── engines/            # UserCache, Compliance, Cryptography, ExpressionEngine, MarketData, UserLock
│   ├── worker_base.py      # WorkerBase class
│   └── brutils/            # Brazilian CPF/CNPJ utilities
├── core/                   # Core utilities
│   ├── object.py           # BaseDict, BaseObject
│   ├── serialize/          # JSON/ORJSON with NaN/Infinity support
│   ├── fields.py           # Field types and validation
│   ├── datetime/           # Date/time utilities
│   ├── http.py             # HTTP client
│   ├── log.py              # Logging
│   ├── threads.py          # Threading utilities
│   ├── compress.py         # Compression
│   ├── firestore.py        # Firestore integration
│   ├── sftp.py             # SFTP operations
│   └── string.py           # String utilities
├── api/                    # REST API client (v2)
│   └── api_resources/      # Resource classes
└── server/                 # Web server module
```

## Critical Patterns

### State Attribute Declaration (MUST follow)

```python
# CORRECT - Always use this pattern
storage_settings: BaseDict = None
_datastore: Datastore = None

# WRONG - Causes FieldValueError
storage_settings: dict | BaseDict | None = None  # Never use union types
```

### WorkerBase Pattern

```python
from everysk.sdk.worker_base import WorkerBase
from everysk.sdk.entities import Datastore
from everysk.core.object import BaseDict

class MyWorker(WorkerBase):
    # Inputs (from config)
    input_text: str
    mode: str = "default"

    # State - always Type = None
    storage_settings: BaseDict = None
    _datastore: Datastore = None

    # Outputs
    result: str = None
    success: bool = False

    def handle_inputs(self) -> None:
        """Initialize from self.script_inputs"""
        super().handle_inputs()
        self.storage_settings = BaseDict(self.config.get('storage', {}))

    def handle_tasks(self) -> None:
        """Core processing logic"""
        df = pd.DataFrame({'result': [self.input_text]})
        self._datastore = Datastore.script.storage(
            storage_settings=self.storage_settings,
            dataframe=df, entity_name='output'
        )
        self.success = True

    def handle_outputs(self) -> None:
        """Return results as BaseDict"""
        super().handle_outputs()
```

### Entity CRUD Operations

```python
# Create
datastore = Datastore.script.storage(
    storage_settings=storage_settings, dataframe=df, entity_name='name'
)

# Retrieve
datastore = Datastore.script.get(datastore_id='dats_xxxxx')
portfolio = Portfolio.script.get(portfolio_id='port_xxxxx')

# Access data
df = datastore.to_dataframe()
csv = portfolio.to_csv()
d = portfolio.to_dict()
```

### Serialization

```python
from everysk.core.serialize import dumps, loads

# Handle NaN/Infinity (REQUIRED for financial data)
json_str = dumps(data, allow_nan=True)
obj = loads(json_str, protocol='orjson')
```

## REST API Overview

Base: `https://api.everysk.com/v2`
Auth: HTTP Basic (Account SID as username, Auth Token as password)
Content-Type: `application/json` (POST body, max 1MB)
Rate limit: 60 req/min (429 on exceed)
Pagination: cursor-based via `page_token` + `page_size`

### API Endpoints

| Resource | Endpoints | Methods |
|----------|-----------|---------|
| **Calculation** | `/calculations/{type}` | POST |
| **Workspace** | `/workspaces` | POST, GET, PUT, DELETE |
| **Portfolio** | `/portfolios` | POST, GET, PUT, DELETE |
| **Datastore** | `/datastores` | POST, GET, PUT, DELETE |
| **Report** | `/reports` | GET, POST (share), DELETE |
| **Custom Index** | `/custom_indexes` | POST, GET, PUT, DELETE |
| **File** | `/files` | POST, GET, PUT, DELETE |
| **Workflow** | `/workflows` | GET, POST (run), DELETE |
| **Report Template** | `/report_templates` | GET, DELETE |

### Calculation Endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /calculations/risk_attribution` | Monte Carlo MCTR risk attribution |
| `POST /calculations/stress_test` | CVaR-, EV, CVaR+ under scenarios |
| `POST /calculations/exposure` | Delta-adjusted notional exposure |
| `POST /calculations/properties` | Aggregated portfolio properties |
| `POST /calculations/sensitivity` | Greeks for options, FI sensitivities |
| `POST /calculations/marginal_tracking_error` | Benchmark tracking error |
| `POST /calculations/parametric_risk_attribution` | Factor-based risk attribution |

## Reference Files

Detailed documentation by domain. Load only when needed:

- **[references/core.md](references/core.md)** - All 13 core modules: BaseDict/BaseObject, fields, serialization, date/datetime, HTTP, logging, threads, compress, firestore, SFTP, strings
- **[references/sdk-entities.md](references/sdk-entities.md)** - Entity classes: Datastore, Portfolio, Report, File, Email, CustomIndex, PrivateSecurity, Tags with full method signatures
- **[references/sdk-engines.md](references/sdk-engines.md)** - Engines: UserCache, Compliance, Cryptography, ExpressionEngine, MarketData, UserLock
- **[references/api-reference.md](references/api-reference.md)** - Complete REST API: auth, errors, pagination, all resource CRUD endpoints, calculation parameters, code examples
- **[references/server.md](references/server.md)** - Server module and Nginx/Unit deployment
- **[references/worker-patterns.md](references/worker-patterns.md)** - WorkerBase lifecycle, input/output handling, common worker patterns
- **[references/branding.md](references/branding.md)** - 2026 brand identity: colors (#F2703B orange, #C9DDE8 blue, #A49F8C gray), typography (Playfair Display/Space Grotesk/DM Sans), voice, imagery, AI positioning, content directives

## Key Gotchas

1. **BaseDict not dict** - State attributes MUST use `BaseDict = None`, never `dict`
2. **NaN/Infinity** - Always use `dumps(data, allow_nan=True)` for financial data
3. **API rate limit** - 60 req/min default, 429 on exceed
4. **No session IDs** - API uses SID + Token auth only
5. **Securities limit** - 250 without NLV, 3000 with NLV supplied
6. **Custom Index naming** - Must match `CUSTOM:[A-Z_][A-Z0-9_]*`
7. **API module deprecated** - Use SDK entities instead of `everysk.api` where possible

## Related Skills

- `workers-everysk-skill` - Building and deploying workers
- `everysk-mcp` - MCP server integration
