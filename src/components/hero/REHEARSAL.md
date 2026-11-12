# Rehearsal: 책갈피 히어로 데모 (HeroDemo) + 기능 카드 still 3장 + 빈 서재 일러스트

촬영 기준일: 2026-11-10 / stageshow 스킬 v1.1.1 / Chrome(headless, `film.mjs`) / 개발 서버(`npm run dev`)
촬영 결과 이미지는 프로젝트 루트의 `shots/` 폴더에 있다.

## Gold
- **히어로 (`HeroDemo.jsx`)**: `examples/hero-demo` 를 기본 구조로 삼았다.
  - 유지한 것: 비트 구성(행동 → 결과가 손 아래에서 나타남), `data-target` + `rect()` 로 커서 타깃 지정, 마지막에 결과가 머무는 포스터, 컴팩트(358) 별도 디자인, 루프 끝에서 한 번에 되돌리기.
  - 바꾼 것: 대시보드/터미널 내용을 책갈피 앱(검색 → 담기 → 기록)으로 교체. 풀폭 히어로이므로 스테이지를 960×440으로 키우고 `framing.md` 의 "Pinned, bottom bleed"(창이 위·좌우로 한 칸 안쪽, 아래로 잘림) 배치를 사용. 가짜 어노테이션/터미널 위성은 없애고, 상세 모달(스크림 + 가운데 카드)을 앱에서 하던 대로 창 안에 앵커함.
- **기능 카드 3장 (`FeatureCards.jsx`)**: `examples/static-card` 의 구도(위·좌우 여백, 아래로 잘림, 실제 글자는 이야기에 필요한 곳에만, 나머지는 `Bar`)를 따랐다. 위성 카드는 두지 않았다(아래 Assumptions).
- **빈 서재 (`EmptyShelf.jsx`)**: static-card 의 크롭 규칙 + `Window chrome="hairline"`.
- 참고한 references: `framing.md`, `craft.md`, `motion.md`, `looks.md`, `verify.md`, `rehearse.md`, `kit.md`.

## Beats
1. 검색: 커서가 검색창으로 → 클릭 → "어린 왕자" 입력 → 결과 도착
2. 담기: "서재에 담기" 클릭 → 버튼이 같은 자리에서 "담김"으로 바뀌고 서재에 새 행이 위에서 열림
3. 기록: "상세·수정" 클릭 → 모달(상태 "다 읽음" → 별점 4 → 한 줄 메모 입력) → 저장
4. 결과(payoff): 모달이 닫히고 서재 행이 "다 읽음 · ★4 · 메모"로 바뀐 채 2초 머문다
5. 리셋: 앱의 실제 기능인 Esc(검색어 지우기)를 키캡으로 보여 주고(원인), 추가된 행은 한 번에 접힘. 루프 길이 약 16초.
- 포스터(모션 줄이기/썸네일에서 보이는 프레임) = 결과 장면. 모션을 걷어 낸 정지 화면이 이야기를 혼자 전달한다.

## Captured
- 폭: 960(데스크톱), 390(컴팩트 358 디자인)
- 루프 컨택트 시트(`hero-loop.png`, `hero-loop-390.png`), 상태 시트(`--states`, `hero-states.png`), 리셋 장면(`hero-reset.png`, `--at reset`)
- 모션 줄이기 포스터 2폭(`hero-poster.png`, `hero-poster-390.png`)
- 카드 3장 + 빈 서재 still(`card-1~3.png`, `empty.png`)
- 실제 앱 페이지 안에서의 모습: 358 / 390 / 768 / 1024 / 1280px에서 가로 넘침·터치 영역 측정, 4단계 CRUD 회귀 테스트(44항목) 통과, 콘솔 오류 0

