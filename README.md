# 책갈피 (Bookmark) — 나만의 독서 기록 웹서비스

> 스크립트 프로그래밍 중간과제 · 20241242 김진혁

책을 검색해 내 서재에 담고, 독서 상태·별점·한 줄 메모를 기록하고, 내 독서 현황을 한눈에 볼 수 있는 React 웹서비스입니다.

## 1. 서비스 소개

| 항목 | 내용 |
| --- | --- |
| 해결하는 문제 | 읽은 책·읽고 싶은 책이 메모장, 사진, SNS에 흩어져 있어 무엇을 읽었는지, 어떤 생각을 했는지 한곳에서 관리하기 어렵다 |
| 대상 사용자 | 독서 기록을 꾸준히 남기고 싶은 대학생·일반 사용자 |
| 사용자 가치 | 책을 검색해 바로 서재에 담고, 상태·별점·메모를 기록·수정하며, 독서 현황(권수·평균 별점)을 확인한다 |
| 데이터 | 책 정보는 Open Library API 또는 국립중앙도서관 API(검색 출처 선택), 내 서재는 브라우저 `localStorage`(새로고침해도 유지) |

## 2. 주요 기능

- **도서 검색 (외부 API)** — 입력 후 400ms 디바운스로 선택한 출처를 호출, 이전 요청은 `AbortController`로 취소. 로딩 / 결과 없음 / 네트워크 오류(다시 시도) 상태를 각각 표시. Enter는 즉시 검색, Esc는 입력 지우기.
- **검색 출처 선택** — **Open Library**(키 불필요, 해외 도서)와 **국립중앙도서관**(국내 출판 도서, 무료 인증키 필요)을 라디오로 전환. 인증키는 **접속자가 화면에서 본인 키를 직접 입력**하며(이 브라우저의 `localStorage`에만 저장, 언제든 삭제 가능) 소스코드·환경변수·빌드 결과에는 어떤 키도 들어 있지 않음. 키가 없으면 요청을 보내지 않고 입력 안내만 표시(Open Library는 그대로 동작). 국립중앙도서관은 제목으로 먼저 찾고, 결과가 10건 미만이면 저자 검색 결과로 채움(작가 이름만 입력해도 그 작가의 책이 나옴). 저자 표기(`저자 : A;역자 : B;` 등)는 역할 라벨을 떼고 저자만 표시. 새 출처는 `src/api/providers.js`에 항목 하나를 추가하면 붙음.
- **등록 (Create)** — 검색 결과에서 독서 상태(읽고 싶음·읽는 중·다 읽음)를 골라 "서재에 담기". 이미 담은 책은 "담김"으로 비활성화(중복 방지). 검색에 없는 책은 직접 입력해 등록(제목 필수, 출판연도 숫자 검증, 같은 제목 차단).
- **조회·검색 (Read)** — 상태 탭 필터, 제목·저자·메모 키워드 검색, 정렬(최근 등록순·제목순·별점순). 상단 통계(전체·상태별 권수, 평균 별점).
- **수정 (Update)** — 상세 모달에서 독서 상태, 별점(1~5), 한 줄 메모, 완독일 수정. 저장해야 반영되고 Esc·바깥 클릭·취소는 반영하지 않음.
- **삭제 (Delete)** — `confirm()` 대신 직접 만든 확인 다이얼로그 → 삭제 후 토스트의 "되돌리기"로 복구(별점·메모·등록일 보존).
- **랜딩 영역** — 검색 → 담기 → 기록 흐름을 커서가 보여 주는 히어로 애니메이션과 기능 소개 카드 3장, 서재가 비었을 때의 일러스트. 모바일 폭에서는 별도 컴팩트 디자인으로 바뀌고, 모션 줄이기 설정에서는 정지 화면으로 표시.
- **접근성·반응형** — 모달 포커스 이동·가두기·복원, 모든 기능 키보드 사용 가능, 358px(모바일)·768px(태블릿)·1280px(데스크톱) 대응, 터치 기기에서 조작 요소 44px 이상.

