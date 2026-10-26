import re
from django.core.exceptions import ValidationError
class PasswordRules:
    def validate(self, password, user=None):
        if not re.search(r'[A-Z]',password) or not re.search(r'[0-9]',password) or not re.search(r'[^\w\s]',password):
            raise ValidationError(self.get_help_text())
    def get_help_text(self):
        return 'Use at least one uppercase letter, one number and one symbol (for example !).'
