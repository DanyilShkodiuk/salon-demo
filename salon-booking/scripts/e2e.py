"""End-to-end check against a running dev server (memory store)."""
import html, http.cookiejar, json, re, sys, urllib.error, urllib.parse, urllib.request, uuid

B = "http://localhost:3100"
fails = []

def check(name, cond, extra=""):
    print(("PASS " if cond else "FAIL ") + name + (f"  {extra}" if extra and not cond else ""))
    if not cond:
        fails.append(name)

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(NoRedirect, urllib.request.HTTPCookieProcessor(jar))

def req(method, path, body=None, headers=None, raw=None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    h = dict(headers or {})
    if body is not None:
        h["content-type"] = "application/json"
    r = urllib.request.Request(B + path, data=data, method=method, headers=h)
    try:
        resp = opener.open(r)
    except urllib.error.HTTPError as e:
        resp = e
    text = resp.read().decode()
    return resp.status, text, resp.headers

def book(**kw):
    base = {"serviceId": "cut", "date": "2026-10-19", "startMinute": 600,
            "name": "Anna Kowalska", "contact": "anna@example.com"}
    base.update(kw)
    s, t, _ = req("POST", "/api/bookings", base)
    return s, json.loads(t)

def labels(date, service):
    s, t, _ = req("GET", f"/api/availability?date={date}&service={service}")
    return json.loads(t)

# --- public pages and availability
s, t, _ = req("GET", "/")
check("home page renders", s == 200 and "Luna Hair Studio" in t and "Choose a service" in t)
a = labels("2026-10-19", "cut")
check("Monday has 17 free slots for a 60 min service", len(a["slots"]) == 17)
check("Sunday is closed", labels("2026-10-18", "cut")["slots"] == [])
check("past date rejected with reason", "passed" in labels("2026-10-10", "cut")["reason"])
s, _, _ = req("GET", "/api/availability?date=2026-10-19&service=zzz")
check("unknown service gives 400", s == 400)

# --- booking
s, d = book()
check("booking at 10:00 created", s == 201 and d["booking"]["time"] == "10:00" and d["booking"]["status"] == "pending")
s, d = book()
check("same time again gives 409", s == 409 and d["code"] == "slot_taken")
s, d = book(startMinute=630)
check("overlapping 10:30 gives 409", s == 409)
s, d = book(startMinute=540)
check("back-to-back 09:00 is allowed", s == 201)
s, d = book(startMinute=660, name="A", contact="nope")
check("invalid input gives 400 with field errors", s == 400 and "name" in d["fields"] and "contact" in d["fields"])
s, d = book(startMinute=720, website="spam")
check("honeypot gets 201", s == 201)
check("honeypot booking not stored (12:00 still free)", "12:00" in [x["label"] for x in labels("2026-10-19", "cut")["slots"]])
s, d = book(date="2026-10-18", startMinute=600)
check("closed day gives 400", s == 400)
s, _, _ = req("POST", "/api/bookings", raw=b"x")
check("non-JSON body gives 400", s == 400)
s, d = book(date="2026-10-20", startMinute=840, serviceId="color", name="Piotr Nowak", contact="+48 791 843 254")
check("120 min colour at 14:00 created", s == 201)
l = [x["label"] for x in labels("2026-10-20", "cut")["slots"]]
check("colour booking blocks 14:00-16:00 for later haircuts", "14:00" not in l and "15:30" not in l and "16:00" in l and "13:00" in l)

# --- admin
s, t, h = req("GET", "/admin")
check("admin shows login when signed out", s == 200 and "Staff login" in t and "Anna Kowalska" not in t)
def hidden_inputs(markup):
    out = []
    for m in re.finditer(r'<input type="hidden" name="([^"]+)"(?: value="([^"]*)")?\s*/?>', markup):
        out.append((html.unescape(m.group(1)), html.unescape(m.group(2) or "")))
    return out

hidden = hidden_inputs(t)

def multipart(fields):
    bnd = "----e2e" + uuid.uuid4().hex
    out = b""
    for n, v in fields:
        out += f'--{bnd}\r\nContent-Disposition: form-data; name="{n}"\r\n\r\n{v}\r\n'.encode()
    out += f"--{bnd}--\r\n".encode()
    return out, {"content-type": f"multipart/form-data; boundary={bnd}"}

seen = {}
for n, v in hidden:
    seen.setdefault(n, v)
body, hdr = multipart(list(seen.items()) + [("password", "wrong-password")])
s, t, h = req("POST", "/admin", raw=body, headers=hdr)
check("wrong password sets no session cookie", not any(c.name == "admin_session" for c in jar))

body, hdr = multipart(list(seen.items()) + [("password", "test-pass-123")])
s, t, h = req("POST", "/admin", raw=body, headers=hdr)
check("correct password sets httpOnly session cookie", any(c.name == "admin_session" for c in jar) and "httponly" in (h.get("set-cookie", "").lower()), f"status={s}")

s, t, _ = req("GET", "/admin")
check("admin lists bookings when signed in", s == 200 and "Anna Kowalska" in t and "Piotr Nowak" in t and "Sign out" in t)
plain = t.replace("<!-- -->", "")
check("admin shows time range and service", "10:00–11:00" in plain and "Haircut" in plain and "Colour" in plain)

# Confirm a booking through its server action form
m = re.search(r'(<form[^>]*>(?:(?!</form>).)*?name="status" value="confirmed".*?</form>)', t, re.S)
if m:
    form = m.group(1)
    fields = hidden_inputs(form)
    body, hdr = multipart(fields)
    s, _, _ = req("POST", "/admin", raw=body, headers=hdr)
    s2, t2, _ = req("GET", "/admin")
    check("confirm action changes a booking to confirmed", "confirmed" in re.sub(r'<button.*?</button>', '', t2, flags=re.S))
else:
    check("confirm button found", False)

# Signed-out request must not see data
jar.clear()
s, t, _ = req("GET", "/admin")
check("signed-out admin shows no bookings", "Anna Kowalska" not in t)

print()
print("FAILED:" if fails else "ALL CHECKS PASSED", fails if fails else "")
sys.exit(1 if fails else 0)
