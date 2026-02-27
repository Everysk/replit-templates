# Everysk Library - Server Module Documentation

## Overview

The Server module handles HTML content delivery and RESTful API requests. It's built on Starlette, a lightweight ASGI framework for high-performance asyncio services.

## Installation

```
pip3 install everysk-beta[starlette]
```

## Quick Start Example

```python
from everysk.server.applications import create_application
from everysk.server.endpoints import JSONEndpoint
from everysk.server.routing import Route, RouteLazy

class TestPublicEndpoint(JSONEndpoint):
    rest_key_name: str = None
    rest_key_value: str = None

    async def get(self):
        return {'message': 'Hello, World!'}

class TestPrivateEndpoint(JSONEndpoint):
    rest_key_name: str = 'X-Api-Key'
    rest_key_value: str = '123456'

    async def get(self):
        return {'message': 'Hello, World Private!'}

routes = [
    RouteLazy(path='/', endpoint='everysk.server.example_api.TestPublicEndpoint'),
    Route(path='/private', endpoint=TestPrivateEndpoint)
]

app = create_application(routes=routes)
```

## Development Server

Use **uvicorn** for development (supports breakpoints in debug mode):

```
pip3 install uvicorn
uvicorn --host "0.0.0.0" --port "8000" --workers 1 --reload --access-log api:app
```

## Production Server

Use **Nginx Unit** for production deployments supporting HTTP/2 protocol.

## Application Creation

```python
app = create_application(
    routes: list[Routes],
    debug: bool = True | False,
    middlewares: list[Middlewares] = None,
    exception_handlers: dict[int | Exception, callable] = None
)
```

## Endpoint Types

### BaseEndpoint
Base class for custom endpoints returning non-JSON responses.

**Attributes:**
- Private: `_request_class`, `_response_class`
- Public: `receive`, `request`, `scope`, `send`

**Example:**
```python
from everysk.server.endpoints import BaseEndpoint
from everysk.server.responses import Response

class MyEndpoint(BaseEndpoint):
    async def get(self):
        return Response('<b>Hello, World!</b>')
```

### JSONEndpoint
For RESTful API endpoints returning JSON responses.

**Key Attributes:**
- `rest_key_name`: Header name for API key authentication
- `rest_key_value`: Expected header value

Set both to `None` for public endpoints.

**Example:**
```python
class TestPrivateEndpoint(JSONEndpoint):
    rest_key_name: str = 'X-Api-Key'
    rest_key_value: str = '123456'

    async def get(self):
        return {'message': 'Hello, World Private!'}
```

**Return Options:**
- Dictionary (auto-converted to JSON)
- `JSONResponse` object

```python
from everysk.server.responses import JSONResponse

async def get(self):
    return JSONResponse({'message': 'Hello, World Private!'})
```

### RedirectEndpoint
Proxies requests to another host.

**Attributes:**
- `host_url`: Target host (mandatory)
- `timeout`: Response timeout in seconds (default: 600)

**Example:**
```python
RouteLazy('/anbima_feed_funds/{call_id}', endpoint='everysk.server.endpoints.RedirectEndpoint')
```

### HealthCheckEndpoint
Returns health check status.

**Example:**
```python
RouteLazy('/health_check', endpoint='everysk.server.endpoints.HealthCheckEndpoint')
```

## Routing

Two routing approaches available:

### Route (Direct)
```python
from endpoint import TestPrivateEndpoint
from everysk.server.routing import Route

routes = [
    Route(path='/private', endpoint=TestPrivateEndpoint)
]
```

### RouteLazy (String-based)
Imports endpoint only when request arrives:

```python
from everysk.server.routing import Route

routes = [
    Route(path='/private', endpoint='endpoint.TestPrivateEndpoint')
]
```

## Middlewares

Intercept and modify requests/responses. Automatically included: `GZipMiddleware` and `SecurityHeadersMiddleware`.

**Custom Middleware:**
```python
from everysk.server.middlewares import BaseMiddleware
from everysk.server.requests import Request

class MyMiddleware(BaseMiddleware):
    async def dispatch(self, request: Request, call_next: callable):
        response = await call_next(request)
        # Modify response
        return response
```

## Key Features