## 3. 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프레임워크 | React 19 + Vite 8 |
| 언어 | JavaScript (직접 작성한 코드는 모두 `.js` / `.jsx`) |
| 상태관리 | `useState` (App에서 서재·필터·모달·토스트 상태를 끌어올려 관리) |
| Hooks | `useEffect`(API 호출·localStorage 동기화·디바운스 타이머·포커스 이동·토스트 자동 닫힘), `useMemo`(필터·정렬·통계), `useRef`(포커스), `useCallback`, `useId`, 커스텀 훅 `useLocalStorage` · `useDebounce` · `useBookSearch` |
| 데이터 | Open Library API · 국립중앙도서관 ISBN 서지정보 API + `localStorage` |
| 스타일 | 순수 CSS (전역 디자인 토큰 + 컴포넌트별 CSS) |
| 디자인 | stageshow 스킬 (히어로·기능 카드·빈 상태 일러스트) |
| 린트 | ESLint 9 (`eslint-plugin-react`, `react-hooks`, `react-refresh`) |

## 4. 실행 방법

Node.js `^20.19.0` 또는 `>=22.12.0` 이 필요합니다(Vite 8 요구 사항).

```bash
npm install        # 의존성 설치
npm run dev        # 개발 서버 (http://localhost:5173)
npm run build      # 프로덕션 빌드 (dist/)
npm run preview    # 빌드 결과 미리보기
npm run lint       # ESLint 검사
```

> **ESLint 9로 고정한 이유:** 최신 ESLint 10은 `eslint-plugin-react`가 아직 지원하지 않아 설치가 충돌합니다.
> **인터넷 연결이 필요합니다:** 책 검색과 표지 이미지는 Open Library에서 가져옵니다.

## 5. 폴더 구조

```
bookmark/
├─ index.html
├─ package.json
├─ vite.config.js
├─ eslint.config.js
├─ README.md
├─ .env.example                   # 개발자용 환경변수 예시 (npm run check:nl 전용, 앱은 읽지 않음)
├─ scripts/check-nl-api.mjs       # 국립중앙도서관 API 연결 점검 (npm run check:nl)
├─ DEVLOG.md                      # 단계별 개발 기록 · 오류 해결 과정
├─ shots/                         # stageshow 검수(rehearse) 촬영 이미지
├─ .claude/skills/stageshow/      # stageshow 스킬 원본 (설치한 그대로)
└─ src/
   ├─ main.jsx
   ├─ App.jsx                     # 서재·필터·모달·토스트 상태 보유, 섹션 배치
   ├─ constants.js                # 독서 상태, 필터, 정렬 상수
   ├─ api/
   │  ├─ providers.js             # 검색 출처 레지스트리 (새 출처는 여기에 추가)
   │  ├─ openLibrary.js           # Open Library 검색 호출 + 응답 변환
   │  ├─ nationalLibrary.js       # 국립중앙도서관 검색 호출 + 응답 변환
   │  └─ ProviderError.js         # 출처가 돌려주는 오류(한국어 메시지 + 코드)
   ├─ hooks/
   │  ├─ useLocalStorage.js       # 상태 ↔ localStorage 동기화
   │  ├─ useDebounce.js           # 입력 디바운스
   │  └─ useBookSearch.js         # 검색어·디바운스·API 호출·요청 취소
   ├─ utils/                      # 도서 객체 생성, 필터·정렬·통계, 날짜
   ├─ components/
   │  ├─ layout/                  # Header, Footer
   │  ├─ hero/                    # 히어로 데모, 기능 카드, 빈 서재 일러스트 (stageshow)
   │  │  └─ REHEARSAL.md          # stageshow 검수 기록
   │  ├─ search/                  # SourcePicker(검색 출처 선택), SearchBar, SearchResults, BookCard
   │  ├─ library/                 # LibraryStats, LibraryFilter, LibraryList, LibraryItem, BookDetailModal
   │  ├─ forms/                   # ManualAddForm
   │  └─ common/                  # Modal, ConfirmDialog, Toast, StarRating, EmptyState, BookCover
   ├─ styles/                     # tokens(전역 토큰) + base / layout / search / forms / library / landing / touch
   └─ vendor/stageshow/           # 외부 라이브러리: stageshow kit (수정하지 않음)
```

