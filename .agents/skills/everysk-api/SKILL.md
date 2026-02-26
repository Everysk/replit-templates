---
name: everysk-api
description: Comprehensive Everysk platform SDK, REST API, and brand guidelines for agentic app development. Use when building applications with Everysk entities (portfolios, datastores, reports, files, workflows, custom indexes), performing risk calculations (Monte Carlo, stress tests, exposure, sensitivity), creating workers, interacting with the Everysk REST API, or creating any Everysk-branded content (marketing, presentations, web pages, proposals, UI, documentation). Covers SDK entities, engines, core utilities, WorkerBase patterns, all CRUD endpoints, and 2026 brand identity (colors, typography, voice, visual guidelines).
---

# Everysk API — Complete Platform Reference

Unified Python library (`everysk-lib`) and REST API (v2) for portfolios, datastores, workflows, risk calculations, and automation on the Everysk platform.

**MANDATORY:** When this skill is loaded, read ALL reference files below. Every file contains essential knowledge for correct Everysk development. Do not skip any.

## Reference Files (ALL MANDATORY — read on every invocation)

| File | Lines | Content |
|------|------:|---------|
| [references/sdk-entities.md](references/sdk-entities.md) | 221 | 7 entity classes: Datastore, Portfolio, Report, File, Email, CustomIndex, PrivateSecurity, Tags — attributes, methods, code examples |
| [references/sdk-engines.md](references/sdk-engines.md) | 221 | 6 engines: UserCache, Compliance, Cryptography, ExpressionEngine, MarketData, UserLock — full API signatures, patterns |
| [references/core.md](references/core.md) | 1610 | 13 core modules: BaseDict/BaseObject, Fields (15 types), Serialize (NaN/Infinity), Date/DateTime, HTTP, Log, Threads, Compress, Firestore, SFTP, String, Exceptions (17 types) |
| [references/api-reference.md](references/api-reference.md) | 4470 | Complete REST API v2: auth, errors, rate limiting, pagination, 7 calculation endpoints, 8 resource CRUD sections, all parameters, curl + Python examples |
| [references/server.md](references/server.md) | 352 | Starlette ASGI server: endpoints (Base, JSON, Redirect, HealthCheck), routing (Route, RouteLazy), middlewares, Nginx/Unit Docker deployment |
| [references/worker-patterns.md](references/worker-patterns.md) | 153 | WorkerBase lifecycle: handle_inputs → handle_tasks → handle_outputs, complete template, critical rules, MarketData+Cache and Compliance patterns |
| [references/branding.md](references/branding.md) | 346 | 2026 brand identity: colors (#F2703B/#C9DDE8/#A49F8C), typography (Playfair Display/Space Grotesk/DM Sans), voice, AI positioning, imagery, content directives |

## Quick Start

```python
pip install everysk-lib

from everysk.sdk.entities import Datastore, Portfolio, Report, File, Email, CustomIndex, PrivateSecurity
from everysk.sdk.engines import MarketData, UserCache, UserLock
from everysk.sdk.engines.compliance import Compliance
from everysk.sdk.engines.cryptography import generate_random_id, generate_unique_id
from everysk.sdk.engines.expression.base import ExpressionEngine
from everysk.sdk.worker_base import WorkerBase
from everysk.core.object import BaseDict, BaseObject
from everysk.core.serialize import dumps, loads
from everysk.core.datetime import Date, DateTime
from everysk.core.fields import StrField, IntField, FloatField, BoolField, ListField, DictField
from everysk.core.http import HTTPSync
from everysk.core.log import log
```

## Architecture

```
everysk-lib/
├── sdk/
│   ├── entities/        # Datastore, Portfolio, Report, File, Email, CustomIndex, PrivateSecurity
│   ├── engines/         # UserCache, Compliance, Cryptography, ExpressionEngine, MarketData, UserLock
│   ├── worker_base.py   # WorkerBase class (extends BaseDict)
│   └── brutils/         # Brazilian CPF/CNPJ utilities
├── core/
│   ├── object.py        # BaseDict, BaseObject — foundation classes
│   ├── serialize/       # JSON/ORJSON with NaN/Infinity handling
│   ├── fields.py        # 15 field types with validation
│   ├── datetime/        # Date (bizdays, calendar support) + DateTime (timezone, formatting)
│   ├── exceptions.py    # 17 exception types
│   ├── http.py          # HTTPSync client
│   ├── log.py           # Structured logging
│   ├── threads.py       # Thread pool, retry, caching decorators
│   ├── compress.py      # gzip/zlib with pickle/json serialization
│   ├── firestore.py     # Google Firestore integration
│   ├── sftp.py          # SFTP operations
│   └── string.py        # String utilities (mask, random, case conversion)
├── api/                 # REST API client (v2) — deprecated, prefer SDK entities
└── server/              # Starlette ASGI server + Nginx/Unit deployment
```

## Critical Patterns (MUST follow)

### 1. State Attribute Declaration

```python
# CORRECT — Always use this exact pattern
storage_settings: BaseDict = None
_datastore: Datastore = None
my_list: list = None

# WRONG — Causes FieldValueError at runtime
storage_settings: dict | BaseDict | None = None   # Never use union types
_datastore: Datastore | None = None                # Never use Optional[]
my_list: list[str] = None                          # Never use parameterized generics
```

### 2. WorkerBase — 3 Required Methods

```python
class MyWorker(WorkerBase):
    # Inputs (from config/interface)
    input_text: str
    mode: str = "default"

    # State — ALWAYS Type = None, prefix internal with _
    storage_settings: BaseDict = None
    _datastore: Datastore = None

    # Outputs
    result: str = None
    success: bool = False

    def handle_inputs(self) -> None:
        super().handle_inputs()  # MUST call super()
        self.input_text = self.script_inputs.input_text
        self.storage_settings = BaseDict(self.config.get('storage', {}))

    def handle_tasks(self) -> None:
        df = pd.DataFrame({'result': [self.input_text]})
        self._datastore = Datastore.script.storage(
            storage_settings=self.storage_settings, dataframe=df, entity_name='output'
        )
        self.success = True

    def handle_outputs(self) -> None:
        super().handle_outputs()  # MUST call super()
        return BaseDict(datastore_id=self._datastore.id, success=self.success)
```

### 3. Serialization — NaN/Infinity Handling

```python
from everysk.core.serialize import dumps, loads

json_str = dumps(data, allow_nan=True)       # REQUIRED for financial data
obj = loads(json_str, protocol='orjson')      # Fast deserialization
```

### 4. Entity CRUD

```python
# Create datastore
datastore = Datastore.script.storage(
    storage_settings=storage_settings, dataframe=df, entity_name='name'
)

# Retrieve
datastore = Datastore.script.get(datastore_id='dats_xxxxx')
portfolio = Portfolio.script.get(portfolio_id='port_xxxxx')

# Access data
df = datastore.to_dataframe()
csv = portfolio.to_csv()    # name,date,currency,NLV,description,tags,...security_details
d = portfolio.to_dict()
```

## SDK Entities Summary

| Entity | ID Pattern | Key Attributes | Key Methods |
|--------|-----------|----------------|-------------|
| **Datastore** | `dats_[a-zA-Z0-9]` | name, workspace, date, data, level, tags | `script.storage()`, `script.get()`, `to_dataframe()`, `to_dict()`, `validate()` |
| **Portfolio** | `port_[a-zA-Z0-9]` | workspace, name, nlv, base_currency, date, securities | `script.get()`, `to_csv()`, `to_dict()`, `validate()` |
| **Report** | — | name, workspace, widgets, url, authorization, config_cascaded | `to_dict()` |
| **File** | — | name, workspace, data (Base64), content_type, url | `to_dict()`, `validate()` |
| **CustomIndex** | `CUSTOM:[A-Z_][A-Z0-9_]*` | symbol, name, periodicity, currency, base_price, data_type, data | `to_dict()`, `validate()` |
| **PrivateSecurity** | `PRIVATE:[A-Z0-9_]*` | symbol, name, currency, data, instrument_type | `to_dict()`, `validate()` |
| **Tags** | — | min_size=1, max_size=252 | `append()`, `extend()`, `insert()` |

## SDK Engines Summary

| Engine | Import | Key Operations |
|--------|--------|---------------|
| **UserCache** | `from everysk.sdk.engines import UserCache` | `cache.set(key, value, timeout=600)`, `cache.get(key)` → None if miss |
| **MarketData** | `from everysk.sdk.engines.market_data import MarketData` | `search(conditions, fields, order_by, limit, date)`, `get_historical(date, start_date, end_date, ticker_list, ticker_type, projection)` |
| **UserLock** | `from everysk.sdk.engines import UserLock` | `lock = UserLock(name, timeout)`, `lock.acquire()`, `lock.release()` — raises `LockNotOwnedError` after timeout |
| **Compliance** | `from everysk.sdk.engines.compliance import Compliance` | `Compliance.check(rules, datastore, metadata)` → `{'compliant': True/False}` |
| **Cryptography** | `from everysk.sdk.engines.cryptography import ...` | `generate_random_id(length, characters)`, `generate_unique_id()` (32-char), `generate_short_random_id()` (8-char) |
| **ExpressionEngine** | `from everysk.sdk.engines.expression.base import ExpressionEngine` | `engine.get_tokens(expr)` → frozenset, `engine.solve(expr, data)` → result |

**MarketData searchable columns:** everysk_id, everysk_symbol, country_of_risk, currency, exchange, gics_sector, instrument_class, isin, last_prices, mkt_cap, name, security_class, volume, extra_data (supports direct field search like `raw_sector`). Cache: 14,400s per unique request.

**MarketData get_historical projection types:** close, high, low, average, adjusted_close. Returns `{everysk_symbol, everysk_id, status, as_of, historical_data: {index, columns, data}}`.

## Core Modules Quick Reference

| Module | Import | Key Functions |
|--------|--------|--------------|
| **BaseDict/BaseObject** | `from everysk.core.object import BaseDict, BaseObject` | Dict-like with attribute access, dot notation, JSON serialization |
| **Fields** | `from everysk.core.fields import *` | StrField, IntField, FloatField, BoolField, ListField, DictField, DateField, DateTimeField, EnumField, EmailField, UUIDField, URLField, IPAddressField, RegexField, AnyField |
| **Serialize** | `from everysk.core.serialize import dumps, loads` | `dumps(obj, allow_nan=True)`, `loads(str, protocol='orjson')`. Protocols: json, orjson |
| **Date** | `from everysk.core.datetime import Date` | Properties: day_name, month_name, week_of_year, quarter. Methods: days_delta, bizdays_delta, weeks/months/years_delta, get_first/last_day_of_week/month/quarter/year, is_first/last_day, days/bizdays_range, get_date_from_expression. Calendar support: 'ANBIMA' |
| **DateTime** | `from everysk.core.datetime import DateTime` | now(tzinfo), fromtimestamp, string_date_to_date_time(str, force_time), strftime, strftime_pretty. force_time: MIDDAY/NOW/FIRST_MINUTE/LAST_MINUTE |
| **Exceptions** | `from everysk.core.exceptions import *` | APIError, DateError, DefaultError, EntityError, EntityNotFound, FieldValueError, HttpError, InvalidArgumentError, QueryError, ReadonlyError, RedisEmptyListError, RequiredError, SDKError, SDKInternalError, SDKTypeError, SDKValueError, SigningError |
| **HTTP** | `from everysk.core.http import HTTPSync` | Sync HTTP client with retry logic |
| **Log** | `from everysk.core.log import log` | Structured logging |
| **Threads** | `from everysk.core.threads import *` | Thread pool, @retry decorator, @cache decorator |
| **Compress** | `from everysk.core.compress import compress, decompress` | `compress(data, protocol='gzip', serialize='json')`, supports gzip/zlib + pickle/json |
| **String** | `from everysk.core.string import *` | mask, random_string, camel_to_snake, snake_to_camel |

## REST API v2 Essentials

**Base URL:** `https://api.everysk.com/v2`
**Auth:** HTTP Basic — Account SID as username, Auth Token as password
**Content-Type:** `application/json` (POST body max 1MB)
**Rate Limit:** 60 req/min (429 on exceed). Headers: `X-Everysk-Rate-Limit-Allowed`, `X-Everysk-Rate-Limit-Remaining`, `X-Everysk-Rate-Limit-Reset`
**Pagination:** Cursor-based via `page_token` + `page_size` (1-100). Auto-pagination available in SDK.
**Request ID:** `X-Everysk-Request-Id` header for support

### Resource Endpoints

| Resource | List | Create | Get | Update | Delete | Notes |
|----------|------|--------|-----|--------|--------|-------|
| **Workspace** | GET /workspaces | POST /workspaces | GET /workspaces/{id} | PUT /workspaces/{id} | DELETE /workspaces/{id} | — |
| **Portfolio** | GET /portfolios | POST /portfolios | GET /portfolios/{id} | PUT /portfolios/{id} | DELETE /portfolios/{id} | Max 250 securities (3000 with NLV) |
| **Datastore** | GET /datastores | POST /datastores | GET /datastores/{id} | PUT /datastores/{id} | DELETE /datastores/{id} | — |
| **Report** | GET /reports | — | GET /reports/{id} | — | DELETE /reports/{id} | POST /reports/{id}/share |
| **Custom Index** | GET /custom_indexes | POST /custom_indexes | GET /custom_indexes/{id} | PUT /custom_indexes/{id} | DELETE /custom_indexes/{id} | Symbol: `CUSTOM:[A-Z_][A-Z0-9_]*` |
| **File** | GET /files | POST /files | GET /files/{id} | PUT /files/{id} | DELETE /files/{id} | Base64 data |
| **Workflow** | GET /workflows | — | GET /workflows/{id} | — | DELETE /workflows/{id} | POST /workflows/{id}/run |
| **Report Template** | GET /report_templates | — | GET /report_templates/{id} | — | DELETE /report_templates/{id} | — |

### Calculation Endpoints

| Endpoint | Purpose | Key Parameters |
|----------|---------|---------------|
| `POST /calculations/risk_attribution` | Monte Carlo MCTR risk attribution | securities, date, base_currency, nlv, horizon(1/5/20/60), sampling(1/5), aggregation, projection, volatility_half_life, correlation_half_life, risk_measure(vol/var/cvar), filter |
| `POST /calculations/stress_test` | CVaR-, EV, CVaR+ under scenarios | + shock, magnitude(REQUIRED), confidence(95%/99%/etc.) |
| `POST /calculations/exposure` | Delta-adjusted notional exposure | securities, date, base_currency, nlv, sampling, aggregation, filter |
| `POST /calculations/properties` | Aggregated portfolio properties | securities, date, base_currency, nlv, horizon, sampling, aggregation, projection, volatility_half_life, correlation_half_life, confidence |
| `POST /calculations/sensitivity` | Greeks (options) + FI sensitivities | securities, date, base_currency, nlv, sampling, aggregation, filter |
| `POST /calculations/marginal_tracking_error` | Benchmark tracking error | + benchmark_id(REQUIRED) |
| `POST /calculations/parametric_risk_attribution` | Factor-based risk attribution | securities, date, base_currency, nlv, sampling, aggregation, projection, confidence |

**Common calculation parameters:** `portfolio_id` (optional, replaces securities/date/nlv), `aggregation` options: custom, position, country, sector, gics_sector, market_capitalization, liquidity, implied_rating, duration, security_type, security_type_refined, dividend_yield, exposure, currency, fixed_income, total_esg.

### API Code Pattern

```python
import everysk, json

everysk.api_sid = 'YOUR_ACCOUNT_SID'
everysk.api_token = 'YOUR_AUTH_TOKEN'

# Calculation
response = everysk.Calculation.riskAttribution(
    securities=[{"id": "id1", "symbol": "AAPL", "quantity": 1000.0}],
    date='20210622'
)

# List with auto-pagination
for portfolio in everysk.Portfolio.auto_paging_iter(page_size=3):
    print(portfolio)
```

## Server Module Essentials

```python
from everysk.server.applications import create_application
from everysk.server.endpoints import JSONEndpoint, BaseEndpoint, HealthCheckEndpoint
from everysk.server.routing import Route, RouteLazy

class MyAPI(JSONEndpoint):
    rest_key_name: str = 'X-Api-Key'   # Set both to None for public
    rest_key_value: str = '123456'

    async def get(self):
        return {'message': 'Hello'}

app = create_application(routes=[
    Route(path='/api', endpoint=MyAPI),
    RouteLazy(path='/health', endpoint='everysk.server.endpoints.HealthCheckEndpoint'),
])
```

**Dev:** `uvicorn --host 0.0.0.0 --port 8000 --reload api:app`
**Prod:** Nginx/Unit Docker — see [references/server.md](references/server.md)

## Branding Essentials (2026 Identity)

**Core positioning:** "AI-embedded workflows built for Investment Operations"
**Tagline:** "The backbone of industry leader's operations"
**Narrative:** Problem → Workflow → Automation → Outcome

### Colors (Mandatory)

| Color | Hex | Usage |
|-------|-----|-------|
| Black | #000000 | Primary background, text |
| White | #FFFFFF | Text on dark, backgrounds |
| Orange | #F2703B | CTAs, key emphasis, brand accent |
| Soft Gray | #A49F8C | Neutral panels, backgrounds |
| Off White | #ECEBE7 | Light backgrounds, cards |
| Ever Blue | #C9DDE8 | Data, analytics, technical |
| Soft Black | #313131 | Secondary dark surfaces |

### Typography (Mandatory)

| Font | Usage |
|------|-------|
| Playfair Display | Headlines, display numbers |
| Space Grotesk | Subtitles, buttons, UI labels |
| DM Sans | Body text, paragraphs |

### Voice Rules

- **Do:** Domain-specific capital markets language, quantify outcomes, operational terms, professional tone
- **Don't:** Consumer SaaS language ("delightful", "magic"), vague AI hype, anthropomorphize, oversimplify finance
- **AI framing:** "Agentic AI that executes multi-step investment workflows" — never "smart assistant" or "chatbot"

Full brand guidelines including imagery, icons, layout, content directives, audience targeting, and drift prevention checklist in [references/branding.md](references/branding.md).

## Key Gotchas

1. **BaseDict not dict** — State attributes MUST use `BaseDict = None`, never `dict` or union types
2. **NaN/Infinity** — Always `dumps(data, allow_nan=True)` for financial data
3. **API rate limit** — 60 req/min, 429 on exceed, use exponential backoff
4. **No session IDs** — API uses SID + Token auth only (HTTP Basic)
5. **Securities limit** — 250 without NLV, 3000 with NLV supplied
6. **Custom Index naming** — Must match `CUSTOM:[A-Z_][A-Z0-9_]*`
7. **API module deprecated** — Use SDK entities instead of `everysk.api` where possible
8. **Date expressions** — Use `Date.get_date_from_expression('10th bizday', year, month)` for business day calculations
9. **UserLock timeout** — Release after timeout raises `LockNotOwnedError`, always use try/finally
10. **MarketData cache** — Results cached 14,400s per unique request; combine with UserCache for custom TTL

## Related Skills

- `workers-everysk-skill` — Building and deploying workers in the Everysk workers-everysk platform
- `everysk-mcp` — MCP server integration for agentic AI workflows
