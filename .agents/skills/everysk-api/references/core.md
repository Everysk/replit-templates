# Everysk Core Documentation

Complete reference documentation for all Everysk Core modules.

---

# 1. Compress

## Overview

The `compress.py` module provides functionality to reduce data size through compression and decompression operations. The act of compressing some data simply means modifying the data to reduce its size.

## Supported Compression Algorithms

The module supports two primary compression algorithms:

- **gzip**: A widely-used compression method compatible with most operating systems and programming languages
- **zlib**: Another popular compression algorithm with broad OS and language support

Optional serialization formats include `pickle` and `json`.

## Compressing Data

The `compress()` function accepts data and a compression protocol parameter:

```python
from everysk.core.compress import compress

compress('string', protocol='gzip')
# Returns: b'\x1f\x8b\x08\x00\x0cO\xdbf\x02\xffK3\xb0055IM4234H2402\xb20K5\xb10N3KK\xb1\xb4H46I5\xb6LKK12\xb4j`\x99\xca\xc5\x00\x01=l\xc5%E\x99y\xe9S\xf4\x00#\x1e\xae\x1c>\x00\x00\x00'
```

## Decompressing Data

The `decompress()` function reverses the compression process:

```python
from everysk.core.compress import decompress

decompress(b'\x1f\x8b\x08\x00\x0cO\xdbf\x02\xffK3\xb0055IM4234H2402\xb20K5\xb10N3KK\xb1\xb4H46I5\xb6LKK12\xb4j`\x99\xca\xc5\x00\x01=l\xc5%E\x99y\xe9S\xf4\x00#\x1e\xae\x1c>\x00\x00\x00', protocol='gzip')
# Returns: 'string'
```

## Compress/Decompress with Serialization

The `serialize` parameter enables compression of complex data structures (dictionaries, lists, custom objects) while preserving their type:

```python
from everysk.core.datetime import Date
from everysk.core.compress import compress, decompress

compress(Date(2024, 1, 1), protocol='gzip', serialize='json')
# Returns compressed bytes

decompress(compressed_bytes, protocol='gzip', serialize='json')
# Returns: Date(2024, 1, 1)
```

This approach allows you to compress and decompress complex data structures like dictionaries and lists and retrieve the result as the same object.

---

# 2. Date

## Overview

The Date module provides comprehensive functionality for working with dates, including property extraction, date retrieval, conditional checking, and date arithmetic operations.

**Import Statement:**
```python
from everysk.core.datetime import Date
```

## Properties

### Month Name and Day Name

Extract textual representations of dates:

```python
Date(2024, 9, 23).day_name
# 'Monday'

Date(2024, 9, 23).month_name
# 'September'
```

### Numerical Properties

**Week of Year:**
```python
Date(2024, 9, 23).week_of_year
# 38
```

**Day of Year:**
```python
Date(2024, 9, 23).day_of_year
# 267
```

**Week of Month:**
```python
Date(2024, 9, 23).week_of_month
# 4
```

**Quarter:**
```python
Date(2024, 9, 23).quarter
# 3
```

## Retrieving Dates

Methods accept optional `bizdays` boolean and `calendar` string parameters.

### Get First Day of

**Week:**
```python
Date(2024, 9, 23).get_first_day_of_week()
# Date(2024, 9, 22)
```

**Month:**
```python
Date(2024, 9, 23).get_first_day_of_month()
# Date(2024, 9, 1)

Date(2024, 9, 23).get_first_day_of_month(bizdays=True)
# Date(2024, 9, 2)
```

**Quarter:**
```python
Date(2024, 9, 23).get_first_day_of_quarter()
# Date(2024, 7, 1)
```

**Year:**
```python
Date(2024, 9, 23).get_first_day_of_year()
# Date(2024, 1, 1)

Date(2024, 9, 23).get_first_day_of_year(calendar='ANBIMA')
# Date(2024, 1, 2)
```

### Get Last Day of

**Week:**
```python
Date(2024, 9, 23).get_last_day_of_week()
# Date(2024, 9, 28)
```

**Month:**
```python
Date(2024, 9, 23).get_last_day_of_month()
# Date(2024, 9, 30)
```

**Quarter:**
```python
Date(2024, 9, 23).get_last_day_of_quarter()
# Date(2024, 9, 30)
```

**Year:**
```python
Date(2024, 9, 23).get_last_day_of_year()
# Date(2024, 12, 31)
```

## Condition Checking

### Is First Day of

Returns boolean values indicating whether a date is the first day of a period.

**Week:**
```python
Date(2024, 9, 23).is_first_day_of_week()
# False

Date(2024, 9, 23).is_first_day_of_week(bizdays=True)
# True
```

**Month:**
```python
Date(2024, 9, 23).is_first_day_of_month()
# False
```

**Quarter:**
```python
Date(2024, 9, 23).is_first_day_of_quarter()
# False
```

**Year:**
```python
Date(2024, 9, 23).is_first_day_of_year()
# False
```

### Is Last Day of

Checks if a date is the last day of a given period.

**Week:**
```python
Date(2024, 9, 23).is_last_day_of_week()
# False
```

**Month:**
```python
Date(2024, 9, 23).is_last_day_of_month()
# False

