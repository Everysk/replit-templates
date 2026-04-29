###############################################################################
#
# (C) Copyright 2026 EVERYSK TECHNOLOGIES
#
# This is an unpublished work containing confidential and proprietary
# information of EVERYSK TECHNOLOGIES. Disclosure, use, or reproduction
# without authorization of EVERYSK TECHNOLOGIES is prohibited.
#
###############################################################################

###############################################################################
# Imports
###############################################################################
import sys
import os
import json
import re
import requests
import subprocess

from everysk.core.compress import zip_directory_to_str
from scripts.helpers import load_env, get_header, get_base_url

PROJECT_ROOT = os.getenv('PROJECT_ROOT', os.getcwd())


###############################################################################
# Functions
###############################################################################
def remove_comments(json_str: str) -> str:
    """Remove single-line and block comments from a JSON string."""
    json_str = re.sub(r'//.*?\n', '\n', json_str)
    json_str = re.sub(r'/\*.*?\*/', '', json_str, flags=re.DOTALL)
    return json_str


def read_file(file_path: str, is_remove_comments: bool = False, is_json: bool = True):
    """Read a file, optionally stripping comments and parsing as JSON."""
    with open(file_path, 'r') as f:
        data = remove_comments(f.read()) if is_remove_comments else f.read()
    return json.loads(data) if is_json else data


def build_template(config_path: str, dist_path: str) -> dict:
    """
    Build the deployment payload from config.json and the dist directory.

    Args:
        config_path: Path to config.json.
        dist_path: Path to the built dist/ directory.

    Returns:
        dict: The deployment payload with config fields + zipped data.
    """
    template = read_file(config_path, is_remove_comments=True)
    template['data'] = zip_directory_to_str(dist_path, path_name_list='')
    return template


def update_config(config_path: str, response: dict, keys: list) -> None:
    """
    Update config.json with fields returned by the API.

    Args:
        config_path: Path to config.json.
        response: The user_app dict from the API response.
        keys: List of keys to update.
    """
    with open(config_path, 'r+') as f:
        json_str = remove_comments(f.read())
        config = json.loads(json_str)
        for key in keys:
            if key in response:
                config[key] = response[key]
        f.seek(0)
        json.dump(config, f, indent=2)
        f.truncate()


def http_request(payload: dict, method: str, url: str) -> tuple:
    """
    Send the deployment request to the Everysk API.

    Returns:
        tuple: (status_code, message, user_app_dict)
    """
    headers = get_header()
    answer = requests.request(method, url, headers=headers, json=payload)
    status_code = answer.status_code

    if status_code == 200:
        body = answer.json()
        # Handle both /user_apps and /managed_user_apps response formats
        user_app = body.get('user_app') or body.get('user_apps', {}).get('user_app', {})
        message = 'Successful request operation.'
    else:
        message = f'Error on http_request: {answer.text}'
        user_app = {}

    return (status_code, message, user_app)


def increment_version(version: str) -> str:
    """Increment a version string like 'v1' -> 'v2', 'v10' -> 'v11'."""
    match = re.match(r'^v(\d+)$', version)
    if not match:
        return 'v1'
    return f'v{int(match.group(1)) + 1}'


###############################################################################
# Main
###############################################################################
def main():
    """Build the app and deploy to Everysk."""
    config_path = os.path.join(PROJECT_ROOT, 'config.json')
    dist_path = os.path.join(PROJECT_ROOT, 'dist')

    if not os.path.isfile(config_path):
        print(f'ERROR: config.json not found at {config_path}')
        sys.exit(1)

    # Lint gate — must pass before build
    print('Running lint...')
    result = subprocess.run(['npm', 'run', 'lint'], cwd=PROJECT_ROOT)
    if result.returncode != 0:
        print('ERROR: Lint failed. Fix lint errors before deploying.')
        sys.exit(1)

    # Test gate — must pass before build
    print('Running tests...')
    result = subprocess.run(['npm', 'test'], cwd=PROJECT_ROOT)
    if result.returncode != 0:
        print('ERROR: Tests failed. Fix failing tests before deploying.')
        sys.exit(1)

    # Build
    print('Building project...')
    subprocess.run(['npm', 'install'], cwd=PROJECT_ROOT, check=True)
    subprocess.run(['npm', 'run', 'build'], cwd=PROJECT_ROOT, check=True)

    if not os.path.isdir(dist_path):
        print(f'ERROR: dist directory not found at {dist_path}')
        sys.exit(1)

    # Package
    print('Packaging dist directory...')
    template = build_template(config_path, dist_path)

    # Include app env settings (skip empty values)
    app_config_path = os.path.join(PROJECT_ROOT, 'dev', 'app-config.dev.json')
    if os.path.isfile(app_config_path):
        env_config = read_file(app_config_path)
        env_config = {k: v for k, v in env_config.items() if v}
        if env_config:
            template['env_vars'] = env_config
            print(f'App env: {json.dumps(template["env_vars"])}')
        else:
            print('App env: skipped (all values empty)')
    else:
        print(f'WARNING: app-config.dev.json not found at {app_config_path} — env not set')

    print(f'Config: {json.dumps({k: v for k, v in template.items() if k != "data"}, indent=2)}')

    # Determine if this is an update or a new deploy
    existing_id = template.get('id', '')
    is_update = bool(existing_id)

    if is_update:
        print(f'Reusing existing app ID: {existing_id}')
    else:
        template.pop('id', None)
        print('No existing app ID found — will create a new app.')

    current_version = template.get('version', 'v1')
    if is_update:
        new_version = increment_version(current_version)
        template['version'] = new_version
        print(f'Version incremented: {current_version} -> {new_version}')
    else:
        template['version'] = current_version
        print(f'First deploy — using version {current_version}')

    # Deploy
    base_url = get_base_url()
    if is_update:
        deploy_url = f'{base_url}/{existing_id}'
    else:
        deploy_url = base_url
    http_method = 'PUT' if is_update else 'POST'
    print(f'Deploying to {deploy_url} ...')
    status_code, message, user_app = http_request(template, http_method, deploy_url)
    print(f'HTTP {status_code}: {message}')

    if status_code != 200:
        sys.exit(1)

    # Show response (without data blob)
    response_summary = {k: v for k, v in user_app.items() if k != 'data'}
    print(f'Response: {json.dumps(response_summary, indent=2)}')

    app_id = user_app.get('id', 'unknown')
    print(f'App ID: {app_id}')

    # Update config.json with response fields
    keys = ['id', 'version', 'target_users', 'created', 'updated']
    update_config(config_path, user_app, keys)
    print('config.json updated successfully.')
    print(f'  id: {user_app.get("id")}')
    print(f'  version: {user_app.get("version")}')
    print(f'  target_users: {user_app.get("target_users", {})}')
    print(f'  created: {user_app.get("created")}')
    print(f'  updated: {user_app.get("updated")}')


if __name__ == '__main__':
    load_env()
    main()
