"""4개 도시 코드 확인: 유치원 시군구 코드, 정보나루 세부지역, 나이스 주소, 학원 지역명, 체육시설 사이트 robots"""
import json, os, re, ssl, urllib.parse, urllib.request
OUT = "probe/out"; os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (airang probe)"}
ctx = ssl.create_default_context(); ctx.check_hostname = False; ctx.verify_mode = ssl.CERT_NONE
def get(url, n=3000000):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60, context=ctx) as r:
            return r.status, r.read(n).decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read(2000).decode("utf-8", "replace")
    except Exception as e:
        return 0, repr(e)
K = {k: os.environ.get(k, "").strip() for k in ("KINDER_KEY", "LIB_KEY", "NEIS_KEY")}
lines = []
cand = {"안양": [41171, 41173], "고양": [41281, 41285, 41287], "화성": [41590, 41591, 41593, 41595, 41597], "부천": [41190, 41192, 41194, 41196]}
for city, codes in cand.items():
    for c in codes:
        st, t = get("https://e-childschoolinfo.moe.go.kr/api/notice/basicInfo2.do?" + urllib.parse.urlencode({"key": K["KINDER_KEY"], "sidoCode": 41, "sggCode": c, "pageCnt": 500, "currentPage": 1}))
        try:
            d = json.loads(t); ks = d.get("kinderInfo") or []
            lines.append(f"유치원 {city} {c}: {len(ks)}곳 {d.get('status')} 예: {(ks[0].get('addr') if ks else '')[:40]}")
        except Exception:
            lines.append(f"유치원 {city} {c}: 오류 {st} {t[:120]}")
for dr in range(31010, 31330, 10):
    for sub in [dr] + [dr + i for i in range(1, 5)]:
        st, t = get("https://data4library.kr/api/libSrch?" + urllib.parse.urlencode({"authKey": K["LIB_KEY"], "format": "json", "region": 31, "dtl_region": sub, "pageSize": 3}))
        try:
            libs = [x["lib"] for x in json.loads(t)["response"].get("libs", [])]
        except Exception:
            libs = []
        if libs:
            a = libs[0].get("address", "")
            if any(c in a for c in ("안양", "고양", "화성", "부천")):
                lines.append(f"정보나루 {sub}: {a[:40]} ({libs[0].get('libName')})")
        elif sub != dr:
            break
for nm in ["안양시", "고양시", "화성시", "부천시"]:
    st, t = get("https://open.neis.go.kr/hub/acaInsTiInfo?" + urllib.parse.urlencode({"KEY": K["NEIS_KEY"], "Type": "json", "pIndex": 1, "pSize": 3, "ATPT_OFCDC_SC_CODE": "J10", "ADMST_ZONE_NM": nm}))
    try:
        d = json.loads(t)["acaInsTiInfo"]; tot = d[0]["head"][0]["list_total_count"]; ex = d[1]["row"][0].get("FA_RDNMA")
        lines.append(f"학원 {nm}: 전체 {tot} 예: {ex}")
    except Exception:
        lines.append(f"학원 {nm}: {t[:150]}")
rows = []
for p in range(1, 4):
    st, t = get("https://open.neis.go.kr/hub/schoolInfo?" + urllib.parse.urlencode({"KEY": K["NEIS_KEY"], "Type": "json", "pIndex": p, "pSize": 1000, "ATPT_OFCDC_SC_CODE": "J10"}))
    try:
        rows += json.loads(t)["schoolInfo"][1]["row"]
    except Exception:
        break
for nm in ["화성시", "부천시", "고양시", "안양시"]:
    gus = {}
    for r in rows:
        a = r.get("ORG_RDNMA") or ""
        if nm in a:
            m = re.search(nm + r"\s+(\S+구)", a); g = m.group(1) if m else "(구 없음)"; gus[g] = gus.get(g, 0) + 1
    lines.append(f"학교 주소 {nm}: {gus}")
for h in ["www.auc.or.kr", "www.ayac.or.kr", "www.gys.or.kr", "www.artgy.or.kr", "www.goyang.go.kr", "www.hscity.go.kr", "www.hsuco.or.kr", "www.hcf.or.kr", "www.bcmc.or.kr", "www.bcf.or.kr", "www.anyang.go.kr", "www.bucheon.go.kr", "www.gyfmc.or.kr", "www.bucheon-ucc.or.kr"]:
    st, t = get(f"https://{h}/robots.txt", 3000)
    lines.append(f"robots {h} [{st}] " + " | ".join(t.strip().splitlines()[:4])[:200])
open(f"{OUT}/cities.txt", "w").write("\n".join(lines))
print("\n".join(lines))
