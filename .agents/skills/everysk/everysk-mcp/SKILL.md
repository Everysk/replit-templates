---
name: everysk-mcp
description: Guide to Everysk MCP (Model Context Protocol) server implementations and integration patterns
---

# Everysk MCP Server Skill

## When to Use This Skill

Use this skill when you need to:
- Understand Everysk MCP server architecture and implementations
- Build or extend MCP servers for Everysk platform
- Integrate Claude Code with Everysk backend services
- Create custom tools and resources for MCP clients
- Work with Everysk MCP authentication and authorization
- Deploy MCP servers to production

## What is Everysk MCP?

**Everysk MCP** is a Model Context Protocol server implementation that provides:
- **Tools**: Functions that Claude can call to interact with Everysk services
- **Resources**: Read-only data sources (datastores, portfolios, reports, etc.)
- **Prompts**: Pre-configured prompt templates for common Everysk workflows
- **Authentication**: Secure access to Everysk platform services

## Architecture

```
everysk-mcp/
├── src/                    # Source code
│   ├── tools/              # MCP tools (functions)
│   ├── resources/          # MCP resources (data sources)
│   ├── prompts/            # MCP prompts (templates)
│   └── server.py           # Main MCP server
├── auth/                   # Authentication configs
├── docker/                 # Docker configuration
├── tests/                  # Test suite
└── pyproject.toml         # Project config
```

---

## Core Concepts

### 1. MCP Tools (Functions)

**What they are:** Functions that Claude can call to perform actions

**Examples:**
- `get_datastore` - Retrieve datastore by ID
- `create_portfolio` - Create a new portfolio
- `run_workflow` - Execute a workflow
- `query_data` - Query data with filters

**Tool Structure:**
```python
@mcp_tool
async def get_datastore(datastore_id: str) -> dict:
    """
    Get datastore by ID.

    Args:
        datastore_id: The ID of the datastore

    Returns:
        Datastore information as dictionary
    """
    datastore = await fetch_datastore(datastore_id)
    return datastore.to_dict()
```

---

### 2. MCP Resources (Data Sources)

**What they are:** Read-only data that Claude can access

**Examples:**
- `datastore://abc-123` - Specific datastore
- `portfolio://xyz-789` - Specific portfolio
- `workflow://template-001` - Workflow template

**Resource Structure:**
```python
@mcp_resource("datastore://{datastore_id}")
async def datastore_resource(datastore_id: str) -> str:
    """
    Access datastore as a resource.

    Returns:
        Datastore content as markdown
    """
    datastore = await fetch_datastore(datastore_id)
    return format_as_markdown(datastore)
```

---

### 3. MCP Prompts (Templates)

**What they are:** Pre-configured prompt templates

**Examples:**
- `datastore-analysis` - Analyze datastore structure and content
- `workflow-builder` - Build a new workflow
- `portfolio-summary` - Summarize portfolio contents

**Prompt Structure:**
```python
@mcp_prompt("datastore-analysis")
def datastore_analysis_prompt(datastore_id: str) -> str:
    """
    Prompt for analyzing a datastore.

    Args:
        datastore_id: The ID of the datastore to analyze

    Returns:
        Formatted prompt with instructions
    """
    return f"""
    Analyze the datastore with ID: {datastore_id}

    Please provide:
    1. Schema overview
    2. Data quality assessment
    3. Key insights
    4. Recommendations
    """
```

---

## Setup & Installation

### Prerequisites

```bash
# Python 3.12+
python --version

# Required dependencies
pip install everysk-lib mcp anthropic-sdk
```

### Installation

```bash
# Clone repository
git clone https://github.com/Everysk/everysk-mcp
cd everysk-mcp

# Install with uv
uv sync

# Or with pip
pip install -e .
```

### Configuration

```bash
# Set up environment variables
export EVERYSK_API_KEY="your-api-key"
export EVERYSK_BASE_URL="https://api.everysk.com"

# Or create .env file
cat > .env <<EOF
EVERYSK_API_KEY=your-api-key
EVERYSK_BASE_URL=https://api.everysk.com
EOF
```

---

## Running the MCP Server

### Development Mode

```bash
# Run with uv
uv run everysk-mcp

# Or with Python
python -m everysk_mcp.server
```

### Production Mode (Docker)

```bash
# Build Docker image
docker build -t everysk-mcp -f docker/Dockerfile .

# Run container
docker run -d \
  -p 8000:8000 \
  -e EVERYSK_API_KEY=your-key \
  -e EVERYSK_BASE_URL=https://api.everysk.com \
  everysk-mcp
```

### Integration with Claude Code

```json
{
  "mcpServers": {
    "everysk": {
      "command": "uv",
      "args": ["run", "everysk-mcp"],
      "env": {
        "EVERYSK_API_KEY": "your-key"
      }
    }
  }
}
```