Date(2024, 9, 30).is_last_day_of_month()
# True
```

**Quarter:**
```python
Date(2024, 9, 23).is_last_day_of_quarter()
# False
```

**Year:**
```python
Date(2024, 9, 23).is_last_day_of_year()
# False
```

## Running Operations on Dates

### Adding or Subtracting Days

```python
Date(2024, 9, 23).days_delta(5)
# Date(2024, 9, 28)

Date(2024, 9, 23).days_delta(-5)
# Date(2024, 9, 18)
```

### Adding or Subtracting Business Days

```python
Date(2024, 9, 23).bizdays_delta(5, calendar='ANBIMA')
# Date(2024, 9, 30)

Date(2024, 9, 23).bizdays_delta(-5, calendar='ANBIMA')
# Date(2024, 9, 16)
```

### Adding or Subtracting Weeks

```python
Date(2024, 9, 23).weeks_delta(2)
# Date(2024, 10, 7)

Date(2024, 9, 23).weeks_delta(-2)
# Date(2024, 9, 9)
```

### Adding or Subtracting Months

```python
Date(2024, 9, 23).months_delta(2)
# Date(2024, 11, 23)

Date(2024, 9, 23).months_delta(-2)
# Date(2024, 7, 23)
```

### Adding or Subtracting Years

```python
Date(2024, 9, 23).years_delta(2)
# Date(2026, 9, 23)

Date(2024, 9, 23).years_delta(-2)
# Date(2022, 9, 23)
```

### General Delta Method

```python
Date(2024, 9, 23).delta(3, 'Y')
# Date(2027, 9, 23)

Date(2024, 9, 23).delta(2, 'W')
# Date(2024, 10, 7)
```

**Periodicity codes:** D (days), B (business days), W (weeks), M (months), Y (years)

## Working with Difference Between Dates

### Days Difference

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 9, 30)
Date.days_diff(start_date, end_date)
# 7
```

### Business Days Difference

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 9, 30)
Date.bizdays_diff(start_date, end_date, calendar='ANBIMA')
# 5
```

### Weeks Difference

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 10, 7)
Date.weeks_diff(start_date, end_date)
# 2
```

### Months Difference

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 11, 23)
Date.months_diff(start_date, end_date)
# 2
```

### Years Difference

```python
start_date = Date(2024, 9, 23)
end_date = Date(2026, 9, 23)
Date.years_diff(start_date, end_date)
# 2
```

### General Difference Method

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 11, 23)
Date.diff(start_date, end_date, 'M')
# 2

start_date = Date(2024, 9, 23)
end_date = Date(2024, 10, 7)
Date.diff(start_date, end_date, 'W')
# 2
```

## Working With Date Ranges

### Create Days Range

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 10, 1)
Date.days_range(start_date, end_date)
# [
#     Date(2024, 9, 23),
#     Date(2024, 9, 24),
#     Date(2024, 9, 25),
#     Date(2024, 9, 26),
#     Date(2024, 9, 27),
#     Date(2024, 9, 28),
#     Date(2024, 9, 29),
#     Date(2024, 9, 30),
# ]
```

*Note: end_date is exclusive*

### Business Days Range

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 10, 1)
Date.bizdays_range(start_date, end_date)
# [
#     Date(2024, 9, 23),
#     Date(2024, 9, 24),
#     Date(2024, 9, 25),
#     Date(2024, 9, 26),
#     Date(2024, 9, 27),
#     Date(2024, 9, 30),
# ]

Date.bizdays_range(start_date, end_date, calendar='ANBIMA')
# [
#     Date(2024, 9, 23),
#     Date(2024, 9, 24),
#     Date(2024, 9, 25),
#     Date(2024, 9, 26),
#     Date(2024, 9, 27),
#     Date(2024, 9, 30),
# ]
```

### General Range Method

```python
start_date = Date(2024, 9, 23)
end_date = Date(2024, 9, 30)
Date.range(start_date, end_date, 'B')
# [
#     Date(2024, 9, 23),
#     Date(2024, 9, 24),
#     Date(2024, 9, 25),
#     Date(2024, 9, 26),
#     Date(2024, 9, 27)
# ]

Date.range(start_date, end_date, 'D')
# [
#     Date(2024, 9, 23),
#     Date(2024, 9, 24),
#     Date(2024, 9, 25),
#     Date(2024, 9, 26),
#     Date(2024, 9, 27),
#     Date(2024, 9, 28),
#     Date(2024, 9, 29)
# ]
```

**Periodicity codes:** B (business days), D (normal days)

## Working with Expressions to Extract Dates

### Extract a Business Day

