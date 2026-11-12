# DEVLOG — 책갈피 (Bookmark)

## 1단계. 설계
- **요청:** 프롬프트 파일 기반으로 컴포넌트 트리, state 위치, 데이터 모델 정리
- **산출:** 대화 중 설계안 제시 (파일 변경 없음)
- **확정 사항:** 데이터 모델 `{ id, title, authors, year, coverId, status, rating, memo, finishedAt, createdAt }`, 중복 판별은 `id`(Open Library key) 기준, 프로젝트는 `bookmark/` 하위 폴더

## 2단계. 기본 구조
- **요청:** Vite + React(JavaScript) 프로젝트 생성, 폴더 구조, 레이아웃, 전역 CSS 토큰, `npm run dev` 확인
- **생성·수정한 파일:**
  - `index.html` (lang=ko, 제목/설명 메타)
  - `public/favicon.svg` (책갈피 모양으로 교체)
  - `src/main.jsx`, `src/App.jsx` (레이아웃 골격)
  - `src/components/layout/Header.jsx`, `Footer.jsx`
  - `src/styles/tokens.css`, `base.css`, `layout.css`
  - 빈 폴더: `api`, `hooks`, `components/{hero,search,library,forms,common}`, `vendor/stageshow`
  - 삭제: Vite 템플릿 기본 파일 (`App.css`, `index.css`, `assets/`, `icons.svg`)
- **확인 결과:** `npm run build` 성공, `npm run lint` 종료 코드 0, dev 서버 기동 후 `/` 와 `/src/App.jsx` 모두 HTTP 200
- **메모:**
  - 최신 `create-vite` 템플릿은 React 19, Vite 8을 설치하고 린터로 **ESLint가 아닌 oxlint**를 사용한다. 프롬프트의 "ESLint 통과"는 이 oxlint 통과로 대신한다.
  - 이 단계에서 발생한 오류는 없음.
  - 실제 브라우저에서의 시각 확인과 콘솔 오류 확인은 아직 하지 못함 (서버 응답만 확인). → 3단계에서 Chrome 자동 조작으로 확인함.

## 2-1단계. ESLint로 전환 (사용자 요청)
- **요청:** 린터를 ESLint로 사용
- **조치:** `oxlint`와 `.oxlintrc.json` 제거, `eslint.config.js`(flat config) 추가, `package.json`의 `lint`를 `eslint .`로 변경, JS만 쓰므로 `@types/react*`도 제거
- **ESLint 설정:** `@eslint/js` recommended + `eslint-plugin-react` + `react-hooks` + `react-refresh`. `src/vendor`(외부 라이브러리 stageshow kit)는 검사 제외
- **오류 1:** ESLint 설치 실패
  - 오류 메시지: `ERESOLVE could not resolve ... Found: eslint@10.14.0 ... Conflicting peer dependency: eslint@9.39.5 ... peer eslint@"^3 || ... || ^9.7" from eslint-plugin-react@7.37.5`
  - 원인: npm이 최신 ESLint 10을 설치하려 했으나 `eslint-plugin-react`가 ESLint 10을 아직 지원하지 않음
  - 수정: `eslint@9`, `@eslint/js@9`로 버전 고정해 설치
  - 재실행: 설치 성공, `npm run lint` 종료 코드 0

## 3단계. 검색 기능
- **요청:** API 모듈 + `useDebounce` + `useBookSearch` + 검색 UI, 실제 검색 동작 확인
- **생성·수정한 파일:**
  - `src/api/openLibrary.js` (검색 호출, 응답을 앱 도서 형태로 변환, 표지 URL)
  - `src/hooks/useDebounce.js`, `useBookSearch.js`, `useLocalStorage.js`(서재 등록 연결에 필요해 앞당겨 작성)
  - `src/components/search/SearchBar.jsx`, `SearchResults.jsx`, `BookCard.jsx`
  - `src/components/common/BookCover.jsx` (표지 없음/로딩 실패 시 대체 표지)
  - `src/constants.js`, `src/styles/search.css`, `src/App.jsx`, `src/main.jsx`
- **설계 메모:** `useBookSearch`의 `status`는 별도 state가 아니라 "응답에 저장한 requestId와 현재 요청 비교"로 파생한다. effect 안에서 동기적으로 `setState`를 호출하지 않기 위한 구조이며, 다시 시도(`retry`)도 같은 requestId 방식으로 처리한다.
- **오류 2:** 재시도 로직 (작성 중 자체 발견)
  - 현상: 첫 구현은 `retryKey` state를 만들었지만 effect 의존성에 넣지 않아 "다시 시도"를 눌러도 요청이 재실행되지 않는 구조였음
  - 원인: 같은 검색어면 `debouncedQuery`가 변하지 않아 effect가 다시 실행되지 않음
  - 수정: `retryCount`를 effect 의존성과 requestId에 포함하도록 재작성
  - 재실행 결과: 브라우저 테스트에서 오류 후 "다시 시도" 클릭 시 20건 정상 로드
- **확인 결과 (Chrome 자동 조작 + API 직접 호출):**
  - 초기 검색창 포커스, 입력 직후 API 호출 0회 → 디바운스 후 1회, 결과 20건
  - 담기 → 버튼이 "담김"(비활성), 새로고침 후에도 서재 1권 유지
  - Esc로 입력 지우기, Enter 즉시 검색, 빈 결과 문구, 요청 차단 시 오류 문구와 다시 시도
  - 표지 정상 로드, 표지 없는 책은 대체 표지
  - 358px에서 가로 넘침 0px
  - `npm run lint` 통과, `npm run build` 성공
- **참고:** 테스트 중 콘솔의 `net::ERR_FAILED` 1건은 오류 상태를 확인하려고 일부러 요청을 차단해서 생긴 것이며, 앱 오류가 아님
- **아직 못한 것:** 태블릿(768px) 확인과 전체 반응형 점검은 5단계에서 진행