## Gate (최종 상태에서 각각 실행한 마지막 줄)
```
히어로 루프 960  : rehearsal passed (necessary, not sufficient: ...)   film: inconclusive
히어로 루프 390  : rehearsal passed                                     film: inconclusive
히어로 --states  : rehearsal passed                                     film: inconclusive
포스터 960 / 390 : rehearsal passed                                     film: no-issues-detected
카드 1·2·3, 빈 서재: rehearsal passed
```
- **중요:** 루프 촬영은 모두 `film: inconclusive` 였다. 이 PC에서 headless Chrome이 프레임을 최대 약 200ms 간격으로 띄엄띄엄 기록해(샘플링 공백 70~110개), 그 구간의 모션은 도구가 판정하지 못했다. 프로덕션 빌드(`vite preview`)로 찍어도 같았다. 그래서 "gate 통과"는 "필수 항목 0건"이라는 뜻이고, 모션이 매끄럽다는 보증은 아니다. 모션은 컨택트 시트와 `--at reset` 프레임을 눈으로 확인한 범위에서만 판단했다.

## Film (gate 에서 걸린 줄과 처리)
| 줄 | 프레임/상황 | 처리 |
| --- | --- | --- |
| `kit override` 6건 (`.ss-phone*`) | 첫 촬영 | 원인은 우리 CSS가 아니라 검사기. kit를 `src/vendor/stageshow/`에 뒀는데 검사기는 `/kit/` 경로의 CSS만 kit로 인식해 kit 자신의 CSS를 "예제 CSS"로 오분류. 아래 "도구 수정" 참고 |
| `kit override: .ss-row` (프리뷰 빌드에서 재발) | `vite preview` 로 촬영 | 번들이 CSS를 한 파일로 합쳐 경로 판별이 불가능해서 생기는 현상. 이후 gate 는 개발 서버로만 판정. 그와 별개로 `.bm-lib .ss-row { align-items }` 는 실제로 kit 부품을 재스타일한 것이라 삭제함 |
| `framing:` 창이 한쪽에 치우침 | 첫 정지 화면 | 상세 카드를 위성으로 두려던 설계가 닫힌 상태에선 오른쪽 열을 비워 둠. 상세를 앱에서처럼 창 안 모달(스크림 + 가운데)로 바꾸고 창을 좌우 대칭으로 둠 |
| `framing:` 컴팩트 창이 326×424 (가로보다 세로가 긺) | 390 폭 | 컴팩트 스테이지를 358×340으로 낮추고 패널 제목·여분 행을 숨겨 보이는 창이 정사각형 이상(326×324)이 되게 재설계 |
| `framing:` 스크림이 스테이지 아래로 16px만 삐져나옴 | 390 폭 | 스크림을 충분히 아래까지 키움 |
| `framing:` 창이 아래로 20px만 잘림 | 빈 서재 | 창 높이를 200으로 키워 분명한 잘림으로 |
| `tight control:` "저장"이 뒤 행 가장자리와 2px | 모달 열린 프레임 | 모달을 아래로 10px 이동 |
| `unsized text:` 메모 글자 16px | 카드 2 | `.bm-memo` 를 공통 룩(stageLook.css)으로 옮겨 11px 지정 |
| `covers:` 커서가 "상세·수정" 글자 위 | 5.6초 | 모든 버튼 클릭을 `x:0.88, y:0.7` 로 겨냥해 글자를 피함 |
| `clipped:` "어린 왕자" 1px | 정지 화면 | `--ss-row-line` 을 20px, `.bm-book` 줄 높이를 20px로 |
| `lands on a transform` (`.bm-results`) | 루프 | `will-change: transform` 부여 |
| 필수 아님: `jump`/`settle snap` `ss-field__chars` 12px·3.6px | 검색창/메모 입력의 글자가 한 자 들어갈 때 | kit `Field` 내부 노드의 폭이 글자 하나만큼 늘어나는 정상 입력. 내부 노드라 `data-snap` 을 붙일 수 없어 그대로 둠 |
| 필수 아님: `jump: ss-roll__item "서재에 담기" y -2.1px`, `handoff shift` 0.3px | 4.3초, 버튼 라벨 교체 | kit `Button`(내부에서 `Roll` 사용)의 라벨 교체. 직접 만든 버튼으로 바꾸면 규칙 위반이라 그대로 둠 |
| 필수 아님: `steps in its box` (`ss-window__url`, `ss-field__box`) | 컴팩트 | 스테이지가 wide→compact 레이아웃으로 바뀔 때 요소가 레이아웃으로 이동. 이후 재촬영에서는 gate 줄에 나오지 않음 |
| 필수 아님: `clipped: near aligned` (url 글자와 "어린 왕자" 4.2px 차이), `clipped: ss-window__url-text` 1px | 카드 2, 빈 서재 | 브라우저 주소창 글자와 본문 글자의 정렬 비교라 의도된 구조. hairline 크롬의 주소 글자 1px는 kit 내부 |
| `manual: layout checks deferred` | 루프 | 움직이는 중의 버튼 지오메트리라 판정 보류. 정지 상태(포스터)에서는 통과 |