---

## Building Custom MCP Tools

### Example 1: Simple Tool

```python
from mcp import tool
from everysk.sdk.entities import Datastore

@tool
async def get_datastore_summary(datastore_id: str) -> dict:
    """
    Get summary of a datastore.

    Args:
        datastore_id: The ID of the datastore

    Returns:
        Summary statistics
    """
    datastore = Datastore.script.get(datastore_id)
    df = datastore.to_dataframe()

    return {
        'id': datastore_id,
        'rows': len(df),
        'columns': list(df.columns),
        'memory_usage': df.memory_usage(deep=True).sum()
    }
```

---

### Example 2: Tool with Complex Parameters

```python
from mcp import tool
from typing import List, Optional
from everysk.sdk.entities import Portfolio

@tool
async def create_portfolio(
    name: str,
    description: Optional[str] = None,
    tags: Optional[List[str]] = None,
    workspace: str = "main"
) -> dict:
    """
    Create a new portfolio.

    Args:
        name: Portfolio name
        description: Optional description
        tags: Optional list of tags
        workspace: Workspace identifier

    Returns:
        Created portfolio information
    """
    portfolio = Portfolio.script.create(
        name=name,
        description=description or "",
        tags=tags or [],
        workspace=workspace
    )

    return {
        'id': portfolio.id,
        'name': portfolio.name,
        'created_at': portfolio.created_at.isoformat()
    }
```

---

### Example 3: Tool with Error Handling

```python
from mcp import tool
from everysk.core.exceptions import EveryskError

@tool
async def safe_datastore_query(
    datastore_id: str,
    query: str
) -> dict:
    """
    Safely query a datastore with error handling.

    Args:
        datastore_id: The ID of the datastore
        query: SQL-like query string

    Returns:
        Query results or error information
    """
    try:
        datastore = Datastore.script.get(datastore_id)
        df = datastore.to_dataframe()

        # Execute query (simplified)
        result_df = df.query(query)

        return {
            'success': True,
            'rows': len(result_df),
            'data': result_df.to_dict('records')
        }

    except EveryskError as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': 'EveryskError'
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__
        }
```

---

## Building Custom MCP Resources

### Example 1: Datastore Resource

```python
from mcp import resource

@resource("datastore://{datastore_id}")
async def datastore_resource(datastore_id: str) -> str:
    """
    Access datastore contents as a resource.

    Args:
        datastore_id: The ID of the datastore

    Returns:
        Formatted markdown representation
    """
    datastore = Datastore.script.get(datastore_id)
    df = datastore.to_dataframe()

    markdown = f"# Datastore: {datastore_id}\n\n"
    markdown += f"**Rows:** {len(df)}\n"
    markdown += f"**Columns:** {', '.join(df.columns)}\n\n"
    markdown += "## Schema\n\n"

    for col in df.columns:
        dtype = df[col].dtype
        markdown += f"- `{col}`: {dtype}\n"

    markdown += "\n## Sample Data\n\n"
    markdown += df.head(5).to_markdown()

    return markdown
```

---

### Example 2: Portfolio Resource

```python
@resource("portfolio://{portfolio_id}")
async def portfolio_resource(portfolio_id: str) -> str:
    """
    Access portfolio contents as a resource.

    Args:
        portfolio_id: The ID of the portfolio

    Returns:
        Formatted markdown representation
    """
    portfolio = Portfolio.script.get(portfolio_id)

    markdown = f"# Portfolio: {portfolio.name}\n\n"
    markdown += f"**ID:** {portfolio.id}\n"
    markdown += f"**Description:** {portfolio.description}\n"
    markdown += f"**Created:** {portfolio.created_at}\n\n"

    if portfolio.tags:
        markdown += f"**Tags:** {', '.join(portfolio.tags)}\n\n"

    markdown += "## Contents\n\n"
    # List portfolio items
    for item in portfolio.items:
        markdown += f"- {item.name} ({item.type})\n"

    return markdown
```

---

## Authentication & Authorization

### Setting Up Authentication

```python
from everysk.auth import EveryskAuth

# Initialize authentication
auth = EveryskAuth(
    api_key=os.getenv('EVERYSK_API_KEY'),
    base_url=os.getenv('EVERYSK_BASE_URL')
)

# Use in MCP server
@tool
async def authenticated_operation(datastore_id: str) -> dict:
    """Operation requiring authentication"""
    # Auth is automatically applied
    datastore = Datastore.script.get(datastore_id)
    return {'status': 'success'}
```

### API Key Management

```bash
# Store API key securely
export EVERYSK_API_KEY=$(cat /secure/path/api-key.txt)

# Or use secrets management
# - AWS Secrets Manager
# - HashiCorp Vault
# - Kubernetes Secrets
```

