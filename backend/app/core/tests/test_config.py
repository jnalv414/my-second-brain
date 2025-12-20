"""Settings configuration tests - ensure environment loading works correctly.

Test Categories:
- Default value loading
- Environment variable overrides
- Path handling
- Type coercion
"""

import os
from pathlib import Path
from unittest.mock import patch

from app.core.config import Settings

# ============================================================================
# Default Settings Tests
# ============================================================================


class TestSettingsDefaults:
    """Test that Settings loads with proper defaults."""

    def test_settings_loads_defaults(self):
        """TC-CFG-001: Settings loads with default values when no env vars set."""
        # Create settings with clean environment
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()

        # Vault configuration defaults
        assert isinstance(settings.vault_path, Path)
        assert "Obsidian" in str(settings.vault_path)

        # LLM configuration defaults
        assert settings.llm_model == "claude-sonnet-4-20250514"
        assert settings.anthropic_api_key == ""

        # Server configuration defaults
        assert settings.host == "0.0.0.0"
        assert settings.port == 8000
        assert settings.debug is False

        # Logging defaults
        assert settings.log_level == "INFO"
        assert settings.log_format == "json"

    def test_settings_default_vault_path_is_path_object(self):
        """TC-CFG-002: Default vault_path is a Path object."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()

        assert isinstance(settings.vault_path, Path)

    def test_settings_default_port_is_int(self):
        """TC-CFG-003: Default port is an integer."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()

        assert isinstance(settings.port, int)
        assert settings.port == 8000

    def test_settings_default_debug_is_bool(self):
        """TC-CFG-004: Default debug is a boolean."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()

        assert isinstance(settings.debug, bool)
        assert settings.debug is False


# ============================================================================
# Environment Variable Override Tests
# ============================================================================


class TestSettingsFromEnv:
    """Test that Settings correctly loads from environment variables."""

    def test_settings_from_env_vault_path(self, tmp_path: Path):
        """TC-CFG-010: VAULT_PATH env var overrides default."""
        env_vars = {"VAULT_PATH": str(tmp_path)}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.vault_path == tmp_path

    def test_settings_from_env_llm_model(self):
        """TC-CFG-011: LLM_MODEL env var overrides default."""
        env_vars = {"LLM_MODEL": "claude-opus-4-20250514"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.llm_model == "claude-opus-4-20250514"

    def test_settings_from_env_anthropic_api_key(self):
        """TC-CFG-012: ANTHROPIC_API_KEY env var is loaded."""
        env_vars = {"ANTHROPIC_API_KEY": "sk-ant-test-key-12345"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.anthropic_api_key == "sk-ant-test-key-12345"

    def test_settings_from_env_host(self):
        """TC-CFG-013: HOST env var overrides default."""
        env_vars = {"HOST": "127.0.0.1"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.host == "127.0.0.1"

    def test_settings_from_env_port(self):
        """TC-CFG-014: PORT env var overrides default with type coercion."""
        env_vars = {"PORT": "3000"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.port == 3000
        assert isinstance(settings.port, int)

    def test_settings_from_env_debug_true(self):
        """TC-CFG-015: DEBUG=true env var sets debug to True."""
        env_vars = {"DEBUG": "true"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.debug is True

    def test_settings_from_env_debug_false(self):
        """TC-CFG-016: DEBUG=false env var sets debug to False."""
        env_vars = {"DEBUG": "false"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.debug is False

    def test_settings_from_env_log_level(self):
        """TC-CFG-017: LOG_LEVEL env var overrides default."""
        env_vars = {"LOG_LEVEL": "DEBUG"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.log_level == "DEBUG"

    def test_settings_from_env_log_format(self):
        """TC-CFG-018: LOG_FORMAT env var overrides default."""
        env_vars = {"LOG_FORMAT": "console"}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.log_format == "console"

    def test_settings_from_env_multiple_vars(self, tmp_path: Path):
        """TC-CFG-019: Multiple env vars can be set simultaneously."""
        env_vars = {
            "VAULT_PATH": str(tmp_path),
            "PORT": "9000",
            "DEBUG": "true",
            "LOG_LEVEL": "WARNING",
            "HOST": "localhost",
        }

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.vault_path == tmp_path
        assert settings.port == 9000
        assert settings.debug is True
        assert settings.log_level == "WARNING"
        assert settings.host == "localhost"


# ============================================================================
# Edge Cases and Type Coercion Tests
# ============================================================================


class TestSettingsEdgeCases:
    """Test edge cases and type handling in Settings."""

    def test_settings_ignores_extra_env_vars(self):
        """TC-CFG-020: Unknown env vars are ignored (extra='ignore')."""
        env_vars = {
            "UNKNOWN_VAR": "some_value",
            "ANOTHER_UNKNOWN": "another_value",
        }

        with patch.dict(os.environ, env_vars, clear=True):
            # Should not raise an error
            settings = Settings()

        # Settings should still have defaults
        assert settings.port == 8000

    def test_settings_port_boundary_values(self):
        """TC-CFG-021: Port accepts valid boundary values."""
        # Minimum valid port
        with patch.dict(os.environ, {"PORT": "1"}, clear=True):
            settings = Settings()
            assert settings.port == 1

        # Maximum valid port
        with patch.dict(os.environ, {"PORT": "65535"}, clear=True):
            settings = Settings()
            assert settings.port == 65535

    def test_settings_empty_string_env_vars(self):
        """TC-CFG-022: Empty string env vars are handled."""
        env_vars = {"ANTHROPIC_API_KEY": ""}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.anthropic_api_key == ""

    def test_settings_path_with_spaces(self, tmp_path: Path):
        """TC-CFG-023: Paths with spaces are handled correctly."""
        path_with_spaces = tmp_path / "path with spaces"
        path_with_spaces.mkdir()

        env_vars = {"VAULT_PATH": str(path_with_spaces)}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.vault_path == path_with_spaces

    def test_settings_env_vars_case_insensitive(self):
        """TC-CFG-024: pydantic-settings handles env vars case-insensitively."""
        # pydantic-settings is case-insensitive by default
        with patch.dict(os.environ, {"port": "9999"}, clear=True):
            settings = Settings()
            # lowercase 'port' is recognized due to pydantic-settings behavior
            assert settings.port == 9999

    def test_settings_debug_various_true_values(self):
        """TC-CFG-025: Various truthy string values for DEBUG."""
        truthy_values = ["true", "True", "TRUE", "1", "yes", "on"]

        for value in truthy_values:
            with patch.dict(os.environ, {"DEBUG": value}, clear=True):
                settings = Settings()
                assert settings.debug is True, f"Failed for value: {value}"

    def test_settings_debug_various_false_values(self):
        """TC-CFG-026: Various falsy string values for DEBUG."""
        falsy_values = ["false", "False", "FALSE", "0", "no", "off"]

        for value in falsy_values:
            with patch.dict(os.environ, {"DEBUG": value}, clear=True):
                settings = Settings()
                assert settings.debug is False, f"Failed for value: {value}"


# ============================================================================
# Settings Instance and Caching Tests
# ============================================================================


class TestSettingsInstance:
    """Test Settings instantiation and caching behavior."""

    def test_settings_is_instantiable(self):
        """TC-CFG-030: Settings class can be instantiated."""
        settings = Settings()
        assert settings is not None

    def test_settings_attributes_accessible(self):
        """TC-CFG-031: All expected attributes are accessible."""
        settings = Settings()

        # Check all attributes exist and are accessible
        _ = settings.vault_path
        _ = settings.llm_model
        _ = settings.anthropic_api_key
        _ = settings.host
        _ = settings.port
        _ = settings.debug
        _ = settings.log_level
        _ = settings.log_format

    def test_get_settings_returns_settings_instance(self):
        """TC-CFG-032: get_settings() returns a Settings instance."""
        from app.core.config import get_settings

        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_get_settings_is_cached(self):
        """TC-CFG-033: get_settings() returns cached instance (lru_cache)."""
        from app.core.config import get_settings

        # Clear the cache first
        get_settings.cache_clear()

        settings1 = get_settings()
        settings2 = get_settings()

        # Same object should be returned
        assert settings1 is settings2

    def test_module_level_settings_available(self):
        """TC-CFG-034: Module-level settings singleton is available."""
        from app.core.config import settings

        assert isinstance(settings, Settings)


# ============================================================================
# Path Validation Tests
# ============================================================================


class TestSettingsPathHandling:
    """Test Path handling in Settings."""

    def test_vault_path_relative_to_home(self):
        """TC-CFG-040: Default vault_path is relative to home directory."""
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings()

        assert str(Path.home()) in str(settings.vault_path)

    def test_vault_path_absolute_path_from_env(self, tmp_path: Path):
        """TC-CFG-041: Absolute paths from env are preserved."""
        abs_path = tmp_path / "absolute" / "vault"
        abs_path.mkdir(parents=True)

        env_vars = {"VAULT_PATH": str(abs_path)}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert settings.vault_path == abs_path
        assert settings.vault_path.is_absolute()

    def test_vault_path_converts_string_to_path(self, tmp_path: Path):
        """TC-CFG-042: String vault path is converted to Path object."""
        env_vars = {"VAULT_PATH": str(tmp_path)}

        with patch.dict(os.environ, env_vars, clear=True):
            settings = Settings()

        assert isinstance(settings.vault_path, Path)
