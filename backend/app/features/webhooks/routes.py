"""Webhook routes - GitHub webhook endpoint."""
from fastapi import APIRouter, Request, HTTPException, Header
import structlog

from .models import WebhookResponse
from .service import (
    verify_github_signature,
    process_push_event,
    process_pull_request_event,
    process_issues_event,
    process_ping_event,
)

logger = structlog.get_logger()

router = APIRouter(tags=["webhooks"])


@router.post("/webhook", response_model=WebhookResponse)
async def github_webhook(
    request: Request,
    x_github_event: str | None = Header(None, alias="X-GitHub-Event"),
    x_hub_signature_256: str | None = Header(None, alias="X-Hub-Signature-256"),
    x_github_delivery: str | None = Header(None, alias="X-GitHub-Delivery"),
):
    """Handle GitHub webhook events.

    Verifies signature and processes:
    - ping: Webhook test
    - push: Code pushed to repository
    - pull_request: PR opened/closed/merged
    - issues: Issue opened/closed/commented
    """
    # Get raw body for signature verification
    body = await request.body()

    # Verify signature
    if not verify_github_signature(body, x_hub_signature_256):
        logger.error(
            "webhook_signature_invalid",
            github_event=x_github_event,
            delivery_id=x_github_delivery,
        )
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Parse JSON payload
    try:
        payload = await request.json()
    except Exception as e:
        logger.error("webhook_payload_parse_error", error=str(e))
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    logger.info(
        "webhook_received",
        github_event=x_github_event,
        delivery_id=x_github_delivery,
        repository=payload.get("repository", {}).get("full_name"),
    )

    # Route to appropriate handler
    event_handlers = {
        "ping": process_ping_event,
        "push": process_push_event,
        "pull_request": process_pull_request_event,
        "issues": process_issues_event,
    }

    handler = event_handlers.get(x_github_event)

    if handler:
        message = await handler(payload)
        return WebhookResponse(
            status="ok",
            event=x_github_event,
            message=message,
        )

    # Unknown event type - acknowledge but don't process
    logger.info("webhook_event_ignored", github_event=x_github_event)
    return WebhookResponse(
        status="ok",
        event=x_github_event or "unknown",
        message=f"Event '{x_github_event}' acknowledged but not processed",
    )