## 4단계. CRUD
- **요청:** 서재 등록 / 목록·필터·서재 내 검색·정렬 / 상세 모달 수정 / 삭제·되돌리기 / localStorage 유지, 각 기능 수동 테스트
- **생성·수정한 파일:**
  - 유틸: `src/utils/library.js`(도서 객체 생성, 필터·정렬, 통계), `src/utils/date.js`
  - 공통 컴포넌트: `Modal.jsx`, `ConfirmDialog.jsx`, `Toast.jsx`, `StarRating.jsx`, `EmptyState.jsx`
  - 서재: `LibraryStats.jsx`(useMemo 통계), `LibraryFilter.jsx`, `LibraryList.jsx`, `LibraryItem.jsx`, `BookDetailModal.jsx`
  - 폼: `ManualAddForm.jsx` (제목 필수, 출판연도 숫자 검증, 중복 제목 차단)
  - `src/App.jsx`(상태·핸들러), `src/constants.js`, `src/hooks/useLocalStorage.js`(저장값 검증 추가), `src/styles/forms.css`, `library.css`
- **설계 메모:**
  - 서재(`library`)와 모달·토스트 상태는 검색 카드·목록·통계가 함께 쓰므로 App에 둠(state lifting)
  - 상세 모달은 입력 중 값을 `draft`로 따로 들고 있다가 "저장" 때만 반영(취소·Esc 시 미반영)
  - 삭제는 직접 만든 `ConfirmDialog`(처음 포커스는 "취소") → 삭제 후 토스트 "되돌리기", 삭제한 객체 전체를 복구해 별점·메모·등록일 유지
  - 모달은 Esc/바깥 클릭 닫기, 열릴 때 포커스 이동, Tab 포커스 가두기, 닫힐 때 포커스 복원. 모달 위에 확인창이 겹쳐도 Esc는 맨 위 창만 닫음
  - 되돌리기는 마지막 삭제 1건만 지원(토스트가 하나이므로)
- **오류 1 (테스트 스크립트 문제):** 서재 검색어를 지우지 못함
  - 현상: 별점순 정렬 확인 실패, 이어서 삭제 버튼을 찾지 못해 테스트 중단
  - 메시지: `Error: No element found for selector: button[aria-label="혼자 공부하는 자바스크립트 삭제"]`
  - 원인 분석: 앱 버그가 아니라 테스트 문제. 디버깅으로 확인해 보니 `type=search` 입력창에서 Puppeteer 트리플클릭이 텍스트를 선택하지 못해(선택 범위 5~5) Backspace가 한 글자만 지웠고, 서재 필터가 `rowling`으로 남아 책이 숨겨져 있었음
  - 수정: 지우기 동작을 Ctrl+A + Backspace로 교체
- **오류 2 (테스트 스크립트 문제):** `Error: Node is detached from document`
  - 원인: 삭제 후 되돌리기로 목록이 다시 그려져, 테스트가 미리 쥐고 있던 버튼 요소가 DOM에서 사라짐
  - 수정: 클릭할 때마다 요소를 새로 조회하도록 변경
- **재실행 결과 (Chrome 자동 조작):** 44개 항목 전부 통과, 콘솔 오류·경고 없음
  - 직접 등록 검증(제목 필수, 연도, 중복), 검색 결과 담기, 통계·평균 별점 반영, 완독일 자동 입력
  - 모달 수정/취소, Esc·바깥 클릭 닫기, 포커스 이동·복원
  - 상태 탭, 제목/저자/메모 서재 검색, 정렬 3종, 필터 초기화
  - 삭제 확인, Esc로 삭제 취소, 삭제, 되돌리기(데이터 보존), localStorage 반영, 새로고침 유지, 깨진 저장값 방어
  - 1280/768/358px에서 가로 넘침 0px
- **개선:** 358px에서 잘리던 서재 검색창 placeholder를 "제목·저자·메모 검색"으로 단축
- **아직 못한 것:** 모바일·태블릿 세부 레이아웃 다듬기는 5단계, 서재 비었을 때 일러스트는 6단계(stageshow still)에서 진행

## 5단계. 반응형
- **요청:** 모바일·태블릿·데스크톱 레이아웃 정리 (358 / 768 / 1280px에서 깨지지 않을 것)
- **기준 폭:** 모바일 ≤600px, 태블릿 601~1023px, 데스크톱 ≥1024px (서재 목록 2열 전환만 768px)
- **점검 방법:** 서재에 긴 제목·긴 메모·표지 없는 책을 넣고 358/390/768/1024/1280px에서 가로 넘침, 터치 영역 크기, 열 개수를 측정하고 전체 화면을 촬영. 모바일 폭은 터치 에뮬레이션(`pointer: coarse`)으로 확인
- **발견한 문제와 수정:**
  1. 모바일 통계 2열 그리드에서 5번째 칸(평균 별점)이 혼자 떨어짐 → 마지막 칸을 가로 전체로 펼침, 태블릿 이상은 5열
  2. 모바일 상태 탭이 가로 스크롤이라 "다 읽음"이 잘림 → 줄바꿈으로 변경해 항상 모두 표시
  3. 태블릿(768px)에서 서재 목록이 1열이라 카드가 지나치게 넓음 → 768px부터 2열
  4. 서재 카드 버튼 높이 34px → 38px, 터치 기기에서는 44px
  5. 모바일에서 검색 결과 20건이 약 6700px로 너무 김 → 모바일 표지를 60×90px로 줄이고 카드 여백 축소(약 5700px)
- **오류 (CSS 적용 순서):** 터치 기기에서 44px 규칙이 적용되지 않음
  - 오류 현상: 터치 에뮬레이션(`coarse: true`)인데도 입력창·셀렉트 40px, 탭 36px로 측정됨
  - 원인 분석: `@media (pointer: coarse)` 규칙을 `base.css`에 넣었는데, 나중에 불러오는 `forms.css`·`library.css`의 같은 선택자(`min-height: 40px` 등)가 같은 우선순위로 덮어씀
  - 수정 내용: 터치 규칙을 `src/styles/touch.css`로 분리하고 `main.jsx`에서 가장 마지막에 불러옴
  - 재실행 결과: 모든 폭에서 크기 미달 요소 0개
- **확인 결과:**
  - 358/390/768/1024/1280px 모두 가로 넘침 0px, 열 수: 검색 결과 1/1/2/3/3, 서재 1/1/2/2/2, 통계 2/2/5/5/5
  - 긴 제목(공백 없는 영문 70자)이 카드를 넘치지 않고 줄바꿈됨
  - 모달은 358×700 화면에도 들어가고(위아래 22px 여백), 화면이 더 낮으면 배경이 스크롤됨
  - 4단계 CRUD 회귀 테스트 44/44 통과, 콘솔 오류·경고 없음, `npm run lint` 통과, `npm run build` 성공
