# Worker Patterns Reference

Source: https://everysk.github.io/docs/sdk/worker_base/

## WorkerBase Class

**Import:** `from everysk.sdk.worker_base import WorkerBase`

Extends `BaseDict`. Foundation for all Everysk workers.

### Required Methods (must override)

| Method | Purpose | When Called |
|--------|---------|------------|
| `handle_inputs()` | Initialize input data from `self.script_inputs` | Start of `run()` cycle |
| `handle_tasks()` | Core processing logic | After inputs initialized |
| `handle_outputs()` | Prepare return values as `BaseDict` | After tasks complete |

### Complete Worker Template

```python
from everysk.sdk.worker_base import WorkerBase
from everysk.sdk.entities import Datastore
from everysk.core.object import BaseDict
import pandas as pd

class MyWorker(WorkerBase):
    # === Inputs (from config/interface) ===
    input_text: str
    mode: str = "default"

    # === State (ALWAYS Type = None) ===
    storage_settings: BaseDict = None
    _datastore: Datastore = None

    # === Outputs ===
    datastore_id: str = None
    result: str = None
    success: bool = False

    def handle_inputs(self) -> None:
        """Initialize from self.script_inputs"""
        super().handle_inputs()
        self.input_text = self.script_inputs.input_text
        self.storage_settings = BaseDict(self.config.get('storage', {}))

    def handle_tasks(self) -> None:
        """Core processing logic"""
        df = pd.DataFrame({'result': [self.input_text]})
        self._datastore = Datastore.script.storage(
            storage_settings=self.storage_settings,
            dataframe=df,
            entity_name='output'
        )
        self.datastore_id = self._datastore.id
        self.success = True

    def handle_outputs(self) -> None:
        """Return results as BaseDict"""
        super().handle_outputs()
        out = BaseDict(
            datastore_id=self.datastore_id,
            success=self.success,
            result=self.result
        )
        return out
```

### Critical Rules

1. **State attributes:** ALWAYS `Type = None`, NEVER `Type | None = None`
2. **Use BaseDict:** For storage_settings and return values
3. **Prefix internal state:** With underscore `_datastore`, `_cache`
4. **Never init in methods:** Declare all attributes at class level
5. **Call super():** In `handle_inputs()` and `handle_outputs()`

### Simple Worker Example

```python
from everysk.sdk.worker_base import WorkerBase
from everysk.core.base import BaseDict

class NameFormatter(WorkerBase):
    name = None

    def handle_inputs(self):
        self.name = self.script_inputs.name

    def handle_tasks(self):
        self.name = self.name.lower()

    def handle_outputs(self):
        self.output = f"Worker's name set to {self.name}"
        return BaseDict(data=self.output)
```

### Common Patterns

#### Worker with MarketData + Cache
```python
from everysk.sdk.worker_base import WorkerBase
from everysk.sdk.engines import MarketData, UserCache
from everysk.core.object import BaseDict

class MarketDataWorker(WorkerBase):
    symbol: str
    _cache: UserCache = None
    _market_data: MarketData = None
    result: dict = None

    def handle_inputs(self):
        self.symbol = self.script_inputs.symbol
        self._cache = UserCache()
        self._market_data = MarketData()

    def handle_tasks(self):
        cached = self._cache.get(f'market_{self.symbol}')
        if cached:
            self.result = cached
            return
        self.result = self._market_data.search(
            [['everysk_symbol', '=', self.symbol]],
            fields=['name', 'gics_sector', 'last_prices'],
            limit=1,
        )
        self._cache.set(f'market_{self.symbol}', self.result, timeout=600)

    def handle_outputs(self):
        return BaseDict(data=self.result)
```

#### Worker with Compliance Check
```python
from everysk.sdk.worker_base import WorkerBase
from everysk.sdk.engines.compliance import Compliance
from everysk.core.object import BaseDict

class ComplianceWorker(WorkerBase):
    rules: list
    datastore_data: list
    compliant: bool = False

    def handle_inputs(self):
        self.rules = self.script_inputs.rules
        self.datastore_data = self.script_inputs.datastore_data

    def handle_tasks(self):
        result = Compliance.check(self.rules, self.datastore_data)
        self.compliant = result.get('compliant', False)

    def handle_outputs(self):
        return BaseDict(compliant=self.compliant)
```
