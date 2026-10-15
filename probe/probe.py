"""성남판 준비용 1회 점검: robots.txt, 페이지 모양, 코드 확인 (결과는 probe/out 에 저장)"""
import json, os, re, urllib.parse, urllib.request, ssl
OUT = "probe/out"; os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36 (airang-seongnam probe)"}
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
def get(url, n=200000):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40, context=ctx) as r:
            return r.status, r.geturl(), r.read(n).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, url, e.read(2000).decode("utf-8", "replace")
    except Exception as e:
        return 0, url, repr(e)
def save(name, text): open(f"{OUT}/{name}", "w", encoding="utf-8").write(text)
# 1) robots.txt
rb = []
for h in ["www.snlib.go.kr", "snlib.go.kr", "www.snart.or.kr", "snart.or.kr", "www.seongnam.go.kr", "spo.isdc.co.kr", "www.isdc.co.kr", "www.snfi.or.kr", "www.sncf.or.kr", "www.gac.or.kr"]:
    st, u, t = get(f"https://{h}/robots.txt", 5000)
    rb.append(f"### {h} [{st}] {u}\n{t[:1500]}\n")
save("robots.txt", "\n".join(rb))
# 2) 홈페이지·목록 페이지 모양 (링크만 뽑아 둠)
def links(name, url):
    st, u, t = get(url)
    ls = sorted(set(re.findall(r'href=["\']([^"\'#]+)["\']', t)))
    save(name, f"[{st}] {u} len={len(t)}\n" + "\n".join(ls[:600]) + "\n\n----HEAD----\n" + t[:4000])
for name, url in [("snart_home.txt", "https://www.snart.or.kr/"), ("snlib_home.txt", "https://www.snlib.go.kr/"),
                  ("spo_home.txt", "https://spo.isdc.co.kr/"), ("isdc_home.txt", "https://www.isdc.co.kr/"),
                  ("sn_home.txt", "https://www.seongnam.go.kr/")]:
    links(name, url)
# 3) 도서관 정보나루 세부지역 코드 찾기
KEY = os.environ.get("LIB_KEY", "").strip()
lines = []
for dr in [31020, 31021, 31022, 31023, 31024, 31030]:
    st, u, t = get("https://data4library.kr/api/libSrch?" + urllib.parse.urlencode({"authKey": KEY, "format": "json", "region": 31, "dtl_region": dr, "pageSize": 50}))
    try:
        libs = [x["lib"] for x in json.loads(t)["response"].get("libs", [])]
        lines.append(f"{dr}: {len(libs)}곳 " + " | ".join(f"{l.get('libName')}({l.get('address','')[:20]})" for l in libs[:40]))
    except Exception as e:
        lines.append(f"{dr}: 오류 {st} {t[:200].replace(KEY,'***')}")
save("data4library.txt", "\n".join(lines))
# 4) 에어코리아 측정소 (경기) 이름 목록
WK = os.environ.get("WEATHER_KEY", "").strip()
st, u, t = get("http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getCtprvnRltmMesureDnsty?" + urllib.parse.urlencode({"serviceKey": WK, "returnType": "json", "numOfRows": 300, "pageNo": 1, "sidoName": "경기", "ver": "1.0"}))
try:
    names = [i["stationName"] for i in json.loads(t)["response"]["body"]["items"]]
    save("airkorea.txt", " ".join(names))
except Exception:
    save("airkorea.txt", f"오류 {st} {t[:300].replace(WK,'***')}")
print(open(f"{OUT}/data4library.txt").read())