- **확인하지 못한 것:** 실제 스마트폰·태블릿 기기에서의 확인(데스크톱 Chrome 에뮬레이션만 사용), 가로 방향 모바일 화면, 브라우저 글꼴 크기를 키운 경우. Pretendard·Noto 폰트는 설치되어 있지 않으면 시스템 글꼴로 대체되므로 기기마다 글자 모양이 다를 수 있음. 히어로 영역은 6단계에서 추가하며 그때 반응형을 다시 확인
## 6단계. stageshow 디자인
- **요청:** stageshow 스킬 설치 → 히어로 데모 → 기능 카드·빈 상태 → 전체 UI 톤 통일 → rehearse 검수
- **참고한 gold 예제 / references:**
  - gold: `hero-demo`(히어로 구조), `static-card`(still 카드), 배치 참고 `linear`(Wide hero)
  - references: `SKILL.md`, `framing.md`, `craft.md`, `motion.md`, `looks.md`, `verify.md`, `rehearse.md`, `kit.md`
- **생성·수정한 파일:**
  - 스킬: `.claude/skills/stageshow/`(저장소 `benjitaylor/skills` 의 `stageshow/` 를 복사). 촬영 도구용 `playwright-core`, `postcss` 는 이 폴더 안에만 설치
  - kit: `src/vendor/stageshow/`(kit 155개 파일, 원본과 해시 동일, 수정 없음) + 쓰는 부품만 다시 내보내는 `src/components/hero/kit.js`
  - 히어로: `Hero.jsx`, `HeroDemo.jsx`, `hero.css`, `stageLook.css`(앱 토큰 → `--ss-*` 매핑), `parts.jsx`(Cover, Stars)
  - 카드/빈 상태: `FeatureCards.jsx`, `EmptyShelf.jsx`, `cards.css`
  - 연결: `App.jsx`(Hero, FeatureCards), `LibraryList.jsx`(빈 서재 일러스트), `src/styles/landing.css`, `main.jsx`
  - 기록: `src/components/hero/REHEARSAL.md`, 촬영 이미지 `shots/`
  - 의존성: `lucide-react@0.468.0`
- **오류 1: 검사기가 kit 의 CSS를 우리 CSS로 오인**
  - 현상: 첫 정지 화면 촬영에서 `kit override` 6건 (`.ss-phone[data-frame="android"] .ss-phone__island ...`)
  - 메시지: `kit override: .ss-phone__screen is restyled by the example's own CSS (position, size or spacing); a kit part's geometry is the kit's.`
  - 원인 분석: 우리 화면에는 폰이 없고 제 CSS에도 phone 규칙이 없음. `film-checks.mjs` 가 스타일시트 경로에 `/kit/` 가 들어 있으면 kit 것으로 보는데, 프롬프트 지시대로 kit 를 `src/vendor/stageshow/` 에 두어 kit 자신의 CSS가 "예제 CSS"로 분류됨
  - 수정 내용: 검사 스크립트의 경로 정규식에 `\/vendor\/stageshow\/` 한 줄 추가. kit 파일은 건드리지 않음
  - 재실행 결과: 6건 모두 사라지고 정지 화면 gate 통과
- **오류 2: `solid` 옵션 때문에 모달이 항상 보임**
  - 현상: 컨택트 시트의 0.0초 프레임부터 상세 모달이 떠 있고 끝까지 사라지지 않음
  - 원인 분석: 모달이 등장하는 중 반투명해 뒤가 비치는 것이 마음에 들지 않아 `Collapse` 에 `solid` 를 줬는데, `solid` 는 "내용이 처음부터 있다"는 전제라 닫힌 상태에서도 그대로 그려짐(kit 주석에 명시)
  - 수정 내용: `solid` 제거(등장 중 잠깐의 반투명은 그대로 둠)
  - 재실행 결과: 모달이 저장 비트에서만 열리고 닫힘
- **오류 3: 컴팩트 창 비율 (gate 실패)**
  - 현상/메시지: `framing: div.ss-window shows 326x424, narrower than tall for a desktop window`
  - 원인 분석: 규칙 12 "잘린 창은 보이는 부분이 최소 정사각형". 첫 컴팩트 설계는 두 패널을 세로로 쌓아 창이 세로로 길었음
  - 수정 내용: 컴팩트 스테이지를 358×340으로 낮추고, 패널 제목과 여분 행을 숨기고 메모 레이블을 placeholder 로 대신해 보이는 창을 326×324로 만듦. 이어서 `bm-scrim runs only 16px past the bottom` 도 스크림을 키워 해결
  - 재실행 결과: 390 폭 gate 통과
- **오류 4: 프로덕션 프리뷰에서 kit override 재발**
  - 현상: `vite preview` 로 찍자 `.ss-kb__key`, `.ss-stamp`, `.ss-avatar` 등 쓰지도 않은 부품이 `kit override` 로 보고됨
  - 원인 분석: 빌드가 CSS를 한 파일로 합쳐 스타일시트 경로로 kit 를 구분할 수 없음. 샘플링 공백은 프리뷰에서도 같아 개발 서버 대신 프리뷰를 쓸 이유가 없었음
  - 수정 내용: 이후 gate 는 개발 서버로만 판정. 이때 `.bm-lib .ss-row { align-items }` 는 실제로 kit 부품을 재스타일한 것이라 함께 삭제
- **그 밖에 gate 로 잡아 고친 것:** 모달 버튼과 뒤 행의 2px 근접(`tight control`), 메모 글자 크기 미지정(`unsized text`), 버튼 라벨 위 커서(`covers`), 창이 20px만 잘림(`framing`), 결과 컨테이너 글자 흔들림(`lands on a transform`)
- **페이지 통합 중 발견해 고친 것:** 히어로 제목이 "책/을"처럼 단어 중간에서 끊김 → `word-break: keep-all`; `<a class="btn">` 글자가 파란 링크색 → `.btn` 에 글자색 지정
- **번들 정리:** kit `index.ts` 를 통째로 가져오면 쓰지 않는 브랜드 SVG까지 들어가 JS 404KB, CSS 98KB → 개별 파일만 가져오는 `kit.js` 로 JS 317KB, CSS 59KB로 감소
- **확인 결과:**
  - `film.mjs --gate`: 히어로 루프(960/390), `--states`, 포스터(960/390), 카드 3장, 빈 서재 모두 `rehearsal passed`
  - 단, 루프 촬영은 샘플링 공백 때문에 `film: inconclusive`(모션 일부 미판정). 자세한 내용은 REHEARSAL.md
  - 4단계 CRUD 회귀 테스트 44/44 통과, 358~1280px 가로 넘침 0px, 터치 영역 미달 0, 콘솔 오류·경고 0
  - `npm run lint` 통과
