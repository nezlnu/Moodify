from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from django.contrib.auth.views import LoginView, LogoutView
from accounts import views
from accounts.forms import LoginForm
urlpatterns=[path('',TemplateView.as_view(template_name='index.html'),name='home'),path('index.html',TemplateView.as_view(template_name='index.html')),path('register.html',views.register,name='register'),path('login.html',LoginView.as_view(template_name='login.html',authentication_form=LoginForm,redirect_authenticated_user=True),name='login'),path('logout/',LogoutView.as_view(),name='logout'),path('profile.html',views.profile,name='profile'),path('library.html',TemplateView.as_view(template_name='library.html'),name='library'),path('api/history/',views.history),path('admin/',admin.site.urls)]
