"""정보나루 경기 세부지역 코드 전체 표"""
import json, os, urllib.parse, urllib.request
OUT = "probe/out"; os.makedirs(OUT, exist_ok=True)
KEY = os.environ.get("LIB_KEY", "").strip()
lines = []
for base in range(31010, 31330, 10):
    for sub in range(base, base + 10):
        try:
            with urllib.request.urlopen("https://data4library.kr/api/libSrch?" + urllib.parse.urlencode({"authKey": KEY, "format": "json", "region": 31, "dtl_region": sub, "pageSize": 50}), timeout=40) as r:
                libs = [x["lib"] for x in json.loads(r.read())["response"].get("libs", [])]
        except Exception as e:
            libs = []
        if libs:
            cities = sorted({" ".join(l.get("address", "").split()[1:3]) for l in libs})
            lines.append(f"{sub}: {len(libs)}곳 {cities[:3]}")
open(f"{OUT}/d4l.txt", "w").write("\n".join(lines)); print("\n".join(lines))