- **확인하지 못한 것:** 어두운 테마, 실제 기기, 재생 중 일시정지·재개, 별도 fresh-eye 리뷰(review.md). REHEARSAL.md 의 Not checked 참고

## 7단계. 최종 점검
- **요청:** `npm run build` 성공, 콘솔 오류·경고 0개, ESLint 통과, 완료 기준 전부 확인, README 작성
- **생성·수정한 파일:** `README.md`(Vite 기본 템플릿 → 서비스 소개·기능·기술 스택·실행 방법·폴더 구조·출처), `src/components/search/SearchBar.jsx`(자동 포커스 수정), `src/vendor/stageshow/LICENSE-stageshow.txt`, `NOTICE-stageshow.md`(MIT 고지)
- **오류 1: 페이지가 열리자마자 히어로를 지나쳐 스크롤됨**
  - 오류 현상: 첫 화면에서 히어로 데모가 보이지 않음. 측정하니 열자마자 `scrollY`가 1280px 폭에서 1068, 358px 폭에서 1782였고 모바일에서는 키보드도 바로 뜨는 구조였음
  - 오류 메시지: 없음(콘솔 오류 없이 동작만 잘못됨). 5·6단계의 폭별 점검, CRUD 회귀 테스트, 콘솔 감시는 모두 통과해서 놓쳤고, 첫 화면 위치를 따로 측정하다 발견
  - 원인 분석: 3단계에서 넣은 `SearchBar`의 "마운트 시 `focus()`"는 브라우저가 입력창을 보이게 스크롤함. 그때는 검색창이 맨 위였지만 6단계에서 히어로와 기능 카드가 위에 들어가면서 검색창이 1000px 넘게 아래로 밀림
  - 수정 내용: 마운트 자동 포커스를 없애고 "검색으로 이동할 때만" 포커스. 링크(`#search`)로 이동하면 `hashchange`에서 `focus({ preventScroll: true })`, 주소에 `#search`를 붙여 처음부터 열면 직접 스크롤하며 포커스
  - 재실행 결과: 첫 화면 `scrollY` 0(두 폭 모두), "책 검색하기" 클릭 시 검색창으로 이동하며 포커스, "내 서재" 링크는 포커스 없이 이동, `/#search` 직접 열기는 검색창으로 스크롤+포커스. CRUD 회귀 44/44 통과, 콘솔 오류 0
  - 참고: 3단계 기록의 "초기 검색창 포커스" 동작은 이 수정으로 바뀜
- **재현성 검증:** `node_modules`, `dist`, `.claude`, `shots`를 뺀 깨끗한 복사본에서 `npm install`(취약점 0) → `npm run lint`(종료 코드 0) → `npm run build`(성공) → `npm run dev` 순으로 실행해 확인. 이 복사본의 개발 서버에서 아래 테스트를 수행하고, 이후 `src`가 실제 프로젝트와 동일함을 파일 해시로 대조
- **완료 기준 확인:**

| 기준 | 결과 | 근거 |
| --- | --- | --- |
| `npm install && npm run dev` 실행, `npm run build` 성공 | 통과 | 깨끗한 복사본에서 실행 |
| Open Library 검색, 로딩·빈 결과·오류 표시 | 통과 | 3단계 브라우저 테스트(디바운스 1회 호출, 로딩, 빈 결과, 요청 차단 시 오류와 다시 시도, 표지·대체 표지) |
| 등록·수정·삭제·서재 내 검색, 새로고침 후 유지 | 통과 | CRUD 회귀 44/44 (깨진 저장값 방어 포함) |
| useState, useEffect, useMemo, useRef, 커스텀 훅 사용 | 통과 | 자체 코드에서 `useState` 16, `useEffect` 6, `useMemo` 4, `useRef` 4회, 커스텀 훅 3개 |
| 358 / 768 / 1280px 레이아웃 | 통과 | 5개 폭에서 가로 넘침 0, 터치 영역 미달 0 |
| stageshow 히어로·still 카드, REHEARSAL.md | 통과 | `film.mjs --gate` 전부 `rehearsal passed` (단 루프의 모션은 `inconclusive`, REHEARSAL.md 참고) |
| README (소개·기능·스택·실행·구조·출처) | 통과 | README.md |
| DEVLOG (단계별 기록·오류 해결) | 통과 | 1~7단계 + 2-1단계 |
| 콘솔 오류·경고 0, ESLint 통과 | 통과 | 일반/모바일 터치/모션 줄이기 3가지 조건으로 히어로가 한 바퀴 이상 도는 22초씩 감시해 0건, `npm run lint` 종료 코드 0 |
| TypeScript 사용 금지(kit 예외) | 통과 | `src`의 `.ts/.tsx`는 `vendor/stageshow`뿐 |

- **확인하지 못한 것(제출 전 알아 둘 점):** 실제 스마트폰·태블릿 기기, Safari·Firefox, 어두운 테마, 히어로 모션의 완전한 판정(검수 도구가 `inconclusive`), `review.md` 기준의 별도 fresh-eye 리뷰. `.claude/` 폴더는 약 98MB(촬영용 `node_modules` 포함)이며 지워도 앱 동작에는 영향이 없음

## 8단계. 국내 도서관 API 추가 (검색 출처 선택)
- **요청:** 국내 도서관 API를 활용해 Open Library 말고도 다른 API를 쓸 수 있게 기능 추가
- **조사(구현 전 확인):** 직접 호출과 공식 가이드로 두 후보를 확인
  - 국립중앙도서관 ISBN 서지정보 API(`nl.go.kr/seoji/SearchApi.do`): JSON 응답, `Access-Control-Allow-Origin: *`, 인증키 `cert_key` 필요. 요청 변수와 응답 필드(`TITLE`, `AUTHOR`, `EA_ISBN`, `PUBLISHER`, `PUBLISH_PREDATE`, `TITLE_URL`, `PAGE`)와 오류 코드(010/011/012/013/000)는 공식 가이드에서 확인. 키 없이 호출하면 `{"RESULT":"ERROR","ERR_CODE":"011",...}`
  - 도서관 정보나루(`data4library.kr/api/srchBooks`): JSON·CORS는 확인(`{"response":{"errCode":"authErr"...}}`)했으나 안내 페이지에 응답 필드 명세가 없어 필드를 추측해야 함
  - **결정:** 필드가 문서로 확인된 국립중앙도서관을 구현하고, 다른 출처를 쉽게 더할 수 있는 구조로 만듦. 정보나루는 추측으로 만들지 않고 제외
  - **키 처리 결정:** 둘 다 CORS가 열려 있어 프록시 없이 브라우저에서 직접 호출. 키는 소스/환경변수가 아니라 **사용자가 화면에서 입력해 localStorage에 저장**(빌드 결과에 키가 남지 않음)
