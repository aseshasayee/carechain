"""
Application configuration for the accounts app.
"""

from django.apps import AppConfig


class AccountsConfig(AppConfig):
    """Configuration for the accounts app."""
    
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    
    def ready(self):
        """
        Initialize app when it's ready.
        Import signals here to avoid AppRegistryNotReady exception.
        """
        import accounts.signals  # noqa 