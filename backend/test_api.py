import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:8000/api/auth/register',
    data=b'{"email":"test3@test.com","password":"test"}',
    headers={'Content-Type': 'application/json'}
)
try:
    resp = urllib.request.urlopen(req)
    print("STATUS:", resp.status)
    print(resp.read())
except urllib.error.HTTPError as e:
    print("ERROR:", e.code)
    print(e.read().decode())