## 도구 수정 (kit 가 아니라 검사 스크립트)
- `.claude/skills/stageshow/scripts/film-checks.mjs` 의 kit 스타일시트 판별 정규식에 `\/vendor\/stageshow\/` 를 추가했다(한 줄). 이유는 위 표의 `kit override` 참고. `src/vendor/stageshow/` 의 kit 파일 155개는 원본과 해시가 모두 동일함을 복사 직후 확인했고, 수정하지 않았다.
- `lucide-react@0.468.0` 설치(kit 의 `Icon` 과 모달 셀렉트 화살표). 촬영용 `playwright-core`, `postcss` 는 프로젝트 `package.json` 이 아니라 스킬 폴더(`.claude/skills/stageshow/node_modules`) 안에만 설치했다.

## Review
- `references/review.md` 기준의 별도 "fresh-eye" 리뷰는 하지 않았다. 대신 `verify.md` 의 Framing → Hierarchy → Motion 순서로 직접 프레임을 보며 점검했다.

## Assumptions
- 기능 카드에는 위성 카드를 두지 않았다. 웹앱 한 화면을 보여 주는 3장이 한 줄로 놓이는 구성이라, 위성은 `twin satellites` 위험과 작은 카드 폭(360) 때문에 오히려 복잡해진다고 판단했다.
- 표지는 이미지를 불러오지 않고 책등 있는 단색 블록으로 그렸다. 데모가 외부 서비스를 호출하지 않아야 하고(looks.md), 실제 앱의 "표지 없음" 대체 표지와 같은 계열이기 때문이다. 책 제목 "어린 왕자"는 예시일 뿐 실제 데이터가 아니다.
- 별은 Lucide가 아니라 앱의 `StarRating` 과 같은 경로를 그대로 써서 실제 화면과 모양을 맞췄다.

## Unresolved
- 모션 판정이 `inconclusive` (위 Gate 참고). 다른 PC/브라우저에서 `film.mjs --gate` 를 다시 돌려 확인하면 좋다.
- 서재가 비었을 때 오프닝 프레임의 왼쪽 열 아래에 빈 면이 남는다(창이 아래로 잘리는 구도에서 결과가 오기 전의 상태). gate 는 통과하지만 위계상 가장 약한 프레임이다.

## Not checked
- 어두운 테마(`--dark`), 다른 룩 (라이트 한 가지만 만들었다)
- 실제 스마트폰/태블릿, Safari·Firefox. 라이브 환경에서의 프레임 속도(rAF 타임스탬프 기록)
- 재생 중 일시정지·재개·화면 밖으로 나갔다 돌아오기·모션 줄이기 설정을 재생 중 토글하는 경우
- 4배 확대로 손으로 그린 요소(표지 블록, 별) 점검, `npm run typecheck`(kit 은 TypeScript이고 우리 프로젝트는 JS라 타입 검사를 하지 않음), `scripts/layout.mjs`(호스트 컨트롤 검사), `class-clash.mjs`
- Pretendard·Noto 글꼴은 별도로 불러오지 않아 기기에 설치된 글꼴로 대체되므로 글자 모양이 기기마다 다를 수 있다
