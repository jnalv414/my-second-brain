"""Tool registry - import tools to register them with the agent.

This module uses side-effect imports to register tools with vault_agent.
Import this module once at application startup to register all tools.

Usage:
    import app.core.tool_registry  # noqa: F401
"""

# Import tools to register them with vault_agent via @vault_agent.tool decorator
# Each import triggers the decorator which adds the tool to the agent

# Vault operations
import app.features.vault_links.tool  # noqa: F401
import app.features.vault_read.tool  # noqa: F401
import app.features.vault_search.tool  # noqa: F401
import app.features.vault_write.tool  # noqa: F401