```python
Date.get_date_from_expression('10th bizday', 2024, 10)
# Date(2024, 10, 14)
```

### Extract a Normal Day

```python
Date.get_date_from_expression('10th day', 2024, 10)
# Date(2024, 10, 10)

Date.get_date_from_expression('first day', 2024, 10)
# Date(2024, 10, 1)
```

**Keywords:** `first`, `second`, `third` for ordinal positions

### Using the Calendar Argument

```python
Date.get_date_from_expression('15th bizday', 2024, 11)
# Date(2024, 11, 21)

Date.get_date_from_expression('15th bizday', 2024, 11, calendar='ANBIMA')
# Date(2024, 11, 25)
```

### Extract the Previous Business Day

```python
Date.get_date_from_expression('previous bizday', 2024, 11, 21, calendar='ANBIMA')
# Date(2024, 11, 19)
```

### Extract the Next Business Day

```python
Date.get_date_from_expression('next bizday', 2024, 11, 19, calendar='ANBIMA')
# Date(2024, 11, 21)
```

### Extract Business Day Based on Position

```python
Date.get_date_from_expression('first bizday after 15th day', 2024, 11, calendar='ANBIMA')
# Date(2024, 11, 18)

Date.get_date_from_expression('second bizday before 22th day', 2024, 11, calendar='ANBIMA')
# Date(2024, 11, 19)
```

### Extract a Business Day After a Specific Day (with Weekday)

```python
Date.get_date_from_expression('first wed bizday after 15th day', 2024, 11, calendar='ANBIMA')
# Date(2024, 11, 27)
```

**Weekday codes:** `mon`, `tue`, `wed`, `thu`, `fri`

### Extract a Business Day Before a Specific Day (with Weekday)

```python
Date.get_date_from_expression('second thu bizday before 15th day', 2024, 9, calendar='ANBIMA')
# Date(2024, 9, 5)
```

---

# 3. DateTime

## Overview

The `DateTime` module provides comprehensive functionality for working with datetime values, including conversions, formatting, timezone handling, and date validation.

**Import:** `from everysk.core.datetime import DateTime`

## Generate DateTime Objects

### Timestamp

The `timestamp()` method retrieves seconds elapsed since January 1, 1970 (Unix Epoch).

```python
DateTime(2024, 9, 23).timestamp()
# Output: 1727049600
```

Reverse operation using `fromtimestamp()`:

```python
DateTime.fromtimestamp(1727049600)
# Output: DateTime(2024, 9, 23, 0, 0, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

### Now

The `now()` method retrieves the current datetime:

```python
DateTime.now()
# Output: DateTime(2024, 9, 23, 19, 18, 54, 904738, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

Specify timezone with `tzinfo` argument:

```python
DateTime.now(tzinfo='America/Los_Angeles')
# Output: DateTime(2024, 9, 23, 12, 18, 54, 904738, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

## Convert DateTime Values

### String to DateTime

The `string_date_to_date_time()` method converts date strings to datetime objects:

```python
DateTime.string_date_to_date_time('20240923')
# Output: DateTime(2024, 9, 23, 12, 0, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

The `force_time` parameter formats time to specific periods: _MIDDAY_, _NOW_, _FIRST_MINUTE_, _LAST_MINUTE_.

```python
DateTime.string_date_to_date_time('20240923', force_time='LAST_MINUTE')
# Output: DateTime(2024, 9, 23, 23, 59, 59, tzinfo=zoneinfo.ZoneInfo(key='UTC'))

DateTime.string_date_to_date_time('20240923', force_time='FIRST_MINUTE')
# Output: DateTime(2024, 9, 23, 0, 0, tzinfo=zoneinfo.ZoneInfo(key='UTC'))

DateTime.string_date_to_date_time('20240923', force_time='NOW')
# Output: DateTime(2024, 9, 23, 18, 21, 38, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

Default time is _MIDDAY_ when `force_time` is omitted.

### DateTime to String

The `strftime()` method converts datetime objects to strings:

```python
DateTime(2024, 9, 23).strftime()
# Output: '20240923 00:00:00'
```

Custom format using `format` parameter:

```python
DateTime(2024, 9, 23, 12, 15, 40).strftime('%Y-%m-%d T%H:%M:%S')
# Output: '2024-09-23 T12:15:40'
```

The `strftime_pretty()` method provides informal representation:

```python
DateTime(2024, 9, 23, 12, 15, 40).strftime_pretty()
# Output: 'Sep. 23, 2024, 12:15:40 p.m.'
```

Optional flags `just_date` and `just_time`:

```python
DateTime(2024, 9, 23, 12, 15, 40).strftime_pretty(just_date=True)
# Output: 'Sep. 23, 2024'

DateTime(2024, 9, 23, 12, 15, 40).strftime_pretty(just_time=True)
# Output: '12:15 p.m.'
```

### ISO Strings to DateTime

The `fromisoformat()` method converts ISO 8601 formatted strings:

```python
DateTime.fromisoformat('20240923')
# Output: DateTime(2024, 9, 23, 0, 0, tzinfo=zoneinfo.ZoneInfo(key='UTC'))