- **생성·수정한 파일:**
  - `src/api/providers.js`(출처 레지스트리), `nationalLibrary.js`(호출 + 응답 정규화), `ProviderError.js`, `openLibrary.js`(함수명 `searchOpenLibrary`, `source`·`coverUrl` 추가)
  - `src/hooks/useBookSearch.js`(출처·키를 받아 요청 식별자에 포함, `needsKey` 상태 추가)
  - `src/components/search/SourcePicker.jsx`(출처 라디오 + 인증키 폼), `SearchResults.jsx`(출처 이름·`needsKey` 안내), `BookCard.jsx`
  - `src/components/common/BookCover.jsx`(`coverUrl` 지원), `LibraryItem.jsx`, `BookDetailModal.jsx`
  - `src/utils/library.js`(`coverUrl`, `source` 저장), `src/App.jsx`(출처·키 상태, 저장/삭제), `Footer.jsx`, `src/styles/search.css`, `touch.css`, `base.css`, README
- **설계 메모:**
  - 검색어·출처·키·재시도 횟수를 하나의 요청 식별자로 묶어, 출처를 바꾸면 이전 출처의 결과가 남지 않고 로딩부터 시작
  - 키는 "저장"을 눌러야 반영(한 글자마다 검색이 다시 실행되지 않게), 키가 없으면 요청 자체를 보내지 않고 안내만 표시
  - 국립중앙도서관은 제목으로 먼저 찾고 결과가 없으면 저자로 재검색. 연도는 출판예정일(`PUBLISH_PREDATE`)이라 "초판" 표기를 붙이지 않음
- **오류 1: 응답 오류 메시지 대체값이 동작하지 않을 뻔함 (작성 중 발견)**
  - 현상: `clean(ERR_MESSAGE) ?? '기본 문구'` 로 썼는데 `clean`은 빈 문자열을 돌려주므로 `??`가 기본 문구로 넘어가지 못함
  - 수정: `clean(...) || '기본 문구'` 로 변경 (단위 테스트의 알 수 없는 오류 코드 케이스로 확인)
- **오류 2: 처음 작성한 훅이 ESLint 규칙을 끄는 방식이었음 (작성 중 정정)**
  - 현상: `makeRequestId` 함수를 effect 안에서 쓰면서 `eslint-disable react-hooks/exhaustive-deps` 로 경고를 덮음
  - 수정: 요청 식별자를 effect 안에서 직접 만들고 의존성을 `[provider, apiKey, debouncedQuery, retryCount, needsKey]` 로 정직하게 선언, 규칙 비활성화 제거
- **오류 3/4 (테스트 스크립트 문제, 앱 버그 아님):**
  - "제목 → 저자 순서로 2회 요청" 실패(요청 0건): 입력 직후 400ms 디바운스 동안은 이전 결과가 보이는 게 정상인데, 테스트가 이전 카드를 보고 바로 요청 수를 셈 → 충분히 기다리도록 수정하고 "디바운스 중에는 요청하지 않음" 검사를 추가
  - 출처 전환 후 `.book-card` 대기 시간 초과: 질의가 한글 저자명이라 Open Library 결과가 0건 → 영문 질의로 변경
- **발견해 함께 고친 것:** 헤더 링크(`#search`, `#library`)로 이동하면 섹션 제목이 고정 헤더에 가려짐(`searchTop` 0) → `.section[id] { scroll-margin-top: 72px }`. 이동 후 `searchTop`이 72로 측정됨
- **확인 결과:**
  - `nationalLibrary.js` 단위 테스트(문서 필드명 기반 샘플): 정상 2건, 중복·제목 없음 제외, 권차 결합, 저자 분리, 연도 추출, 쪽수·표지 URL 처리, 배열 키 변형, 빈 결과, 오류 코드 5종의 AUTH 구분 → 통과
  - 브라우저 E2E 44항목 통과, 콘솔 오류·경고 0: 출처 라디오/방향키 전환, 키 없음 안내(요청 0건), **실제 서버**로 가짜 키 → 인증 오류를 한국어로 표시(요청 파라미터 `cert_key`/`result_style=json`/`page_no=1`/`page_size=20`/`title` 확인), 모의 성공 응답 → 결과·표지·담기·서재 저장(`source: "nl"`, `coverUrl`), 제목 결과 없을 때 저자 재검색, 출처 전환 시 이전 결과 제거, 새로고침 후 출처·키 유지, 키 삭제, 깨진 저장값 방어, 358px 가로 넘침·터치 44px
  - 빌드 결과와 `src`에서 테스트 키 문자열 검색 → 없음. 4·5단계 회귀(CRUD 44/44, 폭별 점검, 콘솔 감시 3조건) 통과
  - `npm run lint` 통과, `npm run build` 성공
- **확인하지 못한 것(중요):**
  - **국립중앙도서관의 성공 응답을 실제 키로 받아 보지 못함.** 목록 배열의 키 이름이 문서에 없어 방어적으로 파싱했고, 검증은 문서의 필드명으로 만든 모의 응답으로만 함. `page_size=20`이 허용 범위인지(오류 `013`)도 미확인
  - 정보나루(data4library)는 구현하지 않음
  - E2E의 항목 하나("빌드 소스에는 키가 없음")는 의미 없는 `true` 단정이어서 증거로 세지 않고, 대신 빌드 결과를 직접 검색해 확인함

