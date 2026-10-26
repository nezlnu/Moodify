from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import User
class RegisterForm(UserCreationForm):
    email = forms.EmailField(max_length=254)
    class Meta:
        model=User
        fields=['username','email','password1','password2']
    def clean_username(self):
        value=self.cleaned_data['username'].strip().lower()
        if User.objects.filter(username__iexact=value).exists():
            raise forms.ValidationError('This username is already registered.')
        return value
    def clean_email(self):
        value=self.cleaned_data['email'].strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise forms.ValidationError('This email is already registered.')
        return value
class LoginForm(AuthenticationForm):
    def clean_username(self):
        return self.cleaned_data['username'].strip().lower()
