from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
class User(AbstractUser):
    email = models.EmailField(unique=True)
class ListeningHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='history')
    playlist = models.URLField(max_length=500)
    mood = models.CharField(max_length=20)
    activity = models.CharField(max_length=20)
    energy = models.PositiveSmallIntegerField(validators=[MinValueValidator(0),MaxValueValidator(100)])
    date = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['-date','-id']
