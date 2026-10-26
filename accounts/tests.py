import json
from django.test import TestCase, Client
from .models import User, ListeningHistory
class AccountTests(TestCase):
    def setUp(self):
        self.data={'username':'alice','email':'alice@example.com','password1':'UniqueTune!843','password2':'UniqueTune!843'}
        self.entry={'playlist':'https://open.spotify.com/embed/playlist/14KtkIpsvzDSCXR24EqHCL','mood':'happy','activity':'studying','energy':50}
    def test_register_hash_and_session(self):
        response=self.client.post('/register.html',self.data)
        self.assertRedirects(response,'/profile.html')
        user=User.objects.get(username='alice')
        self.assertNotEqual(user.password,self.data['password1'])
        self.assertTrue(user.check_password(self.data['password1']))
        self.assertEqual(int(self.client.session['_auth_user_id']),user.pk)
    def test_invalid_password_and_confirmation(self):
        for password in ['alllowercase','UppercaseOnly','NoSymbol123']:
            response=self.client.post('/register.html',{**self.data,'password1':password,'password2':password})
            self.assertEqual(response.status_code,200)
            self.assertFalse(User.objects.exists())
        self.client.post('/register.html',{**self.data,'password2':'different'})
        self.assertFalse(User.objects.exists())
    def test_duplicate_email_and_username(self):
        User.objects.create_user('alice','alice@example.com','UniqueTune!843')
        for update in [{'username':'ALICE','email':'other@example.com'},{'username':'other','email':'ALICE@example.com'}]:
            self.client.post('/register.html',{**self.data,**update})
            self.assertEqual(User.objects.count(),1)
    def test_login_logout_and_profile(self):
        User.objects.create_user('alice','alice@example.com','UniqueTune!843')
        self.assertEqual(self.client.get('/profile.html').status_code,302)
        self.client.post('/login.html',{'username':'alice','password':'wrong'})
        self.assertNotIn('_auth_user_id',self.client.session)
        self.client.post('/login.html',{'username':'ALICE','password':'UniqueTune!843'})
        self.assertEqual(self.client.get('/profile.html').status_code,200)
        self.assertEqual(self.client.get('/logout/').status_code,405)
        self.client.post('/logout/')
        self.assertNotIn('_auth_user_id',self.client.session)
    def test_csrf(self):
        client=Client(enforce_csrf_checks=True)
        self.assertEqual(client.post('/register.html',self.data).status_code,403)
        self.assertEqual(client.post('/login.html',{}).status_code,403)
        self.assertEqual(client.post('/api/history/',self.entry).status_code,403)
    def test_history_ownership_validation_and_guest(self):
        self.assertEqual(self.client.get('/api/history/').status_code,401)
        self.assertEqual(self.client.post('/api/history/',json.dumps(self.entry),content_type='application/json').status_code,401)
        a=User.objects.create_user('alice','alice@example.com','UniqueTune!843')
        b=User.objects.create_user('bob','bob@example.com','UniqueTune!843')
        self.client.force_login(a)
        self.assertEqual(self.client.post('/api/history/',json.dumps(self.entry),content_type='application/json').status_code,201)
        for bad in [{**self.entry,'energy':101},{**self.entry,'playlist':'javascript:alert(1)'},{**self.entry,'energy':True}]:
            self.assertEqual(self.client.post('/api/history/',json.dumps(bad),content_type='application/json').status_code,400)
        self.client.force_login(b)
        self.assertEqual(self.client.get('/api/history/').json()['history'],[])
        self.client.delete('/api/history/')
        self.assertEqual(ListeningHistory.objects.count(),1)
        self.client.force_login(a)
        self.client.delete('/api/history/')
        self.assertEqual(ListeningHistory.objects.count(),0)
    def test_pages_render(self):
        for path in ['/','/index.html','/register.html','/login.html','/library.html']:
            self.assertEqual(self.client.get(path).status_code,200)
    def test_failed_login_lockout(self):
        User.objects.create_user('alice','alice@example.com','UniqueTune!843')
        for _ in range(5): self.client.post('/login.html',{'username':'alice','password':'wrong'})
        self.client.post('/login.html',{'username':'alice','password':'UniqueTune!843'})
        self.assertNotIn('_auth_user_id',self.client.session)
