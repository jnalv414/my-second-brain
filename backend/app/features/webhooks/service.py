"""Webhook service - signature verification and event processing."""
import hashlib
import hmac
import os

import structlog

logger = structlog.get_logger()

WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")


def verify_github_signature(payload: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature using HMAC SHA-256.

    Args:
        payload: Raw request body bytes
        signature: X-Hub-Signature-256 header value

    Returns:
        True if signature is valid, False otherwise
    """
    if not signature:
        logger.warning("webhook_signature_missing")
        return False

    if not WEBHOOK_SECRET:
        logger.warning("webhook_secret_not_configured")
        # Allow in development if no secret configured
        return True

    if not signature.startswith("sha256="):
        logger.warning("webhook_signature_invalid_format", signature=signature[:20])
        return False

    expected_signature = "sha256=" + hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    is_valid = hmac.compare_digest(signature, expected_signature)

    if not is_valid:
        logger.warning("webhook_signature_mismatch")

    return is_valid


async def process_push_event(payload: dict) -> str:
    """Process GitHub push event."""
    repo = payload.get("repository", {}).get("full_name", "unknown")
    ref = payload.get("ref", "unknown")
    commits = payload.get("commits", [])

    logger.info(
        "webhook_push_event",
        repository=repo,
        ref=ref,
        commit_count=len(commits),
    )

    return f"Processed push to {repo} ({len(commits)} commits)"


async def process_pull_request_event(payload: dict) -> str:
    """Process GitHub pull request event."""
    action = payload.get("action", "unknown")
    repo = payload.get("repository", {}).get("full_name", "unknown")
    pr = payload.get("pull_request", {})
    pr_number = pr.get("number", 0)
    pr_title = pr.get("title", "")

    logger.info(
        "webhook_pull_request_event",
        repository=repo,
        action=action,
        pr_number=pr_number,
        pr_title=pr_title,
    )

    return f"Processed PR #{pr_number} ({action}) in {repo}"


async def process_issues_event(payload: dict) -> str:
    """Process GitHub issues event."""
    action = payload.get("action", "unknown")
    repo = payload.get("repository", {}).get("full_name", "unknown")
    issue = payload.get("issue", {})
    issue_number = issue.get("number", 0)
    issue_title = issue.get("title", "")

    logger.info(
        "webhook_issues_event",
        repository=repo,
        action=action,
        issue_number=issue_number,
        issue_title=issue_title,
    )

    return f"Processed issue #{issue_number} ({action}) in {repo}"


async def process_ping_event(payload: dict) -> str:
    """Process GitHub ping event (webhook test)."""
    repo = payload.get("repository", {}).get("full_name", "unknown")
    hook_id = payload.get("hook_id", "unknown")
    zen = payload.get("zen", "")

    logger.info(
        "webhook_ping_event",
        repository=repo,
        hook_id=hook_id,
        zen=zen,
    )

    return f"Pong! Webhook configured for {repo}"
