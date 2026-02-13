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
import os
from dotenv import load_dotenv


###############################################################################
# Functions
###############################################################################
def get_header() -> dict:
    """
    Construct the authorization header for the Everysk API request.
    Matches the apps-everysk header format including Everysk-Managed-Deploy.

    Returns:
        dict: Headers including Authorization and Content-Type.
    """
    return {
        'Authorization': f"Bearer {os.getenv('EVERYSK_API_SID')}:{os.getenv('EVERYSK_API_TOKEN')}",
        'Content-Type': 'application/json',
        'Everysk-Managed-Deploy': os.getenv('EVERYSK_MANAGED_DEPLOY', 'None'),
    }


def get_base_url() -> str:
    """
    Build the API endpoint URL for user_apps.

    Returns:
        str: The full URL for the user_apps endpoint.
    """
    base = os.getenv('EVERYSK_API_URL', 'https://api.everysk.com/v2')
    return f'{base}/user_apps'


def load_env():
    """Load environment variables from .env file."""
    load_dotenv()
