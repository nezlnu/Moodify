from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ListeningHistory
admin.site.register(User,UserAdmin)
@admin.register(ListeningHistory)
class HistoryAdmin(admin.ModelAdmin):
    list_display=['user','mood','activity','energy','date']
    readonly_fields=['date']