DateTime.fromisoformat('2024-09-23')
# Output: DateTime(2024, 9, 23, 0, 0, tzinfo=zoneinfo.ZoneInfo(key='UTC'))

DateTime.fromisoformat('2024-09-23T12:15:40')
# Output: DateTime(2024, 9, 23, 12, 15, 40, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

### Date to DateTime

The `date_to_date_time()` method converts Date objects:

```python
date_obj = Date(2024, 9, 23)
DateTime.date_to_date_time(date_obj)
# Output: DateTime(2024, 9, 23, 12, 0, tzinfo=zoneinfo.ZoneInfo(key='UTC'))
```

## Is today, today?

The `is_today()` method verifies if a date represents today:

```python
DateTime(2024, 9, 23).is_today()
# Output: False

current_day = DateTime.now()
current_day.is_today()
# Output: True
```

---

# 4. Exceptions

## Overview

The Exceptions module is a collection of custom exception classes designed to handle errors then raise specific exceptions based on those errors.

## Exception Hierarchy

All exceptions inherit from `_BaseException`, which extends Python's base `Exception` class. The `_BaseException` class provides a `msg` attribute used when raising errors.

## Exception Types

### APIError

Handles errors from API interactions (Bad Request, Unauthorized, Forbidden, Not Found, etc.).

```python
from everysk.core.exceptions import APIError

if code == 400:
    raise APIError("Bad Request.")
```

### DateError

Used for date-related errors, such as invalid date formats.

```python
from everysk.core.exceptions import DateError

raise DateError('Invalid date format.')
```

### DefaultError

Filters default values in base classes that accept them.

```python
from everysk.core.exceptions import DefaultError

if isinstance(default, (list, set)):
    raise DefaultError('default values cannot be a list or a set.')
```

### EntityError

Handles general entity manipulation errors (creation, saving, retrieval, deletion, updates).

```python
from everysk.core.exceptions import EntityError

raise EntityError(f'Error when deleting the entity: {entity.id}.')
```

### EntityNotFound

Specifically raised when entities cannot be located.

```python
from everysk.core.exceptions import EntityNotFound

if entity is None:
    raise EntityNotFound(f'Entity not found for update.')
```

### FieldValueError

Used in the fields module for invalid arguments. Inherits from Python's `ValueError`.

```python
from everysk.core.exceptions import FieldValueError

if size < 0:
    raise FieldValueError('size cannot be a negative number.')
```

### HttpError

Handles unsuccessful HTTP requests.

```python
from everysk.core.exceptions import HttpError

if response == 'error':
    raise HttpError(status_code=500, msg='Internal Server Error')
```

### InvalidArgumentError

Raises errors for incorrect arguments.

```python
from everysk.core.exceptions import InvalidArgumentError

if not api_sid:
    raise InvalidArgumentError('Invalid API SID.')
```

### QueryError

Handles errors from invalid queries.

```python
from everysk.core.exceptions import QueryError

if not entity and self.query is None:
    raise QueryError(f'No Entity found for this query: {self.query}.')
```

### ReadonlyError

Raised when attempting to modify readonly field values.

```python
from everysk.core.fields import DictField

dict_field = DictField(default={'key': 'value'}, readonly=True)
dict_field.default['key'] = 123
# Raises: ReadonlyError('This field value cannot be changed.')
```

### RedisEmptyListError

Raised during operations on empty Redis lists (e.g., pop operations).

```python
from everysk.core.exceptions import RedisEmptyListError

if value is None:
    raise RedisEmptyListError(f'The redis list {self.name} is empty.')
```

### RequiredError

Raised when required class attributes are not assigned.

```python
from everysk.sdk.entities import Datastore

datastore = Datastore()
datastore.validate_type_data()
# Raises: RequiredError: The "data" attribute is required.
```

### SDKError

Handles entity manipulation and creation errors.

```python
from everysk.core.fields import SDKError

if entity is not None:
    raise SDKError(f'Entity already exists. ID {self.id}.')
```

### SDKInternalError

Raised for unexpected internal errors.

```python
from everysk.core.exceptions import SDKInternalError

raise SDKInternalError('Internal Server Error. Please try again or contact support.')
```

### SDKTypeError

Handles incorrect data types. Inherits from Python's `TypeError`.

```python
from everysk.core.exceptions import SDKTypeError

if not isinstance(tags, (str, list)):
    raise SDKTypeError('The tags value must be a string or a list.')
```

### SDKValueError

Raises errors for incorrect attribute or argument values.

```python
from everysk.core.exceptions import SDKValueError

if operator != '==':
    raise SDKValueError(f'Filter by property name operator must be "==".')
```

### SigningError

Raised during unsigned operation failures.

