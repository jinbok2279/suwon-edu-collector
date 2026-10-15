"""성남판 준비용 점검 3: 강좌 목록 스크립트 읽기"""
import os, re, urllib.request
OUT = "probe/out"; os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/128 Mobile Safari/537.36 (airang-seongnam probe)"}
def get(url):
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
            return r.read().decode("utf-8", "replace")
    except Exception as e:
        return repr(e)
B = "https://spo.isdc.co.kr"
open(f"{OUT}/courseRegist2.js", "w").write(get(B + "/js/onlineRequest/courseRegist2.js"))
open(f"{OUT}/common.js", "w").write(get(B + "/js/common.js"))
for p in ["tan", "sns", "spo", "pgs", "ggp", "hsu", "hsw", "hwang"]:
    open(f"{OUT}/{p}_programGuide.html", "w").write(get(f"{B}/{p}_programGuide.do")[:300000])
