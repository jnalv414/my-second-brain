"""Webhook route tests - TDD first."""

import hashlib
import hmac
import json

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

# Test secret for signature generation
TEST_SECRET = "test-secret"


def create_signature(payload: bytes, secret: str = TEST_SECRET) -> str:
    """Create GitHub-style HMAC signature."""
    return "sha256=" + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()


def post_webhook(payload: dict, event: str, secret: str = TEST_SECRET):
    """Helper to post webhook with proper signature."""
    body = json.dumps(payload).encode()
    signature = create_signature(body, secret)
    return client.post(
        "/webhook",
        content=body,
        headers={
            "X-GitHub-Event": event,
            "X-Hub-Signature-256": signature,
            "Content-Type": "application/json",
        },
    )


class TestWebhookEndpoint:
    """Test /webhook endpoint."""

    def test_ping_event_returns_200(self):
        """Ping event should return 200 with pong message."""
        payload = {
            "zen": "Keep it logically awesome.",
            "hook_id": 123456,
            "repository": {"full_name": "jnalv414/my-second-brain"},
        }

        response = post_webhook(payload, "ping")

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

        response = post_webhook(payload, "push")

        assert response.status_code == 200
        data = response.json()
        assert data["event"] == "push"

    def test_unknown_event_acknowledged(self):
        """Unknown events should be acknowledged but not processed."""
        payload = {"repository": {"full_name": "test/repo"}}

        response = post_webhook(payload, "unknown_event")

        assert response.status_code == 200
        data = response.json()
        assert "acknowledged" in data["message"].lower()

    def test_invalid_signature_returns_401(self, monkeypatch):
        """Invalid signature should return 401 when secret is configured."""
        # Set a secret so signature verification is actually performed
        monkeypatch.setenv("GITHUB_WEBHOOK_SECRET", "real-secret")

        # Reload the module to pick up the env var
        import app.features.webhooks.service as svc

        monkeypatch.setattr(svc, "WEBHOOK_SECRET", "real-secret")

        payload = {"repository": {"full_name": "test/repo"}}
        body = json.dumps(payload).encode()
        # Use wrong signature
        response = client.post(
            "/webhook",
            content=body,
            headers={
                "X-GitHub-Event": "push",
                "X-Hub-Signature-256": "sha256=invalid",
                "Content-Type": "application/json",
            },
        )

        assert response.status_code == 401

    def test_missing_signature_returns_401(self):
        """Missing signature should return 401."""
        payload = {"repository": {"full_name": "test/repo"}}
        response = client.post(
            "/webhook",
            json=payload,
            headers={"X-GitHub-Event": "push"},
        )

        assert response.status_code == 401