```python
from everysk.core.signing import unsign

unsign(b'invalid:data')
# Raises: SigningError: Error trying to unsign data.
```

---

# 5. Fields

## Overview

The `Field` class serves as a base for creating object attributes with built-in validation and transformation capabilities. All field types inherit from a hierarchy starting with `BaseField`.

## Field Class Hierarchy

```
BaseField
  +-- Field
      +-- BoolField
      +-- StrField
      +-- DateField
      +-- DictField
      +-- SetField
      +-- FloatField
      +-- IntField
      +-- ListField
```

## Core Attributes

All fields inherit these configurable attributes:

- **default**: Provides a fallback value when none is specified
- **required**: Enforces mandatory field assignment
- **readonly**: Prevents modification after initialization
- **required_lazy**: Validates only when `validate_required_fields()` is called
- **empty_is_none**: Converts empty strings to `None`
- **choices**: Restricts values to a predefined list (used with `ChoiceField`)

## Key Methods

**clean_value()**: Transforms field values. Override to customize behavior.

**validate()**: Checks value validity. Raises exceptions for invalid data.

Both are called automatically when values are assigned.

## Field Types

### BoolField

Stores True/False logical values.

### DateField

Manages date objects with optional `min_date` and `max_date` constraints.

### DateTimeField

Extends DateField to include time components (hours, minutes, seconds).

### DictField

Handles key-value pair collections.

### EmailField

Validates email address format.

### FloatField

Stores decimal numbers with optional `min_size` and `max_size` bounds.

### IntField

Manages whole numbers with optional `min_value` and `max_value` constraints.

### IteratorField

Works with iterable objects (lists, sets, dictionaries, tuples, strings).

### ListField

Defines list collections with optional `min_size` and `max_size` limits.

### RegexField

Stores and validates strings against regular expression patterns.

### SetField

Manages set collections with optional `min_size` and `max_size` bounds.

### StrField

Handles text with optional `min_size`, `max_size`, and `regex` validation.

### TupleField

Stores immutable sequences.

### URLField

Validates URLs against common protocols (HTTP, HTTPS, FTP, FTPS).

---

# 6. Firestore

## Overview

Firestore is a database service by Google Cloud designed for building real-time applications. The `firestore.py` module provides functionality for saving a Firestore document, connecting, and loading data.

## Core Classes and Methods

### FirestoreClient

The `FirestoreClient` class establishes database connections by accepting `project_name` and `database_name` parameters:

```python
from everysk.core.firestore import FirestoreClient
firestore_client = FirestoreClient(project_name='my_project', database_name='my_database')
```

If parameters are omitted, the system uses `_DEFAULT_DATABASE` and the `EVERYSK_GOOGLE_CLOUD_PROJECT` setting.

### Connection Property

The `connection` property returns an existing Firestore connection or creates a new one if needed.

### Get Collection

The `get_collection()` method returns a `CollectionReference` object for the specified collection name, enabling document operations.

### Document Class

The `Document` class manages all operations related to saving, loading, and parsing Firestore documents. Each document has a unique name and contains fields mapped to values.

Basic instantiation:
```python
from everysk.core.firestore import Document
doc = Document()
```

### Loads Method

The `loads()` method retrieves all `Document` instances filtered by conditions (**<**, **<=**, **==**, **>=**, **>**, **in**):

```python
Document._config.collection_name = 'my-collection'
Document.loads(field='firestore_id', condition='==', value='my-id')
```

### Paginated Load

The `loads_paginated()` method retrieves documents in batches using a `limit` parameter to prevent API timeouts. Additional parameters include `order_by` for sorting and `fields` to restrict returned fields.

```python
Document._config.collection_name = 'my-collection'
Document.loads_paginated()
```

### Loading

The `load()` method retrieves document data using its `firestore_id`:

```python
doc = Document(firestore_id='id01')
doc._config.collection_name = 'my-collection'
doc.load()
```

### Saving

The `save()` method creates or updates a Firestore document:

```python
doc = Document(firestore_id='id01')
doc._config.collection_name = 'my-collection'
doc.save()
```

### Convert To Dictionary

The `to_dict()` method converts a `Document` to a dictionary:

```python
from everysk.core.datetime import DateTime, Date
from everysk.core.firestore import Document

doc = Document(
    firestore_id='id01',
    dct={'a': 1},
    lst=[1,2,3],
    byte=b'Text',
    date=Date(2024, 11, 15),
    created_at=DateTime.fromisoformat('2023-04-03T00:00:00+00:00'),
    datetime=DateTime.fromisoformat('2022-01-01T10:00:00+00:00')
)

doc.to_dict()
```

Output:
```python
{
    'firestore_id': 'id01',
    'dct': {'a': 1},
    'lst': [1, 2, 3],
    'byte': b'Text',
    'date': '2024-11-15',
    'created_at': '2023-04-03T00:00:00+00:00',
    'datetime': '2022-01-01T10:00:00+00:00',
    'updated_at': None
}
```

