---
name: everysk-worker-builder
description: Expert guide for building new workers in the Everysk workers-everysk platform
---

# Everysk Worker Builder Skill

## When to Use This Skill

Use this skill when you need to:
- Create a new worker from scratch in the Everysk platform
- Understand the worker architecture and lifecycle
- Configure worker inputs, outputs, and forms
- Implement worker logic following best practices
- Debug and test workers locally
- Deploy workers to the Everysk platform

## Core Concepts

### What is a Worker?

A worker is a modular, reusable processing unit in the Everysk workflow platform. Each worker:
- Inherits from `WorkerBase`
- Follows a 3-stage lifecycle: handle_inputs → handle_tasks → handle_outputs
- Has declarative form configuration (inputs/outputs)
- Can be connected to other workers via ports
- Can process datastores, files, or other entities

### Worker Types

1. **BASIC** - Standard worker with input → processing → output flow
2. **FORKER** - Branching worker that spawns multiple workflow paths

## 🚨 CRITICAL: State Attribute Pattern

**This is the most common source of `FieldValueError` in Everysk workers. Read this carefully before writing any worker code.**

When developing Everysk workers, state attributes MUST follow this exact pattern to avoid `FieldValueError` from the validation system. This pattern was confirmed by analyzing 6 production workers in the workers-everysk codebase after debugging FieldValueError issues.

### ✅ CORRECT Pattern

```python
class MyWorker(WorkerBase):
    # Input attributes from form_inputs.json
    input_text: str
    mode: str

    # State attributes - ALWAYS use this pattern
    storage_settings: BaseDict = None
    _datastore: Datastore = None
    _my_state: CustomType = None

    # Output attributes
    result: str = None
```

### ❌ INCORRECT Patterns (Cause FieldValueError)

```python
# ❌ Using union with None - WILL FAIL VALIDATION
storage_settings: dict | BaseDict | None = None

# ❌ Using Optional - WILL FAIL VALIDATION
from typing import Optional
storage_settings: Optional[BaseDict] = None

# ❌ Removing type annotations entirely - BREAKS PYDANTIC
storage_settings = None

# ❌ Using dict instead of BaseDict - TYPE MISMATCH
storage_settings: dict = None

# ❌ Initializing as instance attributes in methods - TOO LATE
def handle_inputs(self):
    self.storage_settings = None  # WRONG - must be class-level
```

### Key Rules

1. **Always use class-level type annotations** - Declare all state attributes at the class level, not in methods
2. **Initialize with `= None` (NOT `| None = None`)** - The validation system expects the simpler pattern
3. **Use `BaseDict` for storage_settings (NOT `dict`)** - Everysk's type system requires BaseDict
4. **Never initialize as instance attributes in methods** - Pydantic validation happens before method calls
5. **Frozen dataclasses work fine with this pattern** - You can use frozen dataclasses as types (e.g., `_email: Email = None`)

### Real-World Example

This example is from a production worker (`wk_email_parser`) that passed all 26 tests after applying this pattern:

```python
from everysk.core.object import BaseDict
from everysk.sdk.worker_base import WorkerBase
from everysk.sdk.entities import Datastore, Email  # Email is a frozen dataclass
from dataclasses import dataclass

@dataclass(frozen=True)
class ParsedEmail:
    """Frozen dataclass works perfectly with this pattern"""
    subject: str
    sender: str
    recipients: list[str]

class EmailParser(WorkerBase):
    """
    Parse email content and extract structured data.

    Demonstrates the correct state attribute pattern.
    """
    # Input attributes (from form_inputs.json)
    email_id: str
    entity_name: str = "parsed_email"
    workspace: str = "main"

    # State attributes - CORRECT PATTERN
    storage_settings: BaseDict = None
    _datastore: Datastore = None
    _email: Email = None  # Email is a frozen dataclass - works fine!
    _parsed: ParsedEmail = None  # Custom frozen dataclass - works fine!

    # Output attributes
    datastore_id: str = None
    success: bool = False

    def handle_inputs(self) -> None:
        super().handle_inputs()
        # Now we can populate the state attributes
        self._email = Email.script.get(self.email_id)

    def handle_tasks(self) -> None:
        # Process the email
        self._parsed = ParsedEmail(
            subject=self._email.subject,
            sender=self._email.sender,
            recipients=self._email.recipients
        )

        # Create datastore with parsed data
        df = pd.DataFrame([{
            'subject': self._parsed.subject,
            'sender': self._parsed.sender,
            'recipient_count': len(self._parsed.recipients)
        }])

        self._datastore = Datastore.script.storage(
            storage_settings=self.storage_settings,
            dataframe=df
        )

        self.datastore_id = self._datastore.id
        self.success = True

    def handle_outputs(self) -> BaseDict:
        return BaseDict(
            datastore_id=self.datastore_id,
            success=self.success
        )
```

### Why This Pattern?

The Everysk worker validation system (built on Pydantic) validates class attributes at instantiation time. When you use:

- **Union types with None** (`BaseDict | None = None`) - Pydantic validation sees this as "this field can be None OR BaseDict" and may reject None values depending on validation order
- **Optional** (`Optional[BaseDict] = None`) - Same issue as union types
- **Wrong base type** (`dict` instead of `BaseDict`) - Type mismatch with Everysk's type system
- **Instance attributes** (set in methods) - Too late; validation already failed

The correct pattern (`BaseDict = None`) tells Pydantic: "This is a BaseDict field with a default value of None" which passes validation cleanly.

### Testing Your Pattern

After implementing this pattern, verify it works:

```bash
# Run worker tests
./run.py tests workers.wk_your_worker.tests.main

# Debug with sample args
./run.py debug wk_your_worker test_case_1
```

If you still get `FieldValueError`, check:

1. All state attributes use the correct pattern (no `| None`, no `Optional`)
2. You're using `BaseDict` not `dict` for storage_settings
3. All attributes are declared at class level (not in methods)
4. You haven't mixed patterns (some correct, some incorrect)

### Pattern Discovery Context

This pattern was discovered after systematic analysis of 6 working workers in the codebase:
- `wk_create_datastore`
- `wk_query_datastore`
- `wk_update_datastore`
- `wk_update_column`
- `wk_dataframe_merger`
- `wk_datastore_filter`

All 26 tests in `wk_email_parser` passed after applying this exact pattern. This is not a workaround—it's the correct way to declare state attributes in Everysk workers.