## 9단계. 인증키 입력 UI 제거 → 환경변수 방식으로 전환 (키를 받으면 바로 작업 가능한 상태까지)
- **요청:** 웹페이지의 인증키 입력 항목은 제거하고, 사용자가 나중에 API 키를 알려 주면 즉시 작업할 수 있는 상태까지만 준비
- **방향:** 키는 화면이 아니라 `.env.local`의 `VITE_NL_CERT_KEY`로 받는다. 키가 없으면 국립중앙도서관 출처는 "사용할 수 없음"으로 안내하고 Open Library만 동작한다. 키를 받으면 `.env.local`에 넣고 `npm run check:nl`로 실제 응답을 확인한 뒤 파서를 맞추면 된다
- **제거한 것:** `SourcePicker`의 인증키 폼(`KeyForm`), App의 `apiKeys` 상태와 저장/삭제 핸들러·토스트, `useBookSearch`의 `apiKey` 인자·`errorCode`, 키 폼 CSS
- **추가·수정한 파일:**
  - `src/api/providers.js`(환경변수에서 키를 읽고 `available` 계산), `src/hooks/useBookSearch.js`(`needsKey` → `unavailable` 상태), `SourcePicker.jsx`(출처 라디오 + 사용 불가 안내), `SearchResults.jsx`, `App.jsx`, `search.css`
  - `.env.example`(키 설정 예시), `.gitignore`(`.env`, `.env.*` 제외, 예시 파일만 허용), `scripts/check-nl-api.mjs` + `package.json`의 `check:nl`
  - `nationalLibrary.js`의 인증 오류 문구를 `.env.local` 설정 안내로 변경, README
- **`check:nl` 스크립트가 확인하는 것:** ① 키 유효 여부(010/011) ② 성공 응답의 최상위 키·목록 배열 키 이름·항목 필드 ③ `page_size=20` 허용 여부(013) ④ 앱 정규화 함수가 실제 응답을 읽는지 ⑤ CORS 헤더. 키 값은 출력하지 않고 길이만 표시. 지금까지 구조를 확인하지 못한 부분(②, ③)을 키를 받는 즉시 한 번에 확인하려는 용도
- **확인 결과:**
  - 스크립트 자체: 키 없음 → 설정 방법 안내(종료 코드 1), 가짜 키 → 실제 서버의 `011`을 해석해 출력, `.env.local`(따옴표 포함) 읽기 확인 후 테스트 파일 삭제
  - 앱 E2E, 키 없는 상태 15/15: 키 입력창 0개, 출처 선택 시 안내, 국립중앙도서관으로 요청 0건, Open Library 정상, 새로고침 후 선택 유지
  - 앱 E2E, 환경변수 키가 있는 상태 18/18(모의 성공 응답 + 실제 서버의 `011`): 안내 없음, 모든 요청에 `cert_key`/`result_style=json`/`page_no=1`/`page_size=20`, 출처 전환 시 기존 검색어로 즉시 재검색, 표지·서재 저장(`source:"nl"`), 제목 결과 없으면 저자 재검색, `localStorage`에 키가 저장되지 않음, 오류 문구에 `VITE_NL_CERT_KEY` 안내
  - 회귀: CRUD 44/44, 358~1280px 점검, 콘솔 감시 3조건 0건, 헤더 링크 이동 정상. `npm run lint` 통과, `npm run build` 성공
  - **빌드와 키의 관계를 직접 확인:** 키가 있는 환경에서 빌드하면 `dist` 안에 키 문자열이 **들어간다**(`VITE_` 값은 번들에 포함). 키가 없는 환경에서 다시 빌드한 최종 `dist`에는 없음. 8단계의 "키가 빌드 결과에 들어가지 않는다"는 화면 입력 방식에서만 맞는 설명이었고 환경변수 방식에서는 다름 → README 주의 문구에 반영
- **작성 중 실수:**
  - 테스트 스크립트의 타이밍 문제 2건(앱 버그 아님): 출처를 바꾸면 입력창의 기존 검색어로 즉시 재검색되어 이전 검색어의 오류 화면이 먼저 떠 있는데, 테스트가 새 검색어의 디바운스(400ms)를 기다리지 않고 확인함 → 입력 후 충분히 대기하도록 수정
  - 점검용 스크린샷 스크립트의 경로 백슬래시가 도구 호출 과정에서 합쳐져 브라우저를 찾지 못함 → 슬래시 경로로 수정
- **현재 상태:** `.env.local` 없음(키 미설정), `dist`는 키 없이 빌드한 상태. 국립중앙도서관 검색은 "사용할 수 없음"으로 표시되고, 키를 `.env.local`에 넣고 개발 서버를 다시 시작하면 켜진다
- **확인하지 못한 것:** 실제 인증키로 받은 성공 응답(JSON 구조, `page_size` 제한). 정보나루 API는 계속 미구현

## 10단계. 실제 인증키 적용 · 실제 데이터로 검증 · 파서 보정
- **요청:** 사용자가 국립중앙도서관 API 키를 전달 → 즉시 작업
- **조치:** 키를 `.env.local`(`.gitignore` 대상)에 저장. 키 값은 README·DEVLOG·소스 어디에도 쓰지 않았고, 점검 스크립트도 길이만 출력
- **`npm run check:nl` 결과(실제 서버):** HTTP 200, CORS `*`, 최상위 `{ TOTAL_COUNT, PAGE_NO, docs: 배열(20개) }`, `page_size=20` 허용, 앱 정규화가 실제 응답을 읽음 → 8·9단계에서 "확인하지 못함"으로 남겼던 두 가지(성공 응답 구조, `page_size` 제한)가 모두 해소됨. 목록 배열 키는 추측한 `docs`와 일치
- **실제 데이터 122건(7개 검색어) 분석으로 발견·보정한 것:**
  - 저자 표기가 제각각: `저자 : A` / `원작자 : A;역자 : B;` / `글: A ;그림: B` / `A 지음, B 옮김` / `A 원작/B 엮음/C 그림` / 빈 값 / 깨진 `\b` → 역할 라벨을 떼고 주 저작자(저자·글·원작 등)만 표시, 주 저작자가 없으면 전체 사용 (`parseAuthors`)
  - 연도: `REAL_PUBLISH_DATE`가 있으면 그것을 우선(둘 다 있는 항목은 항상 같은 해, 미래 날짜 없음)
  - 쪽수 `156 p.` / `약 95페이지 내외` / `[20] p.` → 첫 숫자 추출. 제목 앞뒤 공백 9건 정리
  - 표지 URL의 일부(7/22)가 `http://` → `nl.go.kr`은 `https://`로 승격(https로 같은 이미지가 열리는 것을 확인), 표지는 22/122건에만 존재
  - **검색 전략 결함:** "제목 결과가 0건일 때만 저자로 재검색"은 가정이 틀렸음. 작가 이름은 일부 제목에도 들어 있어 "조앤 K. 롤링"(제목 5건/저자 24건), "알랭 드 보통"(7/94)은 소수의 부분 일치만 보이고 저자 결과가 가려짐 → **제목 결과가 10건 미만이면 저자 검색으로 채움(최대 20건)**. "어린 왕자"처럼 제목 결과가 충분하면 저자 요청을 보내지 않음(저자 검색은 "어린왕자 편집부" 같은 엉뚱한 일치가 나옴)
  - 대체 표지에 제목 첫 글자가 기호일 때 `(`, `<`가 찍힘 → 첫 글자·숫자를 골라 사용
  - 표지 이미지가 원본 크기(최대 1585×2291px)이고 서버가 느림(402KB가 2.7~13초) → 구조적으로 줄일 방법은 없어 `decoding="async"`만 추가하고 README에 한계로 기록
