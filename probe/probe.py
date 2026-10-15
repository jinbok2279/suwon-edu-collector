"""성남판 준비용 점검 2: 체육시설 강좌 목록 구조, 시설 주소"""
import os, re, urllib.request, ssl
OUT = "probe/out"; os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36 (airang-seongnam probe)"}
def get(url, n=400000):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
            return r.status, r.read(n).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read(3000).decode("utf-8", "replace")
    except Exception as e:
        return 0, repr(e)
B = "https://spo.isdc.co.kr"
st, t = get(B + "/courseRegist.do")
open(f"{OUT}/spo_course.html", "w").write(f"[{st}]\n" + t)
js = sorted(set(re.findall(r'src=["\']([^"\']+\.js[^"\']*)', t)))
eps = sorted(set(re.findall(r'["\'](/[A-Za-z0-9_/]+\.do)', t)))
txt = [f"[{st}] len={len(t)}", "JS:"] + js + ["ENDPOINTS:"] + eps
for s in js:
    if s.startswith("/") and "jquery" not in s.lower():
        s2, j = get(B + s)
        txt.append(f"--- {s} [{s2}] " + " ".join(sorted(set(re.findall(r'["\'](/[A-Za-z0-9_/]+\.do)', j)))))
open(f"{OUT}/spo_course_eps.txt", "w").write("\n".join(txt))
vw = []
for p in ["tan", "sns", "spo", "pgs", "ggp"]:
    s2, h = get(f"{B}/{p}_visitWay.do")
    body = re.sub(r"<script.*?</script>|<style.*?</style>", " ", h, flags=re.S)
    body = re.sub(r"<[^>]+>", " ", body); body = " ".join(body.split())
    i = body.find("주소")
    vw.append(f"### {p} [{s2}] title={re.search(r'<title>(.*?)</title>', h, re.S).group(1).strip() if '<title>' in h else ''}\n{body[max(0,i-200):i+600]}")
open(f"{OUT}/spo_centers.txt", "w").write("\n\n".join(vw))
print(open(f"{OUT}/spo_course_eps.txt").read()[:3000])
