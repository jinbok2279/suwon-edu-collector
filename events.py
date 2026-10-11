"""아이와 함께 갈 만한 수원 행사 수집기

문화체육관광부 문화예술공연(통합) API(CULTURE_KEY)에서
수원에서 열리는 공연·전시·축제 중 가족·어린이에게 맞는 것만 골라 output/events.json 으로 저장한다.

수원시청·수원시도서관 홈페이지는 자동 수집을 막아 두어(robots.txt) 읽지 않는다.
도서관 어린이 프로그램(lib)은 공식 API가 생기면 채울 수 있도록 빈 목록으로 둔다.
"""

import hashlib
import json
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9))
CULTURE_API = "https://api.kcisa.kr/openapi/CNV_060/request"  # 문화체육관광부_문화예술공연(통합)
CULTURE_KEY = os.environ.get("CULTURE_KEY", "").strip()
# 수원 안의 주요 공연장·전시장·명소 이름 (주소에 '수원'이 빠진 행사도 잡기 위해)
SUWON = re.compile(r"수원|경기아트센터|경기도문화의전당|SK아트리움|에스케이아트리움|화성행궁|수원화성|팔달문|장안문|연무대|"
                   r"광교호수|광교박물관|만석공원|수원올레드|수원종합운동장|수원월드컵|KT\s*위즈|kt\s*wiz|"
                   r"수원시립미술관|아트스페이스광교|해우재|수원박물관|수원광교박물관|수원화성박물관|수원시립합창단|"
                   r"장안구|권선구|팔달구|영통구|광교|영통|매탄|호매실|행궁동|인계동", re.I)
NOT_SUWON = re.compile(r"화성시|오산|용인|성남|안양|의왕|군포")  # '화성행궁'과 화성시를 구분하기 위해

KID_WORDS = re.compile(r"가족|어린이|아이|키즈|kids|유아|아동|동화|인형|마술|매직|체험|그림책|놀이|과학|축제|페스티벌|야시장|버블|뮤지컬|캐릭터|만들기|숲|생태|방학|드림|피노키오|공주|동물|공룡|로봇", re.I)
NOT_KID = re.compile(r"19세|청소년\s*관람\s*불가|성인|어르신|트로트|콘서트\s*<|스탠드업|stand-up|장애인|합창단\s*정기", re.I)


def get(url, tries=3, timeout=60):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (suwon-edu-collector)"})
    for i in range(tries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as res:
                return res.read().decode("utf-8", errors="replace")
        except Exception as e:
            print(f"  다시 시도 {i + 1}/{tries}: {e}")
            time.sleep(4)
    raise RuntimeError("접속 실패")


def strip_html(s):
    s = re.sub(r"<[^>]+>", " ", s or "")
    s = s.replace("&nbsp;", " ").replace("&lt;", "<").replace("&gt;", ">").replace("&amp;", "&").replace("&quot;", '"')
    return " ".join(s.split())


def is_suwon(title, site, contact, desc):
    where = " ".join([site, contact])
    if SUWON.search(where) and not (NOT_SUWON.search(where) and "수원" not in where):
        return True
    if not site and ("수원" in title or "수원" in desc[:300]):
        return True
    return bool(re.search(r"수원", title)) and not NOT_SUWON.search(site)


def culture_events(today):
    if not CULTURE_KEY:
        print("  CULTURE_KEY 없음: 문화포털 공연 건너뜀")
        return []
    horizon = (today + timedelta(days=60)).strftime("%Y%m%d")
    t0 = today.strftime("%Y%m%d")
    key = CULTURE_KEY if "%" in CULTURE_KEY else urllib.parse.quote(CULTURE_KEY, safe="")
    out, seen, rows = [], set(), 1000
    for page in range(1, 41):
        url = f"{CULTURE_API}?serviceKey={key}&numOfRows={rows}&pageNo={page}&dtype=&title="
        try:
            raw = get(url)
        except Exception as e:
            print("  문화포털 실패:", e); break
        try:
            root = ET.fromstring(raw.encode("utf-8"))
        except Exception:
            print("  문화포털 응답이 XML이 아님:", raw[:200].replace(CULTURE_KEY, "***")); break
        items = root.findall(".//item")
        if page == 1:
            print(f"  문화포털 결과코드 {(root.findtext('.//resultCode') or '-').strip()} · 전체 {root.findtext('.//totalCount')}건")
        if not items:
            break
        for it in items:
            g = lambda k: " ".join((it.findtext(k) or "").split())
            ds = re.findall(r"(\d{8})", g("period"))
            if not ds:
                continue
            start, end = ds[0], ds[-1]
            if end < t0 or start > horizon:
                continue
            title, site, desc, contact = g("title"), g("eventSite"), strip_html(it.findtext("description")), g("contactPoint")
            if not is_suwon(title, site, contact, desc):
                continue
            hay = title + " " + desc[:600] + " " + g("charge")
            kid = bool(KID_WORDS.search(title)) or bool(re.search(r"전체\s*관람|어린이|가족|아동|유아|\d+\s*개월|초등", hay))
            if not kid or NOT_KID.search(title) or re.search(r"19세 이상|청소년\s*관람\s*불가", hay):
                continue
            if (title, start) in seen:
                continue
            seen.add((title, start))
            charge = g("charge")
            out.append({"id": "C" + hashlib.md5((title + start).encode()).hexdigest()[:10], "title": title,
                        "start": f"{start[:4]}-{start[4:6]}-{start[6:]}", "end": f"{end[:4]}-{end[4:6]}-{end[6:]}",
                        "place": site, "time": g("eventPeriod")[:60], "grade": "", "price": charge[:40],
                        "free": bool(re.search(r"무료", charge)), "src": "culture",
                        "link": g("url") or "https://search.naver.com/search.naver?query=" + urllib.parse.quote(title),
                        "img": g("imageObject")})
        if len(items) < rows:
            break
    print(f"  수원 가족 행사 {len(out)}건")
    return out


def main():
    today = datetime.now(KST).date()
    city = []
    try:
        city = culture_events(today)
    except Exception as e:
        print("문화포털 공연 실패:", e)
    old = {}
    if os.path.exists("output/events.json"):
        try:
            old = json.load(open("output/events.json", encoding="utf-8"))
        except Exception:
            old = {}
    if not city and old.get("city"):
        city = [e for e in old["city"] if e.get("end", "") >= today.isoformat()]
    city.sort(key=lambda e: (e["start"], e["title"]))
    os.makedirs("output", exist_ok=True)
    result = {"updated_at": datetime.now(KST).strftime("%Y-%m-%d %H:%M:%S"),
              "source": "문화체육관광부 문화예술공연 정보", "city": city, "lib": []}
    with open("output/events.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=1)
    print(f"수원 가족 행사 {len(city)}건 저장")
    for e in city[:8]:
        print("  ", e["start"], e["title"], "|", e["place"], "|", e["price"])


if __name__ == "__main__":
    main()
