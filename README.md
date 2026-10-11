# 아이랑 수원 (suwon-edu-collector)

수원시 학부모를 위한 정보 모음 웹앱. 주소: https://suwon.songgollab.co.kr

공공 자료를 GitHub Actions로 자동 수집해 `docs/data/`에 저장하고, `docs/`의 웹앱(PWA)이 그 데이터를 보여 준다.

## 수집기

| 파일 | 내용 | 출처 | 필요한 키 | 주기 |
|---|---|---|---|---|
| collect.py | 수원 초·중·고 목록·학사일정 | 나이스 | NEIS_KEY | 하루 3번 |
| meals.py | 학교 급식 (1주) | 나이스 | NEIS_KEY | 매일 |
| academies.py | 학원·교습소 | 나이스 | NEIS_KEY | 매주 |
| kinder.py | 유치원 (장안·권선·팔달·영통) | 유치원 알리미 | KINDER_KEY | 매주 |
| libs.py | 수원시 공공도서관 운영시간·휴관일 | 도서관 정보나루 | LIB_KEY | 매주 |
| books.py | 초등·청소년·전체 인기 도서 (수원 4개 구 합산) | 도서관 정보나루 | LIB_KEY | 매일 |
| events.py | 수원 가족·어린이 공연·축제 | 문화체육관광부 문화예술공연 | CULTURE_KEY | 매일 |
| jobs.py | 학교·유치원·어린이집 채용 | 경기도교육청 · 경기육아종합지원센터 | 없음 | 매일 |
| elite.py | 전국 특목·자사고 | 나이스 | NEIS_KEY | 매달 |

수원시청·수원시도서관 홈페이지는 robots.txt로 자동 수집을 막아 두어서 읽지 않는다.
그래서 열람실 실시간 좌석과 도서관 강좌는 없고, 도서관 정보와 인기 도서는 도서관 정보나루 공식 API로 받는다.

## 처음 설정

1. GitHub에 `suwon-edu-collector` 저장소를 만들고 이 폴더 내용을 올린다.
2. Settings → Secrets and variables → Actions 에 키를 넣는다.
   - `NEIS_KEY`, `KINDER_KEY`, `CULTURE_KEY`: 용인 저장소와 같은 값
   - `LIB_KEY`: https://www.data4library.kr 회원가입 → 마이페이지 → 인증키 신청 (무료, 승인까지 하루쯤 걸릴 수 있음)
3. Actions 탭 → **first-run (처음 한 번 전체 수집)** → Run workflow
4. Settings → Pages → Branch `main` / 폴더 `/docs` → Save
   - Custom domain: `suwon.songgollab.co.kr` (docs/CNAME 에 이미 들어 있음) → **Enforce HTTPS** 체크
5. 가비아 DNS 설정에 레코드 추가: 타입 `CNAME`, 호스트 `suwon`, 값 `jinbok2279.github.io.`
6. 접속 통계: https://www.goatcounter.com 에서 `suwon-edu-app` 사이트를 만든다.

## 저장소 주소가 바뀌면

`docs/index.html` 의 `const REPO = "jinbok2279/suwon-edu-collector";` 한 줄만 바꾸면 된다 (데이터 예비 주소).