- **확인 결과:**
  - 단위 테스트: 실제 데이터에서 뽑은 저자 표기 16종, 정규화(중복·제목 없음·권차·연도·쪽수·표지), 오류 코드 5종 통과
  - 실제 응답 262건(9개 검색어 × 제목/저자)에 불변식 적용: 제목 공백 없음, id 중복 없음, 저자에 `:`·역할어 없음, `nl.go.kr` 표지는 모두 https, 연도 범위, 쪽수는 정수 → 통과
  - **모의 응답 없는 브라우저 E2E 26/26 통과**(실제 서버·실제 키): 안내 없음/입력창 없음, 실제 검색 19건, 서버 200·`page_size=20`·`json`, 저자·제목 표시 정리, 표지 4개 실제 로드·나머지 대체 표지, 서재 저장(`source:"nl"`, `coverUrl`)과 서재 표지, 키가 `localStorage`에 없음, 윤인성(제목 0건 → 저자 검색), 조앤 K. 롤링(제목 5건 → 20건으로 채움), 어린 왕자(저자 요청 없음), Open Library 전환·복귀, 영문 검색어, 새로고침 후 출처 유지, 358px 가로 넘침 없음·터치 44px, 콘솔 오류 0
  - 회귀: CRUD 44/44, 358~1280px 점검, 콘솔 감시 3조건 0건, 헤더 링크 이동 정상. `npm run lint` 통과
- **작성 중 실수 (기록):**
  1. 린트 에러: 도구 호출이 `\u00a0` 이스케이프를 실제 NBSP 문자로 바꿔 저장 → 어차피 `\s`와 `trim()`이 NBSP를 처리하므로 그 줄을 삭제
  2. **셸(sed)로 그 줄을 고치다 백슬래시가 사라져 의도한 `/\\b/g`(데이터에 글자 그대로 섞인 `\b` 제거)가 `/\b/g`(단어 경계)로, `/\s+/g`(공백 묶음)가 `/s+/g`(글자 s 연속)로 바뀜.** 린트는 통과했지만 동작이 틀어진 코드였고, 단위 테스트를 돌리기 전에 파일을 다시 읽어 발견해 Edit 도구로 바로잡음. 이후 정규식이 든 편집은 Edit 도구로만 수행
  3. 테스트 스크립트 문제 3건(앱 버그 아님): `loading="lazy"` 이미지는 화면 밖이면 불러오지 않아 측정이 0으로 나옴 → 즉시 로드로 바꿔 측정(브라우저에서 `no-referrer` 포함 직접 로드해 핫링크 방지가 없음을 확인), `isMobile` 뷰포트 변경은 페이지를 새로고침해 상태가 사라짐 → 다시 검색하도록 수정, 점검용 스크립트의 경로 백슬래시가 합쳐져 브라우저를 못 찾음 → 슬래시 경로로 수정
- **8단계 기록 정정:** 8단계의 "성공 응답은 확인하지 못함"과 "제목 → 저자 순서로 재검색"은 이 단계에서 실제 키로 확인·보정됨. 8·9단계 E2E(모의 응답 18/18 등)는 그 시점의 설계를 검증한 것이고, 현재 전략의 근거는 이 단계의 실제 데이터 검증임
- **확인하지 못한 것:** 정보나루 API(미구현), 인증키 호출 한도(문서에 없음), 모바일 실기기, 표지 서버가 더 느릴 때의 체감(로드 전까지 회색 자리만 보임)

## 11단계. 인증키를 접속자가 직접 입력하는 방식으로 변경 (Git 공개용)
- **요청:** "키를 넣어서 배포해줘. 다만 키를 공개시키지 않게 git 시켜줘" → 배포 계정을 묻는 질문에 대한 답: **Git에 올라가는 버전은 접속자가 본인의 국립중앙도서관 API 키를 직접 입력해 쓰는 방식으로 수정, 내 키는 Git에 올리지 않기**
- **배경(왜 환경변수 방식을 버렸나):** 9~10단계의 `VITE_` 환경변수 방식은 키를 넣고 빌드·배포하면 키가 사이트의 JS에 박혀 방문자가 볼 수 있다(10단계에서 직접 확인). "키를 넣어 배포"와 "키를 공개하지 않기"를 함께 만족하려면 서버 쪽 프록시가 필요한데, 사용자가 접속자 입력 방식으로 방향을 정함. 이 방식이면 어떤 정적 호스팅에 올려도 비밀이 필요 없다
- **변경:**
  - 앱에서 환경변수 키 지원을 **완전히 제거**(`providers.js`는 `import.meta.env`를 쓰지 않음). 키는 화면 입력 → `localStorage`(`bookmark.apiKeys`)에만 존재
  - 8단계의 키 입력 UI(`SourcePicker`의 `KeyForm`, App의 `apiKeys` 상태·저장/삭제, `needsKey` 상태, `useBookSearch(providerId, apiKey)`)를 되살리되, 10단계에서 실제 데이터로 고친 내용(저자 파싱, 제목 10건 미만이면 저자 검색으로 채움, 표지 https 등)은 그대로 유지
  - 입력 안내에 "이 브라우저에만 저장, 공용 PC면 키 삭제" 문구 추가. 인증 오류 문구는 환경변수 안내 → "입력한 키를 다시 확인"으로 복원
  - 점검 스크립트 `scripts/check-nl-api.mjs`는 개발자용으로만 유지하고 읽는 변수를 `VITE_NL_CERT_KEY` → `NL_CERT_KEY`로 변경(`VITE_` 접두어는 번들 대상이라는 오해를 줄이려는 것). `.env.example`도 같은 이름으로 갱신. 로컬 `.env.local`의 변수명도 같이 바꿈(값은 그대로, 출력·기록하지 않음)
  - README·`.env.example`에 새 방식 반영
