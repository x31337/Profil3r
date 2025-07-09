"""
Integration test configuration for Python services
"""

import asyncio
import logging
import os
import time
from typing import Any, AsyncGenerator, Dict

import httpx
import pytest
import pytest_asyncio

import docker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Test configuration
TEST_CONFIG = {
    "services": {
        "profil3r-core": {
            "name": "profil3r-core",
            "health_endpoint": "/health",
            "port": 5000,
            "base_url": "http://localhost:5000",
        },
        "js-tools": {
            "name": "profil3r-js-tools",
            "health_endpoint": "/api/health",
            "port": 3000,
            "base_url": "http://localhost:3000",
        },
        "osint-framework": {
            "name": "profil3r-osint-framework",
            "health_endpoint": "/api/health",
            "port": 8000,
            "base_url": "http://localhost:8000",
        },
        "facebook-messenger": {
            "name": "profil3r-facebook-messenger",
            "health_endpoint": "/api/health",
            "port": 4444,
            "base_url": "http://localhost:4444",
        },
    },
    "timeouts": {"service_startup": 60, "health_check": 30, "request": 10},
}


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def docker_client():
    """Docker client for managing containers."""
    return docker.from_env()


@pytest_asyncio.fixture(scope="session")
async def docker_compose_services(docker_client):
    """
    Start docker-compose services and wait for them to be healthy.
    """
    import subprocess

    # Start docker-compose services
    logger.info("Starting docker-compose services...")
    result = subprocess.run(
        ["docker-compose", "up", "-d"],
        capture_output=True,
        text=True,
        cwd=os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    )

    if result.returncode != 0:
        pytest.fail(f"Failed to start docker-compose services: {result.stderr}")

    # Wait for services to be healthy
    await wait_for_services_healthy()

    yield

    # Cleanup: stop services
    logger.info("Stopping docker-compose services...")
    subprocess.run(["docker-compose", "down"], capture_output=True)


async def wait_for_services_healthy():
    """Wait for all services to be healthy."""
    timeout = TEST_CONFIG["timeouts"]["service_startup"]
    start_time = time.time()

    while time.time() - start_time < timeout:
        all_healthy = True

        for service_name, service_config in TEST_CONFIG["services"].items():
            if not await check_service_health(service_config):
                all_healthy = False
                logger.info(f"Service {service_name} not ready yet...")
                break

        if all_healthy:
            logger.info("All services are healthy!")
            return

        await asyncio.sleep(2)

    raise TimeoutError("Services did not become healthy within timeout period")


async def check_service_health(service_config: Dict[str, Any]) -> bool:
    """Check if a service is healthy."""
    try:
        async with httpx.AsyncClient() as client:
            url = f"{service_config['base_url']}{service_config['health_endpoint']}"
            response = await client.get(url, timeout=5)
            return response.status_code == 200
    except Exception as e:
        logger.debug(f"Health check failed: {e}")
        return False


@pytest_asyncio.fixture
async def http_client() -> AsyncGenerator[httpx.AsyncClient, None]:
    """HTTP client for making requests to services."""
    async with httpx.AsyncClient(timeout=TEST_CONFIG["timeouts"]["request"]) as client:
        yield client


@pytest.fixture
def service_urls():
    """Service URLs for testing."""
    return {
        name: config["base_url"] for name, config in TEST_CONFIG["services"].items()
    }


@pytest.fixture
def test_data():
    """Test data for various scenarios."""
    return {
        "valid_username": "testuser123",
        "valid_email": "test@example.com",
        "valid_domain": "example.com",
        "invalid_username": "",
        "invalid_email": "invalid-email",
        "invalid_domain": "invalid..domain",
        "nonexistent_resource": "nonexistent123456789",
        "large_input": "a" * 1000,
        "special_chars": "!@#$%^&*()_+-=[]{}|;:,.<>?",
        "sql_injection": "'; DROP TABLE users; --",
        "xss_payload": "<script>alert('xss')</script>",
        "unicode_input": "тест用户名🚀",
        "message_data": {
            "recipient": "test@example.com",
            "message": "Test message",
            "delay": 0,
        },
    }


@pytest.fixture
def auth_headers():
    """Authentication headers for protected endpoints."""
    return {
        "Authorization": f"Bearer {os.getenv('TEST_API_TOKEN', 'test-token')}",
        "Content-Type": "application/json",
    }


@pytest.fixture
def api_endpoints():
    """API endpoints for testing."""
    return {
        "health": {
            "profil3r-core": "/health",
            "js-tools": "/api/health",
            "osint-framework": "/api/health",
            "facebook-messenger": "/api/health",
        },
        "osint": {
            "username": "/api/osint/username/{username}",
            "email": "/api/osint/email/{email}",
            "domain": "/api/network/domain/{domain}",
        },
        "messenger": {
            "login": "/api/messenger/login",
            "send": "/api/messenger/send",
            "status": "/api/messenger/status",
            "history": "/api/messenger/history",
        },
        "facebook": {
            "friends": "/api/facebook/friends",
            "messages": "/api/facebook/messages",
            "groups": "/api/facebook/groups",
        },
    }


@pytest.fixture
def rate_limit_config():
    """Rate limiting configuration for testing."""
    return {
        "osint_endpoints": {"requests": 60, "window": 60},
        "facebook_operations": {"requests": 10, "window": 60},
        "health_checks": {"requests": None, "window": None},
    }


# Performance test fixtures
@pytest.fixture
def performance_thresholds():
    """Performance thresholds for different endpoints."""
    return {
        "health_check": 0.5,  # 500ms
        "osint_lookup": 5.0,  # 5 seconds
        "message_send": 10.0,  # 10 seconds
        "bulk_operations": 30.0,  # 30 seconds
    }


# Error scenarios
@pytest.fixture
def error_scenarios():
    """Common error scenarios for testing."""
    return {
        "network_timeout": {"timeout": 0.001},
        "service_unavailable": {"status_code": 503},
        "rate_limited": {"status_code": 429},
        "unauthorized": {"status_code": 401},
        "forbidden": {"status_code": 403},
        "not_found": {"status_code": 404},
        "method_not_allowed": {"status_code": 405},
        "payload_too_large": {"status_code": 413},
        "internal_server_error": {"status_code": 500},
    }


# Utility functions
def generate_load_test_data(count: int = 100):
    """Generate test data for load testing."""
    import random
    import string

    data = []
    for i in range(count):
        data.append(
            {
                "username": f"testuser{i}",
                "email": f"test{i}@example.com",
                "domain": f"example{i}.com",
                "message": f"Test message {i} {''.join(random.choices(string.ascii_letters, k=20))}",
            }
        )
    return data


async def measure_response_time(
    client: httpx.AsyncClient, method: str, url: str, **kwargs
):
    """Measure response time for a request."""
    start_time = time.time()
    response = await client.request(method, url, **kwargs)
    end_time = time.time()
    return response, end_time - start_time