- Gzip decompression of payloads (automatic)
- Request payload access via `self.get_http_payload()`
- Headers inserted in log context for GCP chained logging
- API key authentication support via custom headers
- Support for both HTML and REST API content

---

# Nginx/Unit Installation Guide

## Overview

This documentation covers installing and configuring Nginx and Unit as a web server setup.

**Nginx** is described as "a proxy that can also be used as load balancer, mail proxy, and HTTP cache."

**Unit** is characterized as "a dynamic web and application server, designed to run applications in multiple languages and dynamically configured via API."

## Installation via Docker

The setup uses Docker with Unit's official image based on Python. The Dockerfile modification begins with:

```dockerfile
FROM unit:1.34.2-python3.12-slim AS ......
```

Nginx must be added to the container:

```dockerfile
RUN apt-get update && apt-get install -y nginx && apt-get -y autoremove && apt-get -y autoclean && rm -rf /var/lib/apt/lists/*
```

## Unit Configuration

Configuration occurs through Unit's RESTful API using a JSON file at `/var/app/docker/unit.json`:

```json
{
    "listeners": {
        "127.0.0.1:<UNIT_PORT_NUMBER>": {
            "pass": "applications/starlette"
        }
    },
    "applications": {
        "starlette": {
            "type": "python 3.12",
            "path": "/var/app/",
            "protocol": "asgi",
            "module": "<FILE_NAME>",
            "callable": "<APP_OBJECT_NAME>",
            "processes": {
                "max": 20,
                "spare": 1,
                "idle_timeout": 60
            },
            "threads": 8
        }
    }
}
```

**Key parameters:**
- `path`: Application directory
- `module`: Python filename containing the application
- `callable`: Object name invoked by Unit (typically `app`)

## Starting Unit

Initialize the Unit daemon:

```bash
unitd --control unix:/var/run/control.unit.sock --user root --group root --pid /var/run/unit.pid --no-daemon &> /dev/stdout &
```

Apply configuration via curl:

```bash
curl -X PUT --retry-all-errors --retry 5 --data-binary @/var/app/docker/unit.json --unix-socket /var/run/control.unit.sock http://localhost/config/
```

## Nginx Configuration

The configuration file (`/var/app/docker/nginx.conf`) includes:

```nginx
user www-data;
pid /run/nginx.pid;
error_log /var/log/nginx/error.log;
include /etc/nginx/modules-enabled/*.conf;

daemon off;
worker_processes auto;

events {
    worker_connections 1024;
    use epoll;
}

http {
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;
    server_tokens off;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    access_log off;
    gzip off;

    upstream http_backend {
        server 127.0.0.1:<UNIT_PORT_NUMBER>;
        keepalive 1;
    }

    server {
        listen <APPLICATION_PORT> http2;

        location / {
            proxy_pass http://http_backend;
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

            proxy_connect_timeout 300s;
            proxy_send_timeout 300s;
            proxy_read_timeout 300s;
            send_timeout 300s;
        }
    }
}
```

## Starting Nginx

Validate and start the proxy:

```bash
nginx -t -c "/var/app/docker/nginx.conf" && nginx -c "/var/app/docker/nginx.conf"
```

## Complete run.sh Implementation

```bash
api-unit)
    PID_FILE="/var/run/unit.pid"
    UNIT_CONFIG="${PROJECT_ROOT}/docker/unit.json"
    NGINX_CONFIG="${PROJECT_ROOT}/docker/nginx.conf"
    NGINX_PORT="${PROJECT_ROOT}/docker/nginx_port.conf"

    function ctrl_c() {
        echo "Shutting down..."
        if [ -f /var/run/unit.pid ]; then
            kill "$(cat ${PID_FILE})"
        fi
    }

    trap ctrl_c INT

    unitd --control unix:/var/run/control.unit.sock --user root --group root --pid $PID_FILE --no-daemon &> /dev/stdout &

    curl -X PUT --retry-all-errors --retry 5 --data-binary @$UNIT_CONFIG --unix-socket /var/run/control.unit.sock http://localhost/config/

    if [ $? -ne 0 ]; then
        ctrl_c
        exit 1
    fi

    if ! nginx -t -c "${NGINX_CONFIG}" || ! nginx -c "${NGINX_CONFIG}"; then
        ctrl_c
        exit 1
    fi
;;
```