---

## Testing

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=everysk_mcp

# Run specific test file
uv run pytest tests/test_tools.py
```

### Writing Tests for MCP Tools

```python
import pytest
from everysk_mcp.tools import get_datastore_summary

@pytest.mark.asyncio
async def test_get_datastore_summary():
    """Test datastore summary tool"""
    # Mock datastore
    datastore_id = "test-datastore-123"

    # Call tool
    result = await get_datastore_summary(datastore_id)

    # Assert results
    assert result['id'] == datastore_id
    assert 'rows' in result
    assert 'columns' in result
    assert isinstance(result['columns'], list)
```

---

## Deployment

### Docker Deployment

```dockerfile
# docker/Dockerfile
FROM python:3.12-slim

# Install dependencies
RUN pip install uv
WORKDIR /app
COPY . .
RUN uv sync

# Run server
CMD ["uv", "run", "everysk-mcp"]
```

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: everysk-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: everysk-mcp
  template:
    metadata:
      labels:
        app: everysk-mcp
    spec:
      containers:
      - name: everysk-mcp
        image: everysk-mcp:latest
        ports:
        - containerPort: 8000
        env:
        - name: EVERYSK_API_KEY
          valueFrom:
            secretKeyRef:
              name: everysk-secrets
              key: api-key
```

---

## Common Patterns

### Pattern 1: Async Tool with Database Query

```python
@tool
async def query_database(sql: str, params: dict = None) -> list:
    """Execute database query"""
    async with get_db_connection() as conn:
        cursor = await conn.execute(sql, params or {})
        results = await cursor.fetchall()
        return [dict(row) for row in results]
```

### Pattern 2: Tool with Rate Limiting

```python
from functools import wraps
from asyncio import sleep

def rate_limit(calls_per_minute: int):
    """Rate limiting decorator"""
    delay = 60 / calls_per_minute

    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await func(*args, **kwargs)
            await sleep(delay)
            return result
        return wrapper
    return decorator

@tool
@rate_limit(calls_per_minute=10)
async def rate_limited_operation() -> dict:
    """Operation with rate limiting"""
    return {'status': 'success'}
```

### Pattern 3: Tool with Caching

```python
from functools import lru_cache

@tool
async def get_cached_config(config_key: str) -> dict:
    """Get configuration with caching"""
    return _fetch_config(config_key)

@lru_cache(maxsize=100)
def _fetch_config(config_key: str) -> dict:
    """Cached config fetch"""
    # Expensive operation
    return load_config_from_database(config_key)
```

---

## Troubleshooting

### Issue: MCP Server Not Connecting

**Problem:** Claude Code can't connect to MCP server

**Solution:**
```bash
# Check server is running
ps aux | grep everysk-mcp

# Check logs
tail -f ~/.claude/logs/mcp-everysk.log

# Restart server
pkill -f everysk-mcp
uv run everysk-mcp
```

---

### Issue: Authentication Failures

**Problem:** API key not working

**Solution:**
```bash
# Verify API key is set
echo $EVERYSK_API_KEY

# Test API key
curl -H "Authorization: Bearer $EVERYSK_API_KEY" \
  https://api.everysk.com/health
```

---

### Issue: Tool Execution Timeouts

**Problem:** Tools timing out

**Solution:**
```python
# Increase timeout in tool
@tool(timeout=60)  # 60 seconds
async def long_running_operation() -> dict:
    """Operation with extended timeout"""
    await lengthy_process()
    return {'status': 'success'}
```

---

## Best Practices

1. **Always use async functions** for tools and resources
2. **Handle errors gracefully** with try/except blocks
3. **Validate inputs** before processing
4. **Use type hints** for all parameters and returns
5. **Document tools thoroughly** with docstrings
6. **Implement rate limiting** for expensive operations
7. **Cache results** when appropriate
8. **Log operations** for debugging and monitoring
9. **Test thoroughly** with pytest
10. **Secure API keys** with secrets management

---

## Quick Reference

| Component | Purpose | Example |
|-----------|---------|---------|
| **Tool** | Callable function | `@tool async def get_data()` |
| **Resource** | Read-only data | `@resource("datastore://{id}")` |
| **Prompt** | Template | `@prompt("analysis")` |
| **Auth** | Authentication | `EveryskAuth(api_key=...)` |

---

## Related Skills

- `workers-everysk` - Building Everysk workers
- `everysk-lib-sdk` - Everysk Library SDK/API
- `everysk-backend` - Backend development with Serena

---

**Remember:**
1. **All tools must be async** - Use `async def`
2. **Handle errors gracefully** - Use try/except
3. **Document thoroughly** - Add docstrings
4. **Test everything** - Write pytest tests
5. **Secure credentials** - Never hardcode API keys
