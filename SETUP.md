# Moodify — Windows setup with Python and MySQL

This package includes your HTML/CSS/JavaScript, a Django Python backend, registration, username/password login, logout, a profile page and private listening history saved in MySQL. Use this complete folder instead of mixing individual files into your old folder. Your original documentation is included unchanged; its PostgreSQL mention is superseded by this MySQL setup.

## 1. Install the tools

If Python 3.13.3 is already installed, keep it. In Command Prompt run `py --version` to check. Otherwise install Python 3.13 from https://www.python.org/downloads/windows/ and enable the Python launcher and PATH option.

Install MySQL Community Server 8.4 LTS from https://dev.mysql.com/downloads/mysql/ (choose Windows). During setup, configure a local server, keep TCP port 3306, set and remember the root password, and enable its Windows service. Install MySQL Workbench from https://dev.mysql.com/downloads/workbench/ if you want a visual database editor. Workbench alone does not install a database server.

## 2. Create the database

Open Workbench, connect to your local MySQL server as root using the password you chose, and open a new SQL query tab. Choose your own strong database password, replace `CHOOSE_YOUR_OWN_PASSWORD` below, then execute the three statements using the lightning button:

```sql
CREATE DATABASE moodify CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'moodify_app'@'localhost' IDENTIFIED BY 'lr270879';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
ON moodify.* TO 'moodify_app'@'localhost';
```

These permissions allow Django to create/update its tables in this one database. Do not use root as the application's database account. If the database/user already exists, do not run CREATE again; use the existing credentials or ask for help before changing them.

## 3. Open the project folder

Extract the ZIP. Open the inner `Moodify` folder containing `manage.py`. In File Explorer's address bar type `cmd` and press Enter. This opens Command Prompt in the right directory. All following commands run there.

```bat
py -3.13 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The virtual environment keeps this project's Python packages together. Django provides the web server, forms and account system. mysqlclient connects Python to MySQL. python-dotenv loads your private configuration. django-axes limits repeated incorrect login attempts.

## 4. Configure the connection

In the same Command Prompt:

```bat
copy .env.example .env
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the generated secret. Open `.env` in your code editor and set:

```dotenv
DJANGO_SECRET_KEY='paste-the-generated-secret-here'
DJANGO_DEBUG=true
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=moodify
DB_USER=moodify_app
DB_PASSWORD='the-password-you-chose-in-step-2'
DB_HOST=127.0.0.1
DB_PORT=3306
```

Use quotes around the secret/password, especially if they contain `#`. Do not share `.env`, commit it, or put these credentials in JavaScript. The backend alone reads them.

## 5. Create the tables and start the backend

Make sure the MySQL Windows service is running, then run:

```bat
python manage.py check
python manage.py migrate
python manage.py runserver
```

`migrate` connects to MySQL and creates the tables using the included migration files. You do not need to manually create a users table. Leave the server terminal open.

Open http://127.0.0.1:8000/ in your browser. Always use this address, including for registration and login. Do not double-click the HTML files or use VS Code Live Server: Django must render the forms and handle their requests. Stay on the same hostname; localhost and 127.0.0.1 have separate cookies.

## 6. Verify that data is saved

1. Click Register and enter a username, email, password and matching password confirmation. Passwords need at least 8 characters, an uppercase letter, a number and a symbol. Common passwords and passwords too similar to your account details are also rejected.
2. After successful registration, the profile shows your username and email.
3. Go Home, choose mood/activity/energy, and open a playlist. Library should show it.
4. Log out, then log in using your **username** and password. History should still be there. Usernames and email addresses are stored in lowercase.
5. Register a second account with different details. Its history should be empty.
6. Restart the Python server and check again. Data remains in MySQL.

In Workbench refresh SCHEMAS, expand `moodify`, or run:

```sql
USE moodify;
SHOW TABLES;
SELECT id, username, email, date_joined FROM accounts_user;
SELECT user_id, playlist, mood, activity, energy, date FROM accounts_listeninghistory;
```