데이터 모델: `{ id, title, authors, year, coverId, coverUrl, source, status, rating, memo, finishedAt, createdAt }`
(`coverUrl`은 국내 도서관 API의 표지 주소, `source`는 `openlibrary` · `nl` · `manual`)

## 6. 외부 API · 외부 라이브러리 출처

### 외부 API: Open Library
- 검색: `https://openlibrary.org/search.json?q={검색어}&limit=20&fields=key,title,author_name,first_publish_year,cover_i,number_of_pages_median`
- 표지: `https://covers.openlibrary.org/b/id/{cover_i}-M.jpg`
- API 키가 필요 없고 CORS를 허용합니다. 도서 데이터는 [Open Library](https://openlibrary.org)가 제공합니다.

### 외부 API: 국립중앙도서관 ISBN 서지정보 API
- 검색: `https://www.nl.go.kr/seoji/SearchApi.do?cert_key={인증키}&result_style=json&page_no=1&page_size=20&title={검색어}` (제목 결과가 10건 미만이면 `author={검색어}` 결과로 채워 최대 20건)
- 응답(실제 호출로 확인): `{ TOTAL_COUNT, PAGE_NO, docs: [ … ] }`. 항목 필드는 `TITLE`, `VOL`, `AUTHOR`, `EA_ISBN`, `PUBLISHER`, `PUBLISH_PREDATE`, `REAL_PUBLISH_DATE`, `PAGE`, `TITLE_URL`(표지) 등 40개. 오류는 `010`(키 누락)·`011`(유효하지 않은 키)·`012`·`013`·`000` 코드로 구분해 한국어 메시지로 안내합니다.
- 인증키는 [국립중앙도서관 Open API](https://www.nl.go.kr/NL/contents/N31101020000.do)에서 신청해 발급받습니다.
- **앱에서 쓰는 방법:** 화면의 "검색 출처 → 국립중앙도서관"을 고르고 발급받은 인증키를 붙여 넣어 "저장"합니다. 키는 이 브라우저에만 저장되고 국립중앙도서관 서버로만 전달되며(요청 주소의 `cert_key`), 공용 PC라면 사용 후 "키 삭제"를 누르세요. 앱은 서버나 환경변수에 키를 두지 않으므로 어디에 배포해도 키가 노출되지 않습니다.
- **개발자용 연결 점검:** `.env.example`을 복사해 `.env.local`을 만들고 `NL_CERT_KEY=발급받은키`를 채운 뒤 `npm run check:nl`(검색어를 바꾸려면 `npm run check:nl -- 해리포터`). 키 유효 여부, 응답의 JSON 구조, `page_size=20` 허용 여부, 앱 정규화 결과를 출력합니다(키 값은 출력하지 않음). 이 변수는 점검 스크립트만 읽으며, 이름에 `VITE_`를 붙이지 않았습니다(`VITE_` 값은 빌드 결과에 포함될 수 있음).
- **비밀값 관리:** `.env.local`은 `.gitignore`로 제외되어 저장소에 올라가지 않습니다. 실제 키가 `.env.local`에 있는 상태에서 `npm run build`를 해도 결과물에 키가 들어가지 않는 것을 직접 확인했습니다(앱이 환경변수를 읽지 않음).
- 응답은 JSON이며 `Access-Control-Allow-Origin: *`를 확인해 브라우저에서 직접 호출합니다. 도서 데이터는 [국립중앙도서관](https://www.nl.go.kr)이 제공합니다. 표시되는 연도는 `REAL_PUBLISH_DATE`(실제 발행일)가 있으면 그것을, 없으면 `PUBLISH_PREDATE`(출판예정일)의 연도입니다(둘 다 있는 항목은 항상 같은 해였습니다).

### 외부 라이브러리 (stageshow kit)
- **출처:** [benjitaylor/skills](https://github.com/benjitaylor/skills/tree/main/stageshow)의 `stageshow/` (설치 시점 커밋 `299140f`, 2026-11-04). MIT 라이선스, © 2026 Benji Taylor.
- **위치:** `src/vendor/stageshow/` (kit), `.claude/skills/stageshow/` (스킬 원본·예제·검수 스크립트).
- **JavaScript 예외:** kit은 TypeScript 소스(`.ts`/`.tsx`)이며 **수정하지 않고 외부 라이브러리로 그대로 두었습니다**(Vite가 변환). 직접 작성한 코드는 모두 JavaScript(`.jsx`)이고, kit에서 쓰는 부품만 `src/components/hero/kit.js`로 다시 내보내 사용합니다. kit은 ESLint 검사에서 제외합니다.
- **라이선스 고지:** `src/vendor/stageshow/LICENSE-stageshow.txt`, `NOTICE-stageshow.md`. kit 폴더에는 사용하지 않는 브랜드 로고 SVG(`brands/`)도 함께 들어 있지만 앱에서 불러오지 않아 빌드 결과에 포함되지 않습니다. 해당 상표는 각 소유자에게 있습니다.
- **디자인 적용 범위:** 히어로 데모·기능 카드·빈 서재 일러스트만 stageshow로 만든 "가짜(authored)" 화면입니다. 검색·서재·모달 등 실제 기능 UI는 직접 만든 React 컴포넌트이며, 같은 디자인 토큰(`stageLook.css`)으로 시각 언어를 맞췄습니다.
- **그 밖의 패키지:** `lucide-react`(kit이 쓰는 아이콘), 개발 도구는 `package.json` 참고.

## 7. 개발 기록

- [`DEVLOG.md`](DEVLOG.md) — 단계별 요청·산출물·오류 해결 과정(오류 현상 → 메시지 → 원인 → 수정 → 재실행 결과)
- [`src/components/hero/REHEARSAL.md`](src/components/hero/REHEARSAL.md) — stageshow 검수 기록(참고한 gold 예제, 바꾼 점, 확인하지 못한 점)

## 8. 알려진 한계

- 되돌리기는 마지막 삭제 1건만 지원합니다.
- 서재 데이터는 브라우저(`localStorage`)에만 저장되므로 기기·브라우저 간에 공유되지 않습니다.
- **국립중앙도서관 데이터의 특성:**
  - 한 번에 최대 20건만 보여 주고 전체 건수는 표시하지 않습니다(예: "어린 왕자" 제목 검색 전체 1,797건).
  - 표지는 전체의 약 18%(122건 중 22건)에만 있고, 없으면 제목 첫 글자의 대체 표지가 나옵니다.
  - 표지는 원본 크기(최대 약 1585×2291px, 400KB 안팎)로만 제공되고 서버가 느려서 하나가 2~13초 걸리기도 합니다. 화면 밖 이미지는 늦게 불러오지만 표지가 늦게 뜰 수 있습니다.
  - 저자 표기는 형식이 제각각(`저자 : A`, `A 지음, B 옮김`, `글: A ;그림: B` 등)이라 규칙으로 정리했으며 드물게 어색한 표기가 남을 수 있습니다.
- 도서관 정보나루(data4library) API는 공식 안내 페이지에 응답 필드 명세가 없어 넣지 않았습니다. 같은 방식(`providers.js`에 항목 추가)으로 붙일 수 있습니다.
- 인증키는 요청 주소(`cert_key`)에 실려 브라우저 개발자 도구의 네트워크 탭에서 본인에게 보이고, `localStorage`에 평문으로 저장됩니다. 키는 서버가 아니라 접속자 본인의 브라우저에만 있습니다.
- 글꼴(Pretendard, Noto)은 따로 불러오지 않고 기기에 설치된 글꼴을 쓰므로 기기마다 글자 모양이 다를 수 있습니다.
- 히어로 애니메이션의 모션 판정 일부는 검수 도구가 확정하지 못했습니다(자세한 내용은 REHEARSAL.md).
- 실제 스마트폰·태블릿 기기, Safari·Firefox, 어두운 테마는 확인하지 못했습니다.
