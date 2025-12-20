"""Webhook Pydantic models."""

from pydantic import BaseModel, ConfigDict


class WebhookResponse(BaseModel):
    """Response for webhook events."""

    status: str
    event: str
    message: str


class GitHubRepository(BaseModel):
    """GitHub repository info from webhook payload."""

    full_name: str
    name: str
    html_url: str
    default_branch: str | None = None


class GitHubSender(BaseModel):
    """GitHub sender info from webhook payload."""

    login: str


class GitHubWebhookPayload(BaseModel):
    """Base GitHub webhook payload."""

    model_config = ConfigDict(extra="allow")

    action: str | None = None
    repository: GitHubRepository | None = None
    sender: GitHubSender | None = None