- **확인 결과:**
  - **빌드 결과에 키 없음(핵심 보증):** `.env.local`에 실제 키가 있는 상태에서 `vite build` → 결과물 4개 파일 전체에서 실제 키 문자열도 `NL_CERT_KEY` 변수명도 발견되지 않음. 10단계에서는 같은 조건에서 키가 `dist`에 들어갔음
  - 모의 응답 + 가짜 키(실제 서버의 `011`) 키 입력 흐름 E2E 44/44(키 폼 표시, 입력 중 요청 없음, 저장·삭제 토스트, 새로고침 후 유지, 깨진 저장값 방어, 방향키 전환, 358px)
  - **실제 키를 화면에서 입력하는 실서버 E2E 26/26**: 키 없을 때 안내·입력창·요청 0건, 키 저장 후 자동 검색, 실제 결과 19건, 표지 로드, 서재 저장, 윤인성(제목 0건 → 저자), 조앤 K. 롤링(제목 5건 → 20건), 어린 왕자(저자 요청 없음), 출처 전환, 새로고침 후 유지, 358px, 콘솔 0. 키는 `localStorage`의 `bookmark.apiKeys`에만 저장됨을 확인
  - 회귀: CRUD 44/44, 358~1280px, 콘솔 감시 3조건 0건, 헤더·히어로 링크 이동. `npm run lint` 통과
- **작성 중 점검:** e2e8의 저자 표시 기대값이 10단계 이전 동작(`지음`을 남김)이라 1건 실패 → 앱이 아니라 낡은 테스트 기대값이라 현재 동작(저자만 표시)으로 수정. 실서버 E2E에서 402KB 표지 1개가 40초 안에 로드되지 않은 것은 표지 서버의 알려진 지연이며 실패로 세지 않고 기록
- **배포는 하지 않음:** 사용자가 배포 계정(Vercel `freenews760-7017` 로그인 상태 / jinhyeok0415 / 다른 플랫폼)을 정하지 않고 Git 방식 변경만 지시함. 이 방식은 비밀이 필요 없어 어느 정적 호스팅에도 올릴 수 있음
- **Git:** 실제 키는 `.env.local`에만 있고 저장소에 올리지 않음(`.gitignore`). 커밋 전 스테이징 내용에서 키 문자열 검사

## 12단계. 로컬·GitHub 모두 접속자 입력 방식으로 정리 (Vercel 배포 안 함)
- **요청:** Vercel로는 배포하지 않는다. 로컬 파일과 GitHub에 올린 파일 둘 다 접속자가 본인의 국립중앙도서관 API 키를 입력해야 사용할 수 있는 구조여야 한다
- **현황 점검(둘 다 같은 코드인지):** 작업 트리 변경 0개, 로컬 HEAD와 원격 `origin/main` 동일. 11단계의 입력 방식 코드가 로컬·GitHub에 똑같이 있음. Vercel 배포는 하지 않았고 프로젝트에도 `.vercel`·`vercel.json`·의존성이 없음(제가 한 것은 계정 확인용 `npx vercel whoami` 한 번뿐이며 로그인·프로젝트 생성·배포는 하지 않음)
- **로컬에만 남아 있던 문제 2건:**
  1. **오래된 `dist/`:** 앱이 환경변수 방식이던 시기에 빌드한 결과라 키 입력칸 없이 "아직 인증키가 설정되지 않아 사용할 수 없어요"만 나오는 화면이었음(번들에서 옛 문구 1개 확인, 입력 문구 0개) → 현재 코드로 다시 빌드. 새 `dist`는 입력 문구 1개, 옛 문구 0개
  2. **`.env.local`의 실제 키:** 앱은 읽지 않지만 폴더를 압축·공유하면 키가 따라 나감 → 값을 메모리에만 담아 두고 파일을 삭제. 키는 NL 사이트에서 다시 확인 가능
- **키가 로컬 폴더 어디에도 없음을 확인:** `dist`, `node_modules`, `.claude`, `shots`(바이너리 포함)까지 프로젝트 폴더 전체를 검색해 0건. 같은 방식으로 존재하는 문자열(`NL_CERT_KEY`)은 검색되는 것을 확인(양성 대조). Git 쪽은 11단계에서 새 클론으로 최신 파일·전체 이력·커밋 메시지를 검색해 0건 확인
- **로컬 프로덕션 빌드의 동작 검증(`vite preview`로 새 `dist` 제공):** 키 입력 흐름 E2E 44/44를 연속 2회 통과. 키 없음 → 입력 안내만 있고 국립중앙도서관 요청 0건, 입력 중에는 요청 없음, 가짜 키 → 실제 서버의 `011`을 한국어로 표시, 요청에 입력한 키가 `cert_key`로 실림, 새로고침 후 출처·키 유지, 삭제 후 다시 안내, 콘솔 0
  - 첫 실행에서 "키 저장 토스트" 1건 실패: 토스트는 6초 뒤 자동으로 닫히는데 테스트는 실제 서버 응답을 기다린 뒤에 확인하는 순서라 서버가 느리면 이미 닫힘. 서버 응답을 4초 지연시킨 결정적 검사에서 "저장 0.3초 후 표시, 6.8초 후 닫힘"을 확인해 앱 문제가 아님을 확인. 테스트 스크립트의 확인 순서 자체는 고치지 않았고 재실행 2회 모두 통과
- **문서 정리:** README의 "비밀값 관리"에 로컬 폴더와 GitHub 저장소가 같은 코드이고 둘 다 키가 없으며 배포 서버에도 비밀값이 필요 없다고 명시. 개발자용 점검 스크립트는 파일 없이 일회성 환경변수(`$env:NL_CERT_KEY=...`)를 권장하도록 안내·`.env.example` 주석 변경
- **11단계 기록 정정:** 11단계의 "배포는 하지 않음" 항목이 "배포 계정을 정하지 않아서"였는데, 사용자가 Vercel 배포를 하지 않기로 결정함
- **한계:** 이 변경으로 로컬에서 실제 키로 다시 테스트하려면 키를 화면에 직접 입력해야 함(점검 스크립트는 일회성 환경변수로 가능)