---

# 7. HTTP

## Overview

The `http.py` module from Everysk Library provides classes for handling HTTP requests. It is built on the `httpx` library supporting HTTP 1.0, 1.1, and 2 protocols. Users can either inherit from classes or use them directly.

## GET Connection

**Class:** `HttpGETConnection`

**Attributes:**
- `url` (str): Request URL
- `headers` (dict): Request headers
- `params` (dict): URL parameters
- `timeout` (int): Maximum request wait time
- `user` (str): Authentication username
- `password` (str): Authentication password
- `cert` (str): Certificate content

**Overridable Methods:**
- `get_url()` -> str
- `get_headers()` -> dict
- `get_params()` -> dict
- `message_error_check(message: str, status_code: int)` -> bool
- `get_response()` -> Response

## POST Connection

**Class:** `HttpPOSTConnection`

**Attributes:**
- `url` (str): Request URL
- `headers` (dict): Request headers
- `payload` (dict): Request body
- `timeout` (int): Maximum request wait time
- `is_json` (bool): JSON vs Form Data format
- `cert` (str): Certificate content

**Overridable Methods:**
- `get_url()` -> str
- `get_headers()` -> dict
- `get_payload()` -> dict
- `message_error_check(message: str, status_code: int)` -> bool
- `get_response()` -> httpx.Response

## Usage Patterns

**Direct instantiation:**
```python
connection = HttpGETConnection(url='http://example.com')
response = connection.get_response()
```

**Class inheritance:**
```python
class MyGETConnection(HttpGETConnection):
    url = 'http://example.com'
```

**Context manager with connection pooling:**
```python
with HttpGETConnection() as connection:
    response = connection.get_response()
```

**Batch requests:**
```python
with HttpGETConnection() as connection:
    for sec in securities:
        connection.url = f'http://example.com/{sec}'
        results[sec] = connection.get_response()
```

## Retry Logic

Implement `message_error_check()` returning `True` to trigger retries (up to 5 attempts before raising exceptions).

---

# 8. Log

## Overview

The `log.py` module enables efficient and precise logging through configurable headers, payload, tracebacks, and severity levels including DEBUG, ERROR, and INFO.

## Attributes

**extra parameter**: Accepts a dictionary with custom context for logs, displayed in terminal or Google Log Explorer.

**stacklevel parameter**: Specifies stack depth for log source identification. Defaults to `1`. Values greater than 1 skip corresponding stack frames, useful for logging from different files/functions.

## Methods

| Method | Purpose | Output Format |
|--------|---------|---------------|
| `critical(msg)` | CRITICAL severity logging | `CRITICAL - {} - message` |
| `debug(msg)` | DEBUG severity logging | `DEBUG - {} - message` |
| `deprecated(msg, show_once=True)` | WARNING with deprecation notice | `WARNING - {} - DeprecationWarning: message` |
| `error(msg)` | ERROR severity logging | `ERROR - {} - message` |
| `exception(msg)` | ERROR with traceback | `ERROR - {} - message` |
| `info(msg)` | INFO severity logging | `INFO - {} - message` |
| `warning(msg)` | WARNING severity logging | `WARNING - {} - message` |
| `slack(title, message, color, url)` | Send Slack webhook messages | Supports `danger`, `success`, `warning` colors |

All methods accept optional `extra` dictionary and `stacklevel` parameters.

## Formatter Class

The `Formatter` class converts log records to strings via `formatMessage(record)`, outputting JSON format with severity, labels, traceback, HTTP headers/payload, and Google Cloud source location data.

## LoggerManager Class

Context manager for propagating extra information (like HTTP headers) across nested log records. Usage includes `LoggerManager(http_headers={})` with `LoggerManager.reset()` to clear context.

## Google Log Explorer Integration

Set `LOGGING_JSON=True` in settings to display logs in Google Log Explorer.

---

# 9. Object

## Overview

The `object.py` module provides three main classes which will take care of the consistency of objects throughout the entire code: `BaseDict`, `BaseObject`, and `MetaClass`.

## Getting Started

The module enables field-level constraints through inheritance:

```python
from everysk.core.object import BaseObject
from everysk.core.fields import StrField

class MyClass(BaseObject):
    name = StrField(default='test', readonly=True)

test = MyClass()
```

When `readonly=True`, modification attempts raise `FieldValueError: The field 'name' value cannot be changed.`

## BaseObject Features

### Silent Initialization

The `silent` attribute suppresses initialization exceptions, storing them in `_errors` instead:

```python
obj = MyObject(number=11, silent=True)
obj._errors
# {'before_init': None, 'init': ValueError(...), 'after_init': None}
```

### Before Init

The `__before_init__` classmethod executes before object initialization:

```python
@classmethod
def __before_init__(self, **kwargs: dict) -> dict:
    if 'value' in kwargs:
        raise ValueError('value')
    return kwargs
```

