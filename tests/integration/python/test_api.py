"""
Integration tests for Python services using pytest-asyncio and httpx.
This file contains various test cases for different API endpoints with positive and negative scenarios.
"""

import json

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(service_urls, api_endpoints, http_client):
    """Test the health check endpoints for all services."""
    for service, url in service_urls.items():
        endpoint = api_endpoints["health"][service]
        response = await http_client.get(f"{url}{endpoint}")
        assert response.status_code == 200


@pytest.mark.asyncio
async def test_username_search_positive(
    api_endpoints, service_urls, http_client, test_data
):
    """Test username search with valid username."""
    username = test_data["valid_username"]
    endpoint = api_endpoints["osint"]["username"].format(username=username)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 200
    assert response.json()["username"] == username


@pytest.mark.asyncio
async def test_username_search_negative(
    api_endpoints, service_urls, http_client, test_data
):
    """Test username search with invalid username."""
    username = test_data["invalid_username"]
    endpoint = api_endpoints["osint"]["username"].format(username=username)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_email_lookup_positive(
    api_endpoints, service_urls, http_client, test_data
):
    """Test email lookup with valid email."""
    email = test_data["valid_email"]
    endpoint = api_endpoints["osint"]["email"].format(email=email)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 200
    assert "email" in response.json()


@pytest.mark.asyncio
async def test_email_lookup_negative(
    api_endpoints, service_urls, http_client, test_data
):
    """Test email lookup with invalid email."""
    email = test_data["invalid_email"]
    endpoint = api_endpoints["osint"]["email"].format(email=email)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_domain_information_positive(
    api_endpoints, service_urls, http_client, test_data
):
    """Test domain information with valid domain."""
    domain = test_data["valid_domain"]
    endpoint = api_endpoints["osint"]["domain"].format(domain=domain)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 200
    assert "domain" in response.json()


@pytest.mark.asyncio
async def test_domain_information_negative(
    api_endpoints, service_urls, http_client, test_data
):
    """Test domain information with invalid domain."""
    domain = test_data["invalid_domain"]
    endpoint = api_endpoints["osint"]["domain"].format(domain=domain)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_rate_limiting(api_endpoints, service_urls, http_client):
    """Test the rate limiting on OSINT endpoints."""
    endpoint = api_endpoints["osint"]["username"].format(username="rate_limit_test")
    url = f"{service_urls['osint-framework']}{endpoint}"

    for _ in range(70):  # Send more requests than the rate limit allows
        response = await http_client.get(url)

    assert response.status_code == 429


@pytest.mark.asyncio
async def test_security_sql_injection(
    api_endpoints, service_urls, http_client, test_data
):
    """Test for SQL injection vulnerability."""
    username = test_data["sql_injection"]
    endpoint = api_endpoints["osint"]["username"].format(username=username)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_security_xss(api_endpoints, service_urls, http_client, test_data):
    """Test for XSS vulnerability."""
    username = test_data["xss_payload"]
    endpoint = api_endpoints["osint"]["username"].format(username=username)
    response = await http_client.get(f"{service_urls['osint-framework']}{endpoint}")
    assert response.status_code == 400
