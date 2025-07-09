"""
Simple health check tests for existing services
"""
import pytest
import httpx


@pytest.mark.asyncio
async def test_osint_health():
    """Test OSINT framework health endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:8000/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "osint-framework"


@pytest.mark.asyncio 
async def test_js_tools_health():
    """Test JS tools health endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get("http://localhost:3000/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "js-tools-bot-framework"