Exceptions can be captured with `silent=True`.

### After Init

The `__after_init__` method performs post-processing or lazy initialization:

```python
def __after__init__(self) -> None:
    if not self.is_file_ready:
        raise ValueError('File is not ready yet.')
```

### Convert to Dict

The `to_dict()` method converts objects to dictionaries with optional parameters:

**With `add_class_path=True`:**
```python
obj.to_dict(add_class_path=True)
# Includes all class attributes and `__class_path__`
```

**With `recursion=True`:**
```python
obj.to_dict(recursion=True)
# Converts nested BaseObject instances to dictionaries
```

### Frozen Instances

Create immutable objects via Config:

```python
class MyFrozenObject(BaseObject):
    class Config:
        frozen: bool = True

obj = MyFrozenObject(attr1=123, attr2='abc')
obj.attr1 = 456  # AttributeError: Class is frozen
```

### Exclude Keys

Prevent specific keys using `BaseObjectConfig`:

```python
class MyObject(BaseObject):
    class Config(BaseObjectConfig):
        exclude_keys = frozenset(['value'])
```

Excluded keys don't appear in `to_dict()` output.

### Using Pickle

The class supports pickle serialization via `__getstate__` and `__setstate__`:

```python
import pickle

obj = BaseObject(public={'key': 'value'})
pickled_obj = pickle.dumps(obj)
new_obj = pickle.loads(pickled_obj)
```

---

# 10. Serialize

## Overview

The `serialize.py` module provides tools for converting data objects into bytes and back. Serialization is the process of converting a data object into bytes; deserialization is the opposite.

## Serializing Data

The `dumps()` method converts objects to JSON or Pickle format strings. Key parameters include:

- **`allow_nan`** (default: True): Determines handling of out-of-range float values like NaN or Infinity
- **`check_circular`** (default: True): Checks for circular references; disabling may cause RecursionError
- **`cls`**: Custom serialization class with predefined rules
- **`date_format`** / **`datetime_format`**: Format specifications (default: ISO)
- **`ensure_ascii`** (default: True): Controls ASCII character representation
- **`indent`**: JSON indentation level (None for compact output)
- **`protocol`** (default: json): Either "json" or "pickle"
- **`separators`**: Tuple defining object separation format
- **`skipkeys`** (default: False): Skips non-basic dictionary keys instead of raising errors
- **`sort_keys`** (default: False): Orders dictionary keys alphabetically
- **`add_class_path`** (default: True): Includes serialized class path in output
- **`use_undefined`** (default: False): Serializes Undefined objects as `{"__undefined__": null}` when True

## Deserializing Data

The `loads()` method reconstructs Python objects from serialized data. Parameters include:

- **`data`**: String, bytes, or bytearray containing JSON/Pickle content
- **`cls`**: Custom decoder class (default: JSONDecoder)
- **`date_format`** / **`datetime_format`**: Parsing specifications (default: ISO)
- **`object_hook`**: Optional function for dict decoding customization
- **`object_pairs_hook`**: Ordered pair processing (overrides object_hook)
- **`parse_constant`**: Handles special constants like Infinity or NaN
- **`parse_float`**: Custom float decoder
- **`parse_int`**: Custom integer decoder
- **`protocol`** (default: json): "json" or "pickle"
- **`use_undefined`**: Preserves Undefined objects when True
- **`instantiate_object`**: Retains class_path for object instantiation when True

**Warning**: The pickle module is not safe to use with untrusted data. Never unpickle data received from an untrusted or unauthenticated source.

---

# 11. SFTP

## Overview

SFTP is a secure file transfer protocol that provides file access, file transfer, and file management functionalities. The `sftp.py` module enables interaction with SFTP servers through Python.

## Installation

The `paramiko` library is required. Install via:
```
pip install everysk-lib[paramiko]
```

Note: The library comes pre-installed in the Everysk environment.

## Quick Start

```python
from everysk.core.sftp import SFTP

with SFTP(username='', password='', hostname='', port=22) as sftp:
    filename = sftp.search_by_last_modification_time(path='/dir', prefix='file_')
    file_object = sftp.get_file(filename)

print(filename)
# Output: 'file_2024-09-17.csv'
```

## SFTP Class Attributes

- `username`: Connection username
- `password`: Connection password
- `hostname`: Server hostname
- `private_key`: Private key for authentication (default: None)
- `passphrase`: Passphrase for encrypted private keys (default: None)
- `port`: Server port (default: 22)
- `timeout`: Connection timeout (default: 60 seconds)
- `compress`: Enable compression (default: True)
- `date`: Date/datetime object for filename parsing (default: today)

## Core Methods

### Retrieve File

The `get_file()` method retrieves files from the server, accepting filename strings with optional date formatting:

```python
with SFTP(username='', password='', hostname='', port=22) as sftp:
    file_object = sftp.get_file(filename='file_2024-09-17.csv')
```

Returns `None` if the file doesn't exist.

