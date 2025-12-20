"""Webhook route tests - TDD first."""
import hashlib
import hmac
import json
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def create_signature(payload: bytes, secret: str) -> str:
    """Create GitHub-style HMAC signature."""
    return "sha256=" + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()


class TestWebhookEndpoint:
    """Test /webhook endpoint."""

    def test_ping_event_returns_200(self):
        """Ping event should return 200 with pong message."""
        payload = {
            "zen": "Keep it logically awesome.",
            "hook_id": 123456,
            "repository": {"full_name": "jnalv414/my-second-brain"},
        }

        response = client.post(
            "/webhook",
            json=payload,
            headers={"X-GitHub-Event": "ping"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["event"] == "ping"
        assert "Pong" in data["message"]

    def test_push_event_returns_200(self):
        """Push event should return 200."""
        payload = {
            "ref": "refs/heads/main",
            "commits": [{"id": "abc123", "message": "Test commit"}],
            "repository": {"full_name": "jnalv414/my-second-brain"},
        }

        response = client.post(
            "/webhook",
            json=payload,
            headers={"X-GitHub-Event": "push"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["event"] == "push"

    def test_unknown_event_acknowledged(self):
        """Unknown events should be acknowledged but not processed."""
        payload = {"repository": {"full_name": "test/repo"}}

        response = client.post(
            "/webhook",
            json=payload,
            headers={"X-GitHub-Event": "unknown_event"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "acknowledged" in data["message"].lower()

    def test_invalid_json_returns_400(self):
        """Invalid JSON should return 400."""
        response = client.post(
            "/webhook",
            content=b"not valid json",
            headers={
                "X-GitHub-Event": "push",
                "Content-Type": "application/json",
            },
        )

        assert response.status_code == 400