## Worker Directory Structure

Every worker follows this standardized structure:

```
workers/wk_<worker_name>/
├── config/
│   ├── config.json              # Worker metadata and configuration
│   ├── form_functions.py        # Python functions for dynamic form behavior
│   ├── form_inputs.json         # Input form field definitions
│   ├── form_outputs.json        # Output field structure definitions
│   ├── sample_args.json         # Sample arguments for debugging
│   └── icon.svg                 # Optional custom worker icon (max 5KB)
├── tests/
│   └── main.py                  # Unit tests for the worker
├── main.py                      # Main worker implementation/logic
├── README.md                    # Worker documentation
└── requirements.txt             # Python dependencies
```

## Step-by-Step: Creating a New Worker

### 1. Generate Worker Structure

```bash
./run.py create my_worker_name
```

This creates `workers/wk_my_worker_name/` with all template files.

### 2. Configure Worker Metadata (config.json)

```json
{
  "id": "",
  "name": "My Worker Display Name",
  "description": "Clear description of what this worker does",
  "category": "miscellaneous",        // Categories: miscellaneous, data, files, etc.
  "visible": true,
  "version": "v1",
  "icon": "data",
  "type": "BASIC",                    // or "FORKER" for branching
  "script_runtime": "python",
  "script_entry_point": "main",       // MUST match function name in main.py
  "tags": ["transformation", "data"],
  "sort_index": 0,
  "default_output": "SINGLE",         // Must match key in form_outputs.json
  "ports": [{
    "value": "in",
    "label": "IN",
    "type": "input",
    "is_visible": true
  }],
  "created": null,
  "updated": null
}
```

### 3. Define Input Form (form_inputs.json)

Structure inputs in logical groups (assemblers):

```json
{
  "input_settings": {
    "name": "Input Settings",
    "description": "Configure input parameters",
    "order": 1,
    "fields": {
      "input_text": {
        "id": "input_text",
        "name": "Input Text",
        "order": 1,
        "variants": {
          "fixed_text": {
            "name": "Fixed Text",
            "type": "string",
            "order": 1,
            "help_text": "Enter text directly",
            "is_required": true
          },
          "from_upstream": {
            "name": "From Upstream",
            "type": "upstream_node_output",
            "order": 2,
            "help_text": "Use output from previous worker"
          }
        }
      },
      "mode": {
        "id": "mode",
        "name": "Operation Mode",
        "order": 2,
        "variants": {
          "select_mode": {
            "name": "Select Mode",
            "type": "select",
            "order": 1,
            "options": [
              {"value": "mode_a", "label": "Mode A"},
              {"value": "mode_b", "label": "Mode B"}
            ],
            "is_required": true
          }
        }
      }
    }
  }
}
```

**Field Types:**
- `string` - Text input
- `number` - Numeric input
- `select` - Dropdown menu
- `date` / `datetime` - Date pickers
- `datastore` - Datastore entity selector
- `file` - File selector
- `upstream_node_output` - Output from previous worker
- `boolean` - Checkbox


#### 🚨 CRITICAL: Form Field Access Pattern

**Understanding the Form Structure Runtime Behavior**

This is a **CRITICAL** concept that causes `AttributeError` if misunderstood:

1. **UI Structure (Design Time)**: The top-level objects in `form_inputs.json` (like `"input_settings"`, `"output_settings"`) create **TABS** in the Everysk UI. This is purely for user interface organization.

2. **Runtime Structure (Execution Time)**: When your worker code runs, **ALL fields are FLATTENED** into a single namespace on `self.script_inputs`. The tab structure is completely removed.

**✅ CORRECT Field Access Pattern:**

```python
class MyWorker(WorkerBase):
    def handle_inputs(self, execution_id: str, inputs: dict):
        # ✅ CORRECT - Direct field access (flattened namespace)
        email_data = self.script_inputs.email_data
        name = self.script_inputs.name
        mode = self.script_inputs.mode
        
        # Fields are accessed directly, NOT through their tab/assembler IDs
```

**❌ INCORRECT Pattern (Causes AttributeError):**

```python
class MyWorker(WorkerBase):
    def handle_inputs(self, execution_id: str, inputs: dict):
        # ❌ WRONG - Trying to use tab structure
        email_data = self.script_inputs.email_parser_input.email_data  # AttributeError!
        
        # ❌ WRONG - Assembler nesting doesn't exist at runtime
        name = self.script_inputs.input_settings.name  # AttributeError!
```

**Common Error Message:**
```
AttributeError: 'BaseDict' object has no attribute 'email_parser_input'
AttributeError: 'BaseDict' object has no attribute 'input_settings'
```

**Why This Happens:**
- The JSON structure in `form_inputs.json` uses nested objects for UI organization
- At runtime, Everysk flattens all `fields` into `self.script_inputs`
- Only the `field.id` values become attributes on `self.script_inputs`
- The assembler/tab keys (`"input_settings"`, etc.) are **not** accessible

**Debugging Tip:**
If you get an `AttributeError` about a missing attribute on `self.script_inputs`:
1. Check if you're trying to access `self.script_inputs.{tab_id}.{field_id}` (wrong)
2. Change to `self.script_inputs.{field_id}` (correct)
3. Print `dir(self.script_inputs)` or `self.script_inputs.dict()` to see available fields
### 4. Define Outputs (form_outputs.json)

```json
{
  "SINGLE": [{
    "value": "result",
    "label": "Result",
    "type": "string",
    "help_text": "Processing result"
  }],
  "DATASTORE": [{
    "value": "datastore",
    "label": "Datastore",
    "type": "datastore",
    "nested_outputs": [
      {
        "value": "id",
        "label": "Datastore ID",
        "type": "string"
      }
    ]
  }]
}
```

The key (e.g., "SINGLE", "DATASTORE") must match `default_output` in config.json.

### 5. Implement Worker Logic (main.py)

