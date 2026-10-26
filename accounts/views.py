import json, re
from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .forms import RegisterForm
from .models import ListeningHistory

def register(request):
    if request.user.is_authenticated:
        return redirect('profile')
    form=RegisterForm(request.POST or None)
    if request.method == 'POST' and form.is_valid():
        try:
            with transaction.atomic():
                user=form.save()
        except IntegrityError:
            form.add_error(None, 'This username or email is already registered.')
        else:
            login(request,user,backend='django.contrib.auth.backends.ModelBackend')
            return redirect('profile')
    return render(request,'register.html',{'form':form})

@login_required
def profile(request):
    return render(request,'profile.html')

@require_http_methods(['GET','POST','DELETE'])
def history(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error':'Please log in to save or view history.'},status=401)
    if request.method == 'GET':
        return JsonResponse({'history':list(ListeningHistory.objects.filter(user=request.user).values('playlist','mood','activity','energy','date')[:100])})
    if request.method == 'DELETE':
        ListeningHistory.objects.filter(user=request.user).delete()
        return JsonResponse({'ok':True})
    try:
        data=json.loads(request.body)
        if not isinstance(data,dict): raise ValueError()
        playlist=data.get('playlist','')
        if not isinstance(playlist,str) or not re.fullmatch(r'https://open\.spotify\.com/(?:embed/)?playlist/[A-Za-z0-9]{22}(?:\?[^\s]{0,350})?',playlist): raise ValueError()
        if data.get('mood') not in ['happy','sad']: raise ValueError()
        if data.get('activity') not in ['studying','working','exercising','relaxing','driving','partying']: raise ValueError()
        energy=data.get('energy')
        if type(energy) is not int or not 0 <= energy <= 100: raise ValueError()
    except (ValueError,TypeError):
        return JsonResponse({'error':'Invalid playlist, mood, activity or energy.'},status=400)
    ListeningHistory.objects.create(user=request.user,playlist=playlist,mood=data['mood'],activity=data['activity'],energy=energy)
    return JsonResponse({'ok':True},status=201)
