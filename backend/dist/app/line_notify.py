import http.client
import urllib.parse

def send_line_notify(token: str, message: str):
    if not token:
        return False
    conn = http.client.HTTPSConnection("notify-api.line.me")
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Bearer {token}",
    }
    payload = urllib.parse.urlencode({"message": message})
    conn.request("POST", "/api/notify", payload, headers)
    res = conn.getresponse()
    try:
        return 200 <= res.status < 300
    finally:
        res.read()
        conn.close()
