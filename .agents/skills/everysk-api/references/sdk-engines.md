# SDK Engines Reference

Source: https://everysk.github.io/docs/sdk/engines/

## Table of Contents
- [UserCache](#usercache)
- [Compliance](#compliance)
- [Cryptography](#cryptography)
- [ExpressionEngine](#expressionengine)
- [UserLock](#userlock)
- [MarketData](#marketdata)

---

## UserCache

Cache storage with get/set operations and timeout support.

**Import:** `from everysk.sdk.engines import UserCache`

```python
cache = UserCache()

# Basic operations
cache.set('key', value, timeout=600)  # 10 min TTL
result = cache.get('key')             # Returns None if missing
```

**Combined with MarketData:**
```python
from everysk.sdk.engines import MarketData

cache = UserCache()
cached = cache.get('raw_sector_query')
if cached:
    return cached

market_data = MarketData()
result = market_data.search(
    [["raw_sector", "=", "Technology"]],
    fields=["instrument_class", "name", "gics_sector"],
    limit=1,
)
cache.set('raw_sector_query', result, timeout=600)
```

---

## Compliance

Rule-based compliance checking engine.

**Import:** `from everysk.sdk.engines.compliance import Compliance`

**`Compliance.check(rules, datastore, metadata=None)`**
- `rules`: List of rule dicts
- `datastore`: Data to validate
- `metadata`: Optional metadata
- Returns: `{'compliant': True/False}`

```python
rules = [{'rule1': 'rule1'}, {'rule2': 'rule2'}]
datastore = [{'data': 'data'}, {'data2': 'data2'}]
Compliance.check(rules, datastore)
# {'compliant': True}
```

---

## Cryptography

ID generation utilities for entity identification.

**Import:** `from everysk.sdk.engines.cryptography import generate_random_id, generate_unique_id, generate_short_random_id`

```python
# Random ID with custom length/characters
generate_random_id(length=10)                        # 'IG1aaDfZ9s'
generate_random_id(length=10, characters='0123456789') # '4918487470'

# Unique 32-char ID
generate_unique_id()                                 # 'ebaba8774bcf4063b9832b721fb3a2e0'

# Short 8-char ID
generate_short_random_id()                           # 'X5r33Hmw'
```

---

## ExpressionEngine

Expression parsing and evaluation with variables, operators, and functions.

**Import:** `from everysk.sdk.engines.expression.base import ExpressionEngine`

```python
engine = ExpressionEngine()

# Extract tokens from expression
engine.get_tokens('a + b')
# frozenset({'a', 'b'})

# Evaluate expression with data
engine.solve('a + b', {'a': 1, 'b': 2})
# 3

# Complex expressions
user_args = {
    "fund_class": "FIRF",
    "tax_regime": "LONG TERM",
    "nlv": 100000
}
engine.solve('fund_class == "FIRF"', user_args)
# True
```

---

## UserLock

Distributed locks for exclusive resource access.

**Import:** `from everysk.sdk.engines import UserLock`

```python
lock = UserLock(name='my_lock', timeout=10)

try:
    lock.acquire()
    # ... critical section ...
finally:
    lock.release()
```

**Timeout behavior:** Releasing after timeout raises `LockNotOwnedError`.

**Combined with Cache (double-checked locking):**
```python
cache = UserCache()
lock = UserLock(name='sector_lock', timeout=10)

cached = cache.get('key')
if cached:
    return cached

try:
    lock.acquire()
    cached = cache.get('key')  # Re-check after acquiring
    if cached:
        return cached
    result = compute_expensive_query()
    cache.set('key', result, timeout=600)
    return result
finally:
    lock.release()
```

---

## MarketData

Asset search and historical data retrieval.

**Import:** `from everysk.sdk.engines.market_data import MarketData`

### search()

| Parameter | Type | Description |
|-----------|------|-------------|
| `conditions` | list | `[field, operator, value]` tuples |
| `fields` | list | Fields to return |
| `order_by` | str | Sort field |
| `limit` | int | Max records |
| `date` | str | Reference date (YYYYMMDD) |

```python
market_data = MarketData()
market_data.search(
    [['everysk_symbol', '=', 'AAPL']],
    fields=['instrument_class', 'name', 'gics_sector'],
    date='20250129',
    limit=10
)
```

**Searchable columns:** everysk_id, historical_data, everysk_symbol, country_of_risk, currency, error_text, error_type, exchange, gics_sector, extra_data, instrument_class, isin, last_prices, mkt_cap, name, security_class, updated_at, vendor_symbol, volume, tsv_search

**`extra_data` column:** Stores additional attributes, supports direct searching:
```python
market_data.search(
    [["raw_sector", "=", "Technology"]],
    fields=["instrument_class", "name", "gics_sector"],
    limit=1,
)
```

**Cache:** Search results cached for 14,400 seconds per unique request.

### get_historical()

| Parameter | Type | Description |
|-----------|------|-------------|
| `date` | str | Reference date |
| `start_date` | str | History start |
| `end_date` | str | History end |
| `ticker_list` | list | Securities to query |
| `ticker_type` | str | `'everysk_id'` or `'everysk_symbol'` |
| `projection` | list | Price types: close, high, low, average, adjusted_close |

```python
market_data.get_historical(
    date='20250915',
    start_date='20250901',
    end_date='20250916',
    ticker_list=['AAPL'],
    ticker_type='everysk_symbol',
    projection=['close', 'low']
)
# Returns dict with everysk_symbol, everysk_id, status, as_of, historical_data
# historical_data: {index: [dates], columns: [fields], data: [[values]]}
```
