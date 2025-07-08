# This file makes the 'modules' directory a Python package.

# Make key classes available when importing from the 'modules' package.
# e.g., from modules import FacebookAutomation

from .facebook_automation import FacebookAutomation, FacebookInteractionHelper
from .osint_utils import OsintUtilities
from .network_utils import NetworkUtilities

__all__ = [
    "FacebookAutomation",
    "FacebookInteractionHelper",
    "OsintUtilities",
    "NetworkUtilities"
]

__version__ = "3.0.0" # Updated version reflecting major refactor
__author__ = "Jules @ TaskWeaver"
