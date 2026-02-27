# SDK Entities Reference

Source: https://everysk.github.io/docs/sdk/entities/

## Table of Contents
- [CustomIndex](#customindex)
- [Datastore](#datastore)
- [File](#file)
- [Portfolio](#portfolio)
- [PrivateSecurity](#privatesecurity)
- [Report](#report)
- [Tags](#tags)

---

## CustomIndex

Proprietary vector of date-value tuples representing benchmarks, risk factors, or proxies. Account-specific, workspace-independent.

**Import:** `from everysk.sdk.entities import CustomIndex`

**Attributes:**
| Attribute | Description |
|-----------|-------------|
| `symbol` | Unique ID, must match `^CUSTOM:[A-Z0-9_]*$` |
| `name` | Name of the custom index |
| `description` | Descriptive text |
| `tags` | Classification labels |
| `periodicity` | Frequency (e.g., `'M'` monthly) |
| `currency` | Currency denomination |
| `base_price` | Starting price value |
| `data_type` | Type (e.g., `'PRICE'`) |
| `data` | Vector of date-value tuples |

```python
custom_index = CustomIndex()
custom_index.symbol = 'CUSTOM:INDEX'
custom_index.name = 'Custom Index'
custom_index.periodicity = 'M'
custom_index.currency = 'USD'
custom_index.base_price = 1000
custom_index.data_type = 'PRICE'
custom_index.data = [[1, 2, 3], [4, 5, 6]]
custom_index.validate()  # Checks symbol regex
```

**Methods:** `to_dict()`, `validate()`

---

## Datastore

Integrated repositories for managing and persisting data. ID pattern: `^dats_[a-zA-Z0-9]`

**Import:** `from everysk.sdk.entities import Datastore`

**Attributes:**
| Attribute | Description |
|-----------|-------------|
| `name` | Datastore name |
| `tags` | Classification labels |
| `description` | Descriptive text |
| `workspace` | Target workspace |
| `date` | Data timestamp (DateTime) |
| `data` | Content |
| `level` | Datastore level |

```python
# Create
datastore = Datastore()
datastore.name = 'SampleDatastore'
datastore.workspace = 'SampleWorkspace'
datastore.date = DateTime(2023, 9, 9, 9, 9, 9, 9)
datastore.data = 'data'
datastore.level = 1

# Script operations
datastore = Datastore.script.storage(
    storage_settings=storage_settings, dataframe=df, entity_name='name'
)
datastore = Datastore.script.get(datastore_id='dats_xxxxx')
df = datastore.to_dataframe()
```

**Methods:** `to_dict()`, `validate()`, `to_dataframe()`

---

## File

Data unit stored as single file. Supports documents, images, binary with Base64 encoding.

**Import:** `from everysk.sdk.entities import File`

**Attributes:**
| Attribute | Description |
|-----------|-------------|
| `name` | File name |
| `tags` | Classification labels |
| `description` | Descriptive text |
| `workspace` | Target workspace |
| `date` | File date |
| `data` | Base64-encoded content |
| `content_type` | Media type (e.g., `'text/plain'`) |
| `url` | Storage URL |

```python
file = File()
file.name = 'SampleFile'
file.workspace = 'SampleWorkspace'
file.data = 'base64_encoded_data'
file.content_type = 'text/plain'
```

**Methods:** `to_dict()`, `validate()`

---

## Portfolio

Collection of financial investments with FX risk management.

**Import:** `from everysk.sdk.entities import Portfolio`

**Attributes:**
| Attribute | Description |
|-----------|-------------|
| `workspace` | Target workspace |
| `name` | Portfolio name |
| `tags` | Classification labels |
| `nlv` | Net liquidation value |
| `base_currency` | Standard currency |
| `date` | Current date |
| `securities` | List of Security dictionaries |

```python
portfolio = Portfolio.script.get(portfolio_id='port_xxxxx')
csv = portfolio.to_csv()
d = portfolio.to_dict()
```

**CSV output format:** `name,date,currency,NLV,description,tags,...security_details`

**Methods:** `to_dict()`, `to_csv()`, `validate()`
- `validate()` raises `FieldValueError` if securities not of type `Securities`

---

## PrivateSecurity

Fixed income instrument registration. Symbol pattern: `^PRIVATE:[A-Z0-9_]*$`

**Import:** `from everysk.sdk.entities import PrivateSecurity`

**Attributes:**
| Attribute | Description |
|-----------|-------------|
| `symbol` | Must start with `PRIVATE:` |
| `name` | Security name |
| `currency` | Currency denomination |
| `data` | Data dictionary |
| `instrument_type` | Type (e.g., `'EQUITY'`) |

Calculation methods: SELIC, IPCA, or Private.

```python
ps = PrivateSecurity()
ps.symbol = 'PRIVATE:ABC'
ps.name = 'ABC Private Security'
ps.currency = 'USD'
ps.instrument_type = 'EQUITY'
ps.validate()
```

---

## Report

Interactive dashboards for portfolio analytics.

**Import:** `from everysk.sdk.entities import Report`

**Attributes:**
| Attribute | Description |
|-----------|-------------|
| `script` | Generation script |
| `name` | Report name |
| `workspace` | Storage workspace |
| `date` | Creation date |
| `widgets` | Visualization list |
| `url` | Report URL |
| `authorization` | Access type (`'private'`, etc.) |
| `config_cascaded` | Config settings dict |
| `layout_content` | Layout structure dict |

```python
report = Report()
report.name = 'My Report'
report.workspace = 'my_workspace'
report.widgets = [{'type': 'chart', 'data': {...}}]
report.authorization = 'private'
```

---

## Tags

Flexible tagging system with configurable size constraints.

**Import:** `from everysk.sdk.entities.tags import Tags`

**Config:** `min_size` (default 1), `max_size` (default 252)

```python
tags = Tags()
tags.append('tag1')          # Add single tag
tags.extend(['a', 'b', 'c']) # Add multiple
tags.insert(0, 'first')      # Insert at position
```

Raises `FieldValueError` if tag size outside min/max range.