### Search by Modification Time

The `search_by_last_modification_time()` method performs recursive searches by modification time:

```python
with SFTP(username='', password='', hostname='', port=22, date=Date(2024, 11, 1)) as sftp:
    filename = sftp.search_by_last_modification_time(path='/dir01/%Y', prefix='file_%y_%m_%d')
```

### Direct Access

Access the underlying `paramiko` client via the `client` attribute for custom operations.

### Private Key Authentication

```python
with open('path/to/private_key.pem', 'r') as f:
    private_key = f.read()

with SFTP(username='username', hostname='hostname', port=22, private_key=private_key) as sftp:
    files = sftp.client.listdir_attr('/home/test')
```

## Important Notes

- Use the SFTP class as a context manager with the `with` statement
- Date formatting supports Python's strftime conventions
- The `client` attribute provides direct access to paramiko functionality (see https://docs.paramiko.org/en/stable/api/sftp.html)

---

# 12. String

## Overview

The string module provides utility methods for manipulating and processing strings, addressing common string handling challenges.

## Methods

### Is String Object

**Purpose:** Determine whether a provided object is a string type.

**Function:** `is_string_object(obj)`

**Example:**
```python
from everysk.core.string import is_string_object

is_string_object('Hello, World!')
# True

is_string_object(123)
# False
```

### Convert to String

**Purpose:** Transform any value into its string representation.

**Function:** `to_string(value)`

**Examples:**
```python
from everysk.core.string import to_string

to_string(123)
# '123'

to_string({'key': 'value'})
# "{'key': 'value'}"

to_string([1,2,3])
# '[1,2,3]'
```

### Normalize String

**Purpose:** Standardize strings by resolving Unicode representation differences that appear identical but compare as unequal.

**Problem Context:** Characters can be represented using different Unicode compositions. For instance, "a with macron" may use one codepoint (U+0101) or two (U+0061 + U+0304), causing equality comparisons to fail despite visual equivalence.

**Function:** `normalize_string(string)`

**Example:**
```python
from everysk.core.string import normalize_string

aa = b'\xc4\x81'.decode('utf-8')  # 'a with macron'
bb = b'a\xcc\x84'.decode('utf-8')  # 'a with macron'

aa == bb  # False

new_aa = normalize_string(aa)
new_bb = normalize_string(bb)
new_aa == new_bb  # True
```

### Normalize String For Search

**Purpose:** Prepare strings for search operations by normalizing Unicode, removing whitespace, and converting to lowercase.

**Function:** `normalize_string_to_search(string)`

**Example:**
```python
from everysk.core.string import normalize_string_to_search

normalize_string_to_search('  My Query   ')
# 'my query'
```

### Import From String

**Purpose:** Dynamically import Python classes or modules using dotted path notation.

**Function:** `import_from_string(dotted_path)`

**Implementation Detail:** Uses `importlib.import_module()` internally.

**Examples:**
```python
from everysk.core.string import import_from_string

import_from_string('my_module.module_name.ClassName')
# Returns: my_module.module_name.ClassName

import_from_string('invalid_module.UnknownClass')
# Raises: ModuleNotFoundError: No module named 'invalid_module'
```

**Error Handling:** Raises `ModuleNotFoundError` when the dotted path is invalid or the module cannot be imported.

---

# 13. Threads

## Overview

The `threads.py` module enables concurrent execution by allowing programs to have more than one thing happening at once. The `Thread` class executes functions in separate threads with features including context variable support and result returns.

**Import:**
```python
from everysk.core.threads import Thread
```

## Methods

### Joining

The `join()` method waits for thread completion and retrieves the execution result.

**Example:**
```python
def multiply(a: int, b: int) -> int:
    return a * b

thread = Thread(target=multiply, args=(3, 5))
thread.start()
thread.join()
# Returns: 15
```

### Start

The `start()` method initiates the thread by internally calling `run()`.

**Example:**
```python
def concatenate(a, b):
    return a + b

thread = Thread(target=concatenate, args=("Hello, ", "World!"))
thread.start()
thread.join()
# Returns: 'Hello, World!'
```

## ThreadPool

The `ThreadPool` class extends `ThreadPoolExecutor` to provide a convenient interface for executing tasks in parallel threads while managing concurrency with error handling and context propagation.

**Import:**
```python
from everysk.core.threads import ThreadPool
```

**Example:**
```python
from time import sleep

def add_integers(a, b):
    sleep(1)
    return a + b

pool = ThreadPool(concurrency=4)
for i in range(6):
    pool.add(target=add_integers, args=(i, i))

pool.wait()
print(pool.results)
# Output: [0, 2, 4, 6, 8, 10]
```

### Add

The `add()` method queues tasks for processing. Parameters include:

- `target`: Function to execute
- `args`: Function arguments
- `kwargs`: Keyword arguments

### Wait

The `wait()` method blocks until all thread pool tasks complete, ensuring full execution before proceeding.