| Table | What it saves |
| --- | --- |
| accounts_user | Username, unique email, password hash, join date and account flags |
| accounts_listeninghistory | Account ID, playlist URL, mood, activity, energy and timestamp |
| django_session | Login sessions |
| axes_accessattempt | Failed login attempts used for temporary lockout |

Passwords are hashed, not stored as readable text. A playlist opening records a recommendation; it does not prove that a person listened to the Spotify audio. The Library displays the latest 100 entries; older entries remain until you clear history. Clearing history affects only the signed-in account. Guests can use recommendations but their history is not saved. Old browser-local history is not imported.

Optional: create an administrator with `python manage.py createsuperuser`, then visit http://127.0.0.1:8000/admin/. Keep this account private.

## 7. Start again tomorrow

Open Command Prompt in the folder containing manage.py, then:

```bat
.venv\Scripts\activate
python manage.py runserver
```

Stop the server with Ctrl+C. Do not delete the MySQL database if you want to keep the accounts/history.

## Troubleshooting

- `py` not recognized: install Python with the launcher enabled, then reopen Command Prompt.
- `No module named django`: activate `.venv` and install requirements.
- `mysqlclient` tries to compile / Microsoft Visual C++ error: use 64-bit Python 3.13 with updated pip so a compatible Windows wheel can be installed. If it still fails, share the exact error. Avoid substituting a random database driver.
- MySQL error 2003 / connection refused: start the MySQL service and check host/port in `.env`.
- MySQL error 1045 / access denied: the database username/password or allowed host does not match step 2. Check `.env` and that the user was created on this MySQL server.
- MySQL error 1049 / unknown database: create `moodify` on the same MySQL instance the backend connects to.
- Table does not exist: run `python manage.py migrate`.
- CSRF 403: open the form through the Django address, refresh it, enable cookies and avoid switching hostnames. A form opened before logout/login may need refreshing.
- Too many failed logins: the IP is temporarily locked after five failures for 15 minutes. During local development an administrator can reset with `python manage.py axes_reset`.
- Port 8000 already in use: run `python manage.py runserver 8001` and use http://127.0.0.1:8001/.

## Files and scope

- `backend/settings.py`: MySQL and Django settings.
- `accounts/models.py`: database structure.
- `accounts/forms.py`: registration/login validation.
- `accounts/views.py`: registration, profile and history requests.
- `templates/`: your pages rendered by Django.
- `static/`: CSS and JavaScript.
- `accounts/migrations/`: instructions that create the tables.

The form submits to Django, Django validates the input and saves a User through its ORM, and the ORM writes to MySQL. Password handling uses Django's account system. Login sets an HttpOnly session cookie; no passwords or login tokens are stored in localStorage. POST/DELETE requests use CSRF protection. History requests always use the session's user ID rather than trusting an ID supplied by the browser.

This implements the account/login foundation and your existing listening-history feature. Spotify API search, favourite songs, personal playlists, profile editing/deletion, email verification and password recovery are not implemented. Unsupported navigation links were removed. Existing playlist recommendations still use your supplied Spotify URLs; this is not a Spotify API integration. Some documented moods/activities are still absent from your original recommendation selector.

## Validation and future public hosting

Run isolated automated tests without touching MySQL:

```bat
python manage.py test accounts --settings=backend.test_settings
```

This test configuration deliberately uses a temporary SQLite database. Tests cover registration/password validation, duplicate accounts, password hashing, login/logout, failed-login lockout, CSRF and history isolation. MySQL still needs to be verified on your machine through migration and the registration/history checks above.

This project is configured for local development. Before public hosting: set DEBUG=false, use your actual hostnames and HTTPS, keep secrets private, use a production WSGI server and static-file hosting (`python manage.py collectstatic`), run `python manage.py check --deploy`, configure database backups and verify them, and review your hosting proxy/security configuration. The included development server is not a public hosting server. Add email verification and password recovery before relying on it for real users. The original performance/availability goals have not been load-tested.

References:
- https://docs.djangoproject.com/en/5.2/topics/auth/default/
- https://docs.djangoproject.com/en/5.2/ref/databases/#mysql-notes
- https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
- https://dev.mysql.com/doc/refman/8.4/en/creating-database.html