**IMPORTANT**: Before writing worker code, review the [🚨 CRITICAL: State Attribute Pattern](#-critical-state-attribute-pattern) section to avoid `FieldValueError`.

```python
from everysk.core.object import BaseDict
from everysk.core.exceptions import WorkerError
from everysk.sdk.worker_base import WorkerBase

class MyWorker(WorkerBase):
    """
    Worker description and purpose.

    Attributes:
        Define all input fields that match form_inputs.json field IDs
    """
    # Input attributes (auto-populated from form_inputs.json)
    input_text: str
    mode: str

    # State attributes - MUST follow the correct pattern (see Critical section)
    storage_settings: BaseDict = None  # NOT: BaseDict | None = None
    _datastore: Datastore = None       # NOT: Optional[Datastore] = None

    # Output attributes
    result: str = None

    def handle_inputs(self) -> None:
        """
        First lifecycle method - process and validate inputs.

        - Access raw inputs via self.script_inputs
        - Validate input data
        - Type conversions
        - Create/retrieve entities
        """
        super().handle_inputs()  # Always call parent

        # Validate inputs
        if not self.input_text:
            raise WorkerError("input_text is required")

        # Process inputs as needed
        self.input_text = self.input_text.strip()

    def handle_tasks(self) -> None:
        """
        Second lifecycle method - main processing logic.

        This is where the worker does its work:
        - Calculations
        - Transformations
        - API calls
        - Data processing
        """
        # Example: Simple transformation
        if self.mode == "mode_a":
            self.result = self.input_text.upper()
        else:
            self.result = self.input_text.lower()

    def handle_outputs(self) -> BaseDict:
        """
        Third lifecycle method - return output to workflow.

        Must return BaseDict with keys matching form_outputs.json
        """
        return BaseDict(result=self.result)

def main(args: BaseDict) -> BaseDict:
    """
    Entry point - creates worker instance and runs it.

    Args:
        args: Input arguments from workflow (BaseDict)

    Returns:
        Worker output (BaseDict)
    """
    return MyWorker(args).run()
```

### 6. Add Dynamic Form Behavior (form_functions.py)

```python
def show_advanced_options(form_data, *args):
    """
    Control field visibility based on user selections.

    Args:
        form_data: Current form field values
        *args: Additional arguments

    Returns:
        True to show fields, False to hide
    """
    mode = form_data.get('mode', {}).get('value')
    return mode == 'advanced'

def storage_mode_create(form_data, *args):
    """Example: Show storage fields only when creating new datastore"""
    storage_settings = form_data.get('storage_settings', {})
    return storage_settings.get('storage_mode', {}).get('value') == 'create'
```

Reference in form_inputs.json:
```json
{
  "field_id": {
    "isVisibleFunction": "show_advanced_options"
  }
}
```

### 7. Write Tests (tests/main.py)

```python
from everysk.core.unittests import TestCase, mock
from everysk.core.object import BaseDict
from workers.wk_my_worker.main import main, MyWorker

class MyWorkerTestCase(TestCase):

    def setUp(self):
        """Set up test fixtures"""
        self.args = BaseDict(
            input_text="test input",
            mode="mode_a"
        )
        self.worker = MyWorker(self.args)

    def test_handle_inputs(self):
        """Test input processing"""
        self.worker.handle_inputs()
        self.assertEqual(self.worker.input_text, "test input")

    def test_handle_tasks_mode_a(self):
        """Test processing in mode A"""
        self.worker.handle_inputs()
        self.worker.handle_tasks()
        self.assertEqual(self.worker.result, "TEST INPUT")

    def test_handle_tasks_mode_b(self):
        """Test processing in mode B"""
        self.worker.mode = "mode_b"
        self.worker.handle_inputs()
        self.worker.handle_tasks()
        self.assertEqual(self.worker.result, "test input")

    def test_main(self):
        """Test complete worker flow"""
        result = main(self.args)
        self.assertIn("result", result)
        self.assertEqual(result.result, "TEST INPUT")

    def test_invalid_input(self):
        """Test error handling"""
        args = BaseDict(input_text="", mode="mode_a")
        with self.assertRaises(WorkerError):
            MyWorker(args).run()
```

### 8. Add Dependencies (requirements.txt)

```txt
everysk-lib[httpx]==1.6.1504
pandas==2.2.3          # If working with dataframes
numpy==2.2.3           # If numerical operations
```

### 9. Create Debug Samples (sample_args.json)

```json
{
  "test_case_1": {
    "script_inputs": {
      "input_text": {
        "value": "Hello World",
        "variant": "fixed_text"
      },
      "mode": {
        "value": "mode_a",
        "variant": "select_mode"
      }
    }
  }
}
```

## Common Worker Patterns

### Pattern 1: Simple Data Transformer

```python
class TransformerWorker(WorkerBase):
    input_value: str
    result: str = None

    def handle_inputs(self) -> None:
        super().handle_inputs()
        # Minimal input validation

    def handle_tasks(self) -> None:
        # Apply transformation
        self.result = transform(self.input_value)

    def handle_outputs(self) -> BaseDict:
        return BaseDict(result=self.result)
```

### Pattern 2: Datastore Worker

```python
from everysk.sdk.entities import Datastore
import pandas as pd

class DatastoreWorker(WorkerBase):
    # Input attributes
    datastore: BaseDict
    storage_settings: BaseDict

    # State attributes - CORRECT PATTERN (see Critical section)
    _input_ds: Datastore = None
    _result_datastore: Datastore = None

    def handle_inputs(self) -> None:
        super().handle_inputs()
        # Load datastore
        self._input_ds = Datastore.script.get(self.datastore.get("value"))

    def handle_tasks(self) -> None:
        # Get dataframe
        df = self._input_ds.get_dataframe()

        # Transform data
        df["new_column"] = df["existing_column"].apply(lambda x: x * 2)

        # Store result
        self._result_datastore = Datastore.script.storage(
            datastore=self.datastore,
            storage_settings=self.storage_settings,
            dataframe=df
        )

    def handle_outputs(self) -> BaseDict:
        return BaseDict(
            datastore=BaseDict(
                id=self._result_datastore.id,
                name=self._result_datastore.name
            )
        )
```

### Pattern 3: Multi-Mode Worker

```python
class MultiModeWorker(WorkerBase):
    mode: str
    # Mode-specific attributes

    def handle_tasks(self) -> None:
        if self.mode == "mode_a":
            self._process_mode_a()
        elif self.mode == "mode_b":
            self._process_mode_b()
        else:
            raise WorkerError(f"Unknown mode: {self.mode}")

    def _process_mode_a(self) -> None:
        # Mode A logic
        pass

    def _process_mode_b(self) -> None:
        # Mode B logic
        pass
```

## 🔗 File Retriever Integration and Upstream Data

### Understanding File Retriever Output

The **File Retriever** worker is a common upstream data source that outputs base64-encoded JSON. Understanding its output format is critical for workers that consume file data.

**File Retriever Output Structure:**

```python
{
    "file": {
        "id": "file_abc123",
        "name": "document.pdf",
        "data": "eyJjb250ZW50IjogIi4uLiJ9",  # Base64-encoded JSON
        "content_type": "application/json"
    }
}
```

The `file.data` field contains base64-encoded JSON that, when decoded, provides:

```python
{
    "content": "...actual file content...",
    "metadata": {...},
    "extracted_data": {...}
}
```

### Upstream Data Connection Pattern

Workers can receive data from upstream workers through two mechanisms:

1. **Direct Field Connection**: Using `upstream_node_output` field type
2. **Nested Attributes**: Using `nestedAttributes` configuration type

**Form Configuration for Upstream Data:**

All form fields should support both manual input and upstream data variants:

```json
{
  "email_data": {
    "id": "email_data",
    "name": "Email Data",
    "order": 1,
    "variants": {
      "metaString": {
        "name": "Template Text",
        "type": "string",
        "order": 1,
        "help_text": "Manually enter data or use template"
      },
      "previousWorkers": {
        "name": "From Upstream",
        "type": "nestedAttributes",
        "order": 2,
        "filterType": ["string", "list"],
        "listFilterType": ["object", "string"],
        "help_text": "Use data from File Retriever or other upstream workers"
      }
    }
  }
}
```

**Key Configuration Properties:**

- `filterType: ["string", "list"]` - Accepts both single values and lists
- `listFilterType: ["object", "string"]` - List elements can be objects or strings
- `type: "nestedAttributes"` - Enables upstream data connection

### Implementation Pattern for Upstream Data

**1. Handle Multiple Input Formats:**

```python
from dataclasses import dataclass
import json

@dataclass
class EmailData:
    subject: str
    sender: str
    recipients: list[str]
    attachments: list[dict]

    @classmethod
    def from_dict(cls, data: dict | str | list) -> 'EmailData':
        """
        Parse email data from various formats.

        Handles:
        - Direct dict (manual input)
        - JSON string from upstream (File Retriever)
        - List of dicts/strings (multiple emails)
        """
        # Handle JSON string from upstream workers
        if isinstance(data, str):
            if data.strip():
                try:
                    data = json.loads(data)
                except json.JSONDecodeError:
                    raise WorkerError(f"Invalid JSON in email_data: {data}")
            else:
                data = {}

        # Handle list of items
        if isinstance(data, list):
            # Process first item or combine all items
            data = data[0] if data else {}

        # Extract fields with defaults
        return cls(
            subject=data.get('subject', ''),
            sender=data.get('sender', ''),
            recipients=data.get('recipients', []),
            attachments=cls._parse_attachments(data.get('attachments', []))
        )

    @classmethod
    def _parse_attachments(cls, attachments: str | list) -> list[dict]:
        """Parse attachments that may come as JSON string or list."""
        if isinstance(attachments, str):
            if attachments.strip():
                try:
                    attachments = json.loads(attachments)
                except json.JSONDecodeError:
                    return []
            else:
                return []

        if not isinstance(attachments, list):
            return []

        # Validate each attachment has required fields
        validated = []
        for att in attachments:
            if isinstance(att, dict) and 'filename' in att:
                validated.append(att)

        return validated
```

**2. Worker Implementation with Upstream Support:**

```python
class EmailParserWorker(WorkerBase):
    """
    Parse email data from manual input or File Retriever upstream.

    Supports:
    - Manual email data entry (metaString variant)
    - File Retriever output (previousWorkers variant)
    - Base64-decoded JSON from file.data field
    """
    # Input attributes
    email_data: str | dict | list  # Support multiple formats

    # State attributes
    storage_settings: BaseDict = None
    _parsed_email: EmailData = None
    _datastore: Datastore = None

    # Output attributes
    datastore_id: str = None

    def handle_inputs(self) -> None:
        super().handle_inputs()

        # Parse email data from any format
        self._parsed_email = EmailData.from_dict(self.email_data)

        # Validate required fields
        if not self._parsed_email.subject:
            raise WorkerError("Email subject is required")

    def handle_tasks(self) -> None:
        # Create dataframe from parsed email
        df = pd.DataFrame([{
            'subject': self._parsed_email.subject,
            'sender': self._parsed_email.sender,
            'recipient_count': len(self._parsed_email.recipients),
            'attachment_count': len(self._parsed_email.attachments)
        }])

        # Store to datastore
        self._datastore = Datastore.script.storage(
            storage_settings=self.storage_settings,
            dataframe=df
        )
        self.datastore_id = self._datastore.id

    def handle_outputs(self) -> BaseDict:
        return BaseDict(datastore_id=self.datastore_id)
```

### Backward Compatibility Pattern

Always maintain backward compatibility with existing input formats:

```python
def _parse_field(self, field_data: str | dict | list, field_name: str) -> dict:
    """
    Generic parser that maintains backward compatibility.

    Args:
        field_data: Data in any format (string, dict, list)
        field_name: Field name for error messages

    Returns:
        Parsed dict
    """
    # Handle empty/None
    if not field_data:
        return {}

    # Handle JSON string (from upstream)
    if isinstance(field_data, str):
        if field_data.strip():
            try:
                field_data = json.loads(field_data)
            except json.JSONDecodeError:
                raise WorkerError(f"Invalid JSON in {field_name}: {field_data}")
        else:
            return {}

    # Handle list (take first item)
    if isinstance(field_data, list):
        field_data = field_data[0] if field_data else {}

    # Ensure it's a dict
    if not isinstance(field_data, dict):
        raise WorkerError(f"{field_name} must be a dict, got {type(field_data)}")

    return field_data
```

### Testing Upstream Data Handling

**Standalone Test Pattern:**

Create test files without everysk dependencies for faster iteration:

```python
# config/test_attachments_parsing.py
"""Standalone test for attachment parsing logic"""
from dataclasses import dataclass
import json

@dataclass
class Attachment:
    """Minimal dataclass for testing"""
    filename: str
    content_type: str
    size: int

def parse_attachments(attachments: str | list) -> list[Attachment]:
    """Test implementation of attachment parsing"""
    if isinstance(attachments, str):
        if attachments.strip():
            try:
                attachments = json.loads(attachments)
            except json.JSONDecodeError:
                return []
        else:
            return []

    if not isinstance(attachments, list):
        return []

    result = []
    for att in attachments:
        if isinstance(att, dict) and 'filename' in att:
            result.append(Attachment(
                filename=att['filename'],
                content_type=att.get('content_type', 'application/octet-stream'),
                size=att.get('size', 0)
            ))
    return result

# Test cases
def test_json_string():
    """Test JSON string from upstream"""
    json_str = json.dumps([
        {"filename": "doc.pdf", "content_type": "application/pdf", "size": 1024}
    ])
    result = parse_attachments(json_str)
    assert len(result) == 1
    assert result[0].filename == "doc.pdf"

def test_list_of_dicts():
    """Test direct list input"""
    attachments = [
        {"filename": "doc.pdf", "content_type": "application/pdf", "size": 1024}
    ]
    result = parse_attachments(attachments)
    assert len(result) == 1

def test_empty_string():
    """Test empty string handling"""
    result = parse_attachments("")
    assert result == []

def test_invalid_json():
    """Test invalid JSON handling"""
    result = parse_attachments("not valid json")
    assert result == []

if __name__ == "__main__":
    # Run all tests
    test_json_string()
    test_list_of_dicts()
    test_empty_string()
    test_invalid_json()
    print("✅ All tests passed!")
```

Run standalone tests:

```bash
python config/test_attachments_parsing.py
```

### Upstream Data Best Practices

1. **Always Support Multiple Formats**: Fields should accept string, dict, and list inputs
2. **Parse JSON Strings**: Upstream workers may serialize complex objects as JSON strings
3. **Validate Data**: Check for required fields after parsing
4. **Provide Defaults**: Use default values when fields are missing
5. **Test All Paths**: Test manual input, upstream data, and edge cases
6. **Maintain Backward Compatibility**: Don't break existing workflows when adding upstream support
7. **Document Data Formats**: Document expected input formats in docstrings and README

### Real-World Example: Email Parser v2

The Email Parser v2 worker demonstrates all these patterns:

- Accepts email data from File Retriever (base64-encoded JSON)
- Parses JSON strings for nested fields (attachments, recipients)
- Maintains backward compatibility with manual input
- Supports both `metaString` and `previousWorkers` variants
- Has 6 comprehensive standalone tests
- Successfully deployed with all 26 tests passing

## Key SDK Components

### Core Imports

```python
# Base classes and utilities
from everysk.core.object import BaseDict           # Dict with attribute access
from everysk.core.exceptions import WorkerError    # Custom errors
from everysk.core.datetime import Date, DateTime   # Date handling
from everysk.core.fields import StrField, IntField # Field validators
from everysk.core.unittests import TestCase, mock  # Testing

# Worker base
from everysk.sdk.worker_base import WorkerBase

# Entities
from everysk.sdk.entities import Datastore         # Datastore operations
from everysk.sdk.entities import File              # File operations
from everysk.sdk.entities.tags import Tags         # Tag handling
```

### BaseDict Usage

```python
# Create
data = BaseDict(key1="value1", key2="value2")

# Access (both ways work)
value = data.key1
value = data["key1"]

# Nested access
data = BaseDict(
    settings=BaseDict(
        option="value"
    )
)
value = data.settings.option
```

### Datastore Operations

```python
# Get datastore
ds = Datastore.script.get(datastore_id)

# Get as DataFrame
df = ds.get_dataframe()

# Store datastore (create or update)
result_ds = Datastore.script.storage(
    datastore=input_datastore_dict,  # Original datastore info
    storage_settings=storage_settings,  # Settings from form
    dataframe=df  # Transformed data
)

# Access properties
ds.id
ds.name
ds.columns
ds.rows
```

## Testing and Debugging

### Run Tests

```bash
# All tests
./run.py tests

# Specific worker
./run.py tests workers.wk_my_worker.tests.main

# Specific test case
./run.py tests workers.wk_my_worker.tests.main.MyWorkerTestCase

# Check coverage
./run.py coverage
```

### Debug Locally

```bash
# Debug with sample args
./run.py debug wk_my_worker test_case_1

# Set breakpoints in code
import pdb; pdb.set_trace()
```

### Common Testing Patterns

```python
# Mock external calls
@mock.patch('workers.wk_my_worker.main.external_api_call')
def test_with_mock(self, mock_api):
    mock_api.return_value = "mocked result"
    result = main(self.args)
    self.assertEqual(result.data, "mocked result")

# Test error cases
def test_error_handling(self):
    with self.assertRaises(WorkerError):
        invalid_worker = MyWorker(BaseDict(invalid="data"))
        invalid_worker.run()

# Test dataframe operations
def test_dataframe_transform(self):
    df = pd.DataFrame({"col1": [1, 2, 3]})
    self.worker.input_df = df
    self.worker.handle_tasks()
    self.assertEqual(len(self.worker.output_df), 3)
```

## Deployment

### 🚨 CRITICAL: Docker Deployment Pattern

**The --login Flag Will Break Your Deployment**

Docker deployment MUST use bash WITHOUT the `--login` flag. Using `--login` sources bash profile files that execute test suites and prevent deployment from proceeding.

**✅ CORRECT Deployment Command:**

```bash
# Navigate to project root
cd /home/chicagojoe/PyCharmProjects/everysk/workers-joe

# Deploy using Docker (CORRECT METHOD)
docker run --rm \
  --entrypoint /bin/bash \
  -v "$(pwd)":/var/app -w /var/app \
  -e USER_NAME="${USER_NAME}" \
  -e USER_PASSWORD="${USER_PASSWORD}" \
  -e USER_ORGANIZATION="${USER_ORGANIZATION}" \
  -e EVERYSK_API_URL="${EVERYSK_API_URL}" \
  -e EVERYSK_UPDATE_IMAGES="True" \
  everysk-workers-joe:latest \
  -c "python /var/app/run.py deploy wk_email_parser"

# Key points:
# - Use --entrypoint /bin/bash (NOT default ENTRYPOINT)
# - Do NOT use --login flag (causes test execution)
# - Use worker folder name ONLY (e.g., wk_email_parser)
# - DO NOT include "workers/" prefix (e.g., NOT workers/wk_email_parser)
# - MUST include EVERYSK_UPDATE_IMAGES="True" to force deployment
# - Run from project root, not from worker directory
```

**❌ INCORRECT Pattern (Causes Test Execution):**

```bash
# ❌ WRONG - Uses default ENTRYPOINT with --login
docker run --rm \
  -v "$(pwd)":/var/app -w /var/app \
  everysk-workers-joe:latest \
  python scripts/deploy.py wk_email_parser

# This will execute:
# - bash --login -c "python scripts/deploy.py..."
# - bash --login sources ~/.bashrc or ~/.bash_profile
# - Profile files execute test suites
# - You'll see "Running tests..." and deployment never proceeds
```

**Why This Happens:**

The Docker image's default `ENTRYPOINT` may use `bash --login`, which:
1. Sources user profile files (`~/.bashrc`, `~/.bash_profile`)
2. These profile files often run test suites or other initialization
3. Test execution blocks the deployment script
4. Deployment appears to hang at "Running tests..."

**Solution:**

Override the entrypoint with `--entrypoint /bin/bash` and use `-c` to execute commands directly, bypassing profile file execution.

**Alternative Methods (Legacy - use Docker method above):**

```bash
# Using run.py script (if available)
./run.py deploy wk_my_worker

# Delete from platform
./run.py delete <worker_id>
```

### Pre-Deployment Checklist

Complete this checklist before every deployment to avoid common issues:

- [ ] **Code and Tests**
  - [ ] All tests pass (`./run.py tests` or `pytest`)
  - [ ] Test coverage is adequate (`./run.py coverage`)
  - [ ] Fix any unrelated test failures (see Troubleshooting)
  - [ ] Run standalone tests if available (e.g., `python config/test_file.py`)

- [ ] **Configuration Files**
  - [ ] Create backups of critical files (config.json, form_inputs.json, main.py)
  - [ ] config.json is complete and accurate
  - [ ] form_inputs.json defines all required inputs
  - [ ] form_outputs.json matches handle_outputs() return
  - [ ] sample_args.json has test cases for debugging

- [ ] **Code Quality**
  - [ ] Code uses correct field access pattern (flattened, not nested)
  - [ ] State attributes follow correct pattern (no `| None`, no `Optional`)
  - [ ] Upstream data handling implemented correctly (if applicable)
  - [ ] JSON string parsing in `from_dict()` for nested fields (if applicable)

- [ ] **Documentation**
  - [ ] README.md documents usage and examples
  - [ ] Skill documentation updated with learnings
  - [ ] Memory storage for critical implementation details

- [ ] **Dependencies and Environment**
  - [ ] requirements.txt includes all dependencies
  - [ ] Environment variables are set (USER_NAME, USER_PASSWORD, etc.)
  - [ ] Docker image built: `docker build -f docker/Dockerfile -t everysk-workers-joe:latest .`

- [ ] **Deployment Command**
  - [ ] Using correct Docker command (no --login flag)
  - [ ] Using `--entrypoint /bin/bash` override
  - [ ] Worker name is folder name only (no `workers/` prefix)
  - [ ] `EVERYSK_UPDATE_IMAGES="True"` is set

- [ ] **Post-Deployment**
  - [ ] Verify config.json updated successfully on platform
  - [ ] Test worker in Everysk platform
  - [ ] Commit changes to appropriate branch
  - [ ] Push to remote repository

### Deployment Troubleshooting

**Issue**: Deployment hangs at "Running tests..." and never proceeds
- **Cause**: Using default Docker ENTRYPOINT with `--login` flag that sources bash profiles
- **Solution**: Use `--entrypoint /bin/bash` without `--login` flag
- **Example**: See correct deployment command pattern above

**Issue**: Header key mismatch in helpers test
- **Symptom**: Test expects `EVERYSK_MANAGED_DEPLOY` but code uses `Everysk-Managed-Deploy`
- **Solution**: Use all-caps with underscores (environment variable style) in deployment headers
- **Pattern**: `EVERYSK_MANAGED_DEPLOY` not `Everysk-Managed-Deploy`

**Issue**: Deployment doesn't update worker on platform
- **Solution**: Ensure `EVERYSK_UPDATE_IMAGES="True"` is set in docker command
- **Solution**: Verify you're using folder name only (not `workers/wk_name`)

**Issue**: "Worker not found" error during deployment
- **Solution**: Check that worker folder exists in `workers/` directory
- **Solution**: Verify `config.json` exists and is valid JSON

**Issue**: Environment variables not found
- **Solution**: Verify environment variables are set: `echo $USER_NAME`
- **Solution**: Export variables in current shell session before deployment

## Shared Libraries

Reusable code in `workers/libs/`:

```python
# Expression handling
from libs.expression.handling import ExpressionHandler

# File operations
from libs.file_transfer.handlers import OperationHandler

# Database utilities
from libs.database.operations import DatabaseOperation

# Entity utilities
from libs.entity.handlers import EntityHandler
```

## Best Practices

### Code Organization

1. **Single Responsibility**: Each worker should do one thing well
2. **Reusability**: Extract shared logic to `libs/` directory
3. **Type Hints**: Use type hints for clarity
4. **Docstrings**: Document classes and complex methods
5. **Error Handling**: Use `WorkerError` with clear messages

### Input Validation

```python
def handle_inputs(self) -> None:
    super().handle_inputs()

    # Validate required fields
    if not self.required_field:
        raise WorkerError("required_field must be provided")

    # Validate types
    if not isinstance(self.numeric_field, (int, float)):
        raise WorkerError("numeric_field must be a number")

    # Validate ranges
    if self.percentage < 0 or self.percentage > 100:
        raise WorkerError("percentage must be between 0 and 100")
```

### Datastore Operations

```python
# Always check datastore exists
if not self.datastore or not self.datastore.get("value"):
    raise WorkerError("Datastore is required")

# Handle storage mode
storage_mode = self.storage_settings.get("storage_mode", {}).get("value")
if storage_mode == "create":
    # Creating new datastore
    pass
elif storage_mode == "update":
    # Updating existing (check consistency)
    pass
```

### Testing

1. **Test Coverage**: Aim for 100% line coverage
2. **Test All Modes**: If worker has modes, test each one
3. **Test Error Cases**: Don't just test happy path
4. **Use Mocks**: Mock external dependencies
5. **Descriptive Names**: Test names should describe what they test

### Performance

1. **Efficient DataFrames**: Use pandas vectorized operations
2. **Batch Processing**: Process data in batches for large datasets
3. **Memory Management**: Be mindful of memory with large files
4. **Caching**: Cache expensive computations when appropriate

## Troubleshooting

### Common Issues

**Issue**: `FieldValueError` when instantiating worker
- **Solution**: Review the [🚨 CRITICAL: State Attribute Pattern](#-critical-state-attribute-pattern) section. This is almost always caused by incorrect attribute declarations (using `| None`, `Optional`, or `dict` instead of `BaseDict`)

**Issue**: "Module not found" error
- **Solution**: Add dependency to requirements.txt, restart environment

**Issue**: Form fields not showing/hiding correctly
- **Solution**: Check form_functions.py function names match isVisibleFunction

**Issue**: Worker output not matching expected format
- **Solution**: Verify handle_outputs() return matches form_outputs.json keys

**Issue**: Tests failing with import errors
- **Solution**: Ensure PYTHONPATH includes workers directory

**Issue**: Datastore consistency errors
- **Solution**: Check storage_mode and handle create/update appropriately


**Issue**: `AttributeError: 'BaseDict' object has no attribute '{tab_id}'`
- **Root Cause**: Trying to access form fields using nested tab structure (e.g., `self.script_inputs.input_settings.field_name`)
- **Solution**: Use flattened field access (e.g., `self.script_inputs.field_name`)
- **Explanation**: Form tabs in `form_inputs.json` are UI-only. At runtime, all fields are flattened into `self.script_inputs`
- **How to Identify**: Search your code for patterns like `self.script_inputs.{assembler_id}.{field_id}`
- **See**: [🚨 CRITICAL: Form Field Access Pattern](#-critical-form-field-access-pattern) section

**Issue**: Worker works locally but fails in Everysk platform
- **Solution**: Check that you're not using any local file paths or environment-specific code
- **Solution**: Verify all dependencies are in requirements.txt
- **Solution**: Test using sample_args.json that mimics platform data structure

**Issue**: Attachments or nested fields come as JSON strings from upstream
- **Cause**: File Retriever and other upstream workers serialize complex objects as JSON strings
- **Solution**: Parse JSON strings in `from_dict()` method using the upstream data pattern
- **Example**: See [File Retriever Integration](#-file-retriever-integration-and-upstream-data) section
- **Pattern**: Check `isinstance(field, str)`, parse with `json.loads()`, provide defaults on error

## 🧠 Memory Storage and Knowledge Management

### Why Store Implementation Learnings

Critical implementation details that aren't obvious from code should be documented in memory systems for future reference. This prevents re-discovering the same issues and patterns.

### What to Store

**Store these types of knowledge:**

1. **Non-Obvious Patterns**: Implementation patterns that caused issues until discovered
   - Example: State attribute pattern (no `| None`, no `Optional`)
   - Example: Form field flattening behavior
   - Example: Docker deployment `--login` flag issue

2. **Integration Discoveries**: How different workers/systems interact
   - Example: File Retriever base64-encoded JSON output
   - Example: Upstream data JSON string parsing
   - Example: Field access patterns across worker boundaries

3. **Deployment Gotchas**: Issues that only appear during deployment
   - Example: Header key format (underscores vs hyphens)
   - Example: Test execution blocking deployment
   - Example: Environment variable requirements

4. **Architecture Decisions**: Why certain approaches were chosen
   - Example: Why `from_dict()` handles multiple formats
   - Example: Why standalone tests are valuable
   - Example: Backward compatibility requirements

### Memory Storage Options

**1. Serena Memories (Project-Specific)**

Use for project-specific context that applies to the current codebase:

```bash
# Store via serena MCP
write_memory(
    memory_file_name="everysk_deployment_patterns.md",
    content="""
    # Everysk Deployment Patterns

    ## Docker Deployment
    - MUST use --entrypoint /bin/bash
    - NEVER use --login flag
    - Reason: --login sources bash profiles that run tests

    ## Field Access
    - Form tabs are UI-only
    - Runtime: all fields flattened to self.script_inputs
    - Never use self.script_inputs.{tab}.{field}
    """
)
```

**2. MCP Memory Service (Semantic Search)**

Use for semantic search across sessions with natural language queries:

```python
# Store via mcp-memory-service
store_memory(
    content="File Retriever outputs base64-encoded JSON in file.data field. Downstream workers must decode and parse JSON strings for nested fields like attachments.",
    metadata={
        "tags": "everysk,file-retriever,upstream-data,json-parsing",
        "type": "integration-pattern"
    }
)

# Retrieve later
recall_memory(query="how does file retriever output data")
retrieve_memory(query="parsing upstream worker data")
search_by_tag(tags=["upstream-data", "json-parsing"])
```

**3. MCP Memory LibSQL (Entity Graphs)**

Use for structured relationships between components:

```python
# Create entities and relations
create_entities([
    {
        "name": "FileRetriever",
        "entityType": "worker",
        "observations": [
            "Outputs base64-encoded JSON",
            "JSON contains file.data field",
            "Used as upstream data source"
        ]
    },
    {
        "name": "EmailParser",
        "entityType": "worker",
        "observations": [
            "Consumes File Retriever output",
            "Parses JSON strings for attachments",
            "Supports metaString and previousWorkers variants"
        ]
    }
])

create_relations([
    {
        "source": "FileRetriever",
        "target": "EmailParser",
        "type": "provides_data_to"
    }
])

# Query relationships
search_nodes(query="workers that consume file retriever")
```

**4. Skill Documentation (This File)**

Update this skill file for:
- Patterns that apply across all workers
- Critical implementation requirements
- Common troubleshooting solutions
- Best practices and conventions

### Tagging Strategy

Use consistent tags for easy retrieval:

**Category Tags:**
- `everysk` - All Everysk-related knowledge
- `worker-development` - Worker implementation patterns
- `deployment` - Deployment-specific knowledge
- `upstream-data` - Inter-worker data passing
- `testing` - Testing patterns and issues

**Type Tags:**
- `critical-pattern` - Patterns that cause failures if not followed
- `integration` - How components work together
- `troubleshooting` - Solutions to common issues
- `best-practice` - Recommended approaches

**Component Tags:**
- `file-retriever` - File Retriever worker
- `email-parser` - Email Parser worker
- `docker` - Docker-related issues
- `form-fields` - Form configuration

**Example Tagging:**

```python
store_memory(
    content="State attributes MUST use pattern: `attribute: Type = None` (not `Type | None = None`)",
    metadata={
        "tags": "everysk,worker-development,critical-pattern,pydantic,state-attributes",
        "type": "implementation-pattern"
    }
)
```

### When to Store Memories

**Store immediately after:**

1. **Solving a Non-Obvious Issue**: If it took significant debugging to discover
2. **Discovering Integration Details**: When you learn how components interact
3. **Deployment Success**: After successful deployment with new patterns
4. **Test Suite Completion**: When tests reveal important patterns

**Don't store:**

1. Information already well-documented in code comments
2. Obvious Python/programming patterns
3. Standard library usage
4. Information easily found in official docs

### Memory Retrieval in Future Sessions

**Before starting work on workers:**

```python
# Search memories for context
recall_memory(query="what did I learn about everysk deployment last week")
retrieve_memory(query="file retriever upstream data handling")
search_by_tag(tags=["everysk", "critical-pattern"])

# Read project-specific memories
list_memories()  # See available memories
read_memory(memory_file_name="everysk_deployment_patterns.md")
```

**During debugging:**

```python
# Semantic search for similar issues
retrieve_memory(query="field value error pydantic validation")
retrieve_memory(query="json string parsing from upstream")

# Tag-based search for patterns
search_by_tag(tags=["troubleshooting", "deployment"])
```

### Memory Management Best Practices

1. **Use Descriptive Content**: Write memories as if explaining to a colleague
2. **Include Context**: Explain why, not just what
3. **Tag Consistently**: Use the tagging strategy above
4. **Update, Don't Duplicate**: Search before storing to avoid duplicates
5. **Clean Up Outdated**: Delete memories when patterns change
6. **Cross-Reference**: Link memories to skill documentation
7. **Date Important Findings**: Include dates for time-sensitive patterns

### Example Memory Workflow

**After Email Parser v2 Implementation:**

```python
# 1. Store critical Docker deployment pattern
store_memory(
    content="Docker deployment for Everysk workers MUST use `--entrypoint /bin/bash` without `--login` flag. The --login flag sources bash profiles that execute test suites and prevent deployment. Use: `docker run --entrypoint /bin/bash -c 'command'`",
    metadata={
        "tags": "everysk,deployment,docker,critical-pattern,troubleshooting",
        "type": "deployment-pattern"
    }
)

# 2. Store upstream data integration pattern
store_memory(
    content="File Retriever outputs base64-encoded JSON in file.data field. Downstream workers must handle JSON strings for nested fields. Use pattern: if isinstance(field, str): field = json.loads(field) with try/except. Always provide defaults on parse errors.",
    metadata={
        "tags": "everysk,file-retriever,upstream-data,integration,json-parsing",
        "type": "integration-pattern"
    }
)

# 3. Store entity relationships
create_entities([
    {
        "name": "wk_email_parser_v2",
        "entityType": "worker",
        "observations": [
            "Parses email data from multiple sources",
            "Handles File Retriever upstream data",
            "26 tests passing",
            "Deployed successfully 2026-01-20"
        ]
    }
])

create_relations([
    {
        "source": "FileRetriever",
        "target": "wk_email_parser_v2",
        "type": "upstream_data_source"
    }
])

# 4. Update skill documentation
# (This update - adding all these sections to workers-everysk-skill.md)
```

## Quick Reference Commands

```bash
# Worker lifecycle
./run.py create <name>          # Create new worker
./run.py deploy wk_<name>       # Deploy worker
./run.py delete <worker_id>     # Delete worker

# Testing
./run.py tests                  # Run all tests
./run.py coverage               # Check coverage
./run.py debug wk_<name> <key>  # Debug with sample args

# Environment
./run.py venv                   # Create virtual environment

# Utilities
./run.py snippets               # Access form field snippets
```

## Resources

- **Python**: 3.11+
- **SDK**: everysk-lib>=1.6.1504
- **Testing**: everysk.core.unittests (extends unittest)
- **DataFrame**: pandas>=2.2.3

---

## Change Log

**2026-01-20 - Major Update (Email Parser v2 Implementation Learnings)**
- Added 🚨 CRITICAL: Docker Deployment Pattern section
- Added comprehensive File Retriever Integration and Upstream Data section
- Added Memory Storage and Knowledge Management section
- Enhanced Pre-Deployment Checklist with upstream data and testing items
- Added troubleshooting for --login flag deployment issue
- Added troubleshooting for upstream JSON string parsing
- Added standalone testing patterns
- Added backward compatibility patterns
- Cross-referenced all new sections throughout document

**2026-01-16 - Initial Creation**
- Created comprehensive worker builder skill
- Documented state attribute pattern
- Documented form field access pattern
- Added worker lifecycle and patterns

---

**Generated by**: Everysk Worker Builder Skill
**Last Updated**: 2026-01-20
**Codebase**: /home/chicagojoe/PyCharmProjects/everysk/workers-joe
**Key Implementations**:
- Email Parser v2 (wk_email_parser) - File Retriever integration, upstream data handling
- Worker deployment automation via Docker


### Testing Commands and Workflow

**Local Testing Workflow:**

```bash
# 1. Test with sample_args.json (manual testing)
cd /home/chicagojoe/PyCharmProjects/everysk/workers-joe
docker run --rm \
  -v "$(pwd)":/var/app -w /var/app \
  workers-joe:test python -m workers.wk_email_parser.main

# 2. Run pytest suite
docker run --rm \
  -v "$(pwd)":/var/app -w /var/app \
  workers-joe:test pytest workers/wk_email_parser/tests/ -v

# 3. Run with coverage
docker run --rm \
  -v "$(pwd)":/var/app -w /var/app \
  workers-joe:test pytest workers/wk_email_parser/tests/ --cov=workers.wk_email_parser

# 4. Debug field access issues
# Add to your worker code temporarily:
print(f"Available fields: {dir(self.script_inputs)}")
print(f"Field values: {self.script_inputs.dict()}")
```

**BaseDict Conversion Helper:**

When testing locally with sample_args.json, you may need to convert regular dicts to BaseDict:

```python
from workers.shared.base_dict import BaseDict

# In your test file
sample_args = json.load(open('sample_args.json'))
script_inputs = BaseDict(sample_args.get('script_inputs', {}))
```

**Important Testing Notes:**
- NEVER run Python directly without Docker (wrong interpreter, missing dependencies)
- Always test with Docker container that matches deployment environment
- Use sample_args.json structure that matches form_inputs.json
- Verify field access uses flattened pattern before deployment
