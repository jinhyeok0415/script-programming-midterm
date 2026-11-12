import { ChevronDown } from 'lucide-react'
import { Badge, Bar, Button, Card, Collapse, Field, Roll, Row, Stage, Text, Window } from './kit.js'
import { Cover, Stars } from './parts.jsx'
import './stageLook.css'
import './hero.css'

// 랜딩 히어로: "책 검색 → 서재에 담기 → 별점·메모 기록" 흐름을 커서가 보여주는 stageshow 애니메이션.
// 실제 앱 화면을 단순화한 가짜(authored) 화면이며, 진짜 기능은 src/components 의 React 컴포넌트가 담당한다.
// 구조는 stageshow의 gold 예제 hero-demo(비트 5개 + 이름 붙은 타깃 + 마지막에 유지되는 결과)를 따르고,
// 풀폭 히어로 배치(Wide hero)와 컴팩트(358px) 디자인을 따로 둔다.

const BOOK = '어린 왕자'
const AUTHOR = '앙투안 드 생텍쥐페리'
const QUERY = '어린 왕자'
const MEMO = '다시 읽고 싶은 책'
const STATUS_LABEL = { want: '읽고 싶음', done: '다 읽음' }

const initial = {
  typing: false, // 검색창 포커스
  query: '',
  results: false, // 검색 결과 표시
  added: false, // 서재에 담김
  detail: false, // 상세 카드 열림
  status: 'want', // 상세 카드의 독서 상태 선택
  cardRating: 0, // 상세 카드의 별점
  memo: '',
  memoFocus: false,
  rowStatus: 'want', // 서재 행에 반영된 값
  rowRating: 0,
  saved: false, // 저장 후 메모 줄이 열림
}

// 결과가 화면에 남는 장면 = 포스터(모션 줄이기/썸네일에서 보이는 유일한 프레임)
const POSTER = {
  ...initial,
  query: QUERY,
  results: true,
  added: true,
  status: 'done',
  rowStatus: 'done',
  rowRating: 4,
  saved: true,
}

const REST = { wide: { x: 330, y: 392 }, compact: { x: 250, y: 197 } }

async function script(a) {
  const compact = a.layout === 'compact'
  await a.wait(500)

  // 1. 검색: 창을 클릭하고 "어린 왕자"를 입력하면 결과가 뜬다
  a.mark('search')
  await a.move('search')
  await a.wait(250)
  await a.click()
  await a.set({ typing: true })
  await a.wait(300)
  await a.type('query', QUERY, { interval: 90 })
  await a.wait(400)
  await a.set({ results: true })
  await a.wait(700)

  // 2. 담기: 버튼이 "담김"으로 바뀌고 서재에 새 행이 열린다
  a.mark('add')
  await a.move({ at: 'add', x: 0.88, y: 0.7 })
  await a.wait(300)
  await a.click()
  await a.set({ typing: false, added: true })
  await a.wait(800)

  // 3. 기록: 상세·수정 → 상태, 별점, 한 줄 메모 → 저장
  a.mark('edit')
  await a.move({ at: 'edit', x: 0.88, y: 0.7 })
  await a.wait(300)
  await a.click()
  await a.set({ detail: true })
  await a.wait(600)

  await a.move({ at: 'status', x: 0.9, y: 0.6 })
  await a.wait(200)
  await a.click()
  await a.set({ status: 'done' })
  await a.wait(350)

  await a.move('star-4')
  await a.wait(150)
  await a.click()
  for (const n of [1, 2, 3, 4]) {
    await a.set({ cardRating: n })
    await a.wait(70)
  }
  await a.wait(200)

  await a.move({ at: 'memo', x: 0.9, y: 0.6 })
  await a.wait(200)
  await a.click()
  await a.set({ memoFocus: true })
  await a.type('memo', MEMO, { interval: 70 })
  await a.wait(200)

  a.mark('save')
  await a.move({ at: 'save', x: 0.88, y: 0.7 })
  await a.wait(250)
  await a.click()
  await a.set({ detail: false, memoFocus: false })
  await a.wait(450)

  // 4. 결과: 서재 행이 "다 읽음 · 별점 4 · 메모"로 바뀌고 잠시 머문다
  a.mark('result')
  await a.set({ rowStatus: 'done', saved: true })
  for (const n of [1, 2, 3, 4]) {
    await a.set({ rowRating: n })
    await a.wait(80)
  }
  await a.move('rest')
  await a.wait(2000)

  // 리셋: 앱의 실제 기능인 Esc(검색어 지우기)를 원인으로 보여 주고, 추가된 행은 한 번에 접는다
  a.mark('reset')
  await a.key('esc')
  await a.set({ query: '', results: false })
  await a.wait(400)
  await a.set({ added: false })
  await a.wait(650)
  await a.snap({ ...initial })
  await a.wait(compact ? 300 : 400)
}

// 필러 행(바): 이야기에 등장하지 않는 책들
function FillerResult({ tone }) {
  return (
    <Card pad="small" className="bm-result bm-extra-result">
      <Row pad={0} lead={<Cover tone={tone} />} title={<Bar w={96} h={7} tone={3} />} subtitle={<Bar w={60} h={5} tone={2} />}>
        <Bar w={64} h={24} r={7} tone={1} />
      </Row>
    </Card>
  )
}

function FillerShelfRow({ tone, titleW, extra }) {
  return (
    <div className={`bm-fill-row${extra ? ' bm-fill-extra' : ''}`}>
      <Row pad={0} lead={<Cover tone={tone} />} title={<Bar w={titleW} h={7} tone={3} />} subtitle={<Bar w={64} h={5} tone={2} />}>
        <Bar w={52} h={18} r={9} tone={1} />
      </Row>
    </div>
  )
}

function Scene({ s }) {
  return (
    <>
      <Window url="bookmark.app" urlShape="pill" className="bm-window">
        <div className="bm-app" data-crop>
          <section className="bm-pane bm-pane--search">
            <Text className="bm-title">책 검색</Text>
            <Field
              className="bm-field"
              value={s.query}
              placeholder="책 제목이나 저자를 입력하세요"
              focused={s.typing}
              box={{ 'data-target': 'search' }}
            />
            <div className="bm-stack" data-results={s.results || undefined}>
              <div className="bm-idle">
                <Text>검색어를 입력하면 책을 찾아 드려요</Text>
              </div>
              <div className="bm-results">
                <Card pad="small" className="bm-result">
                  <Row
                    pad={0}
                    lead={<Cover tone="navy" />}
                    title={<Text className="bm-book">{BOOK}</Text>}
                    subtitle={<Text className="bm-author">{AUTHOR}</Text>}
                  >
                    <Button size="small" variant={s.added ? 'secondary' : 'primary'} data-target="add">
                      {s.added ? '담김' : '서재에 담기'}
                    </Button>
                  </Row>
                </Card>
                <FillerResult tone="sage" />
              </div>
            </div>
          </section>

          <section className="bm-pane bm-pane--lib">
            <Text className="bm-title">내 서재</Text>
            <Card pad="small" gap={0} className="bm-lib">
              <Collapse open={s.added} reveal="drop">
                <div className="bm-libnew">
                  <Row
                    pad={0}
                    data-target="newrow"
                    lead={<Cover tone="navy" />}
                    title={<Text className="bm-book">{BOOK}</Text>}
                    subtitle={<Text className="bm-author">{AUTHOR}</Text>}
                    meta={
                      <span className="bm-meta">
                        <Badge tone={s.rowStatus === 'done' ? 'success' : 'neutral'}>
                          <Roll variant="fade">{STATUS_LABEL[s.rowStatus]}</Roll>
                        </Badge>
                        <Button size="small" data-target="edit">상세·수정</Button>
                      </span>
                    }
                  >
                  </Row>
                  <div className="bm-extra">
                    <Stars value={s.rowRating} />
                    <Collapse open={s.saved}>
                      <Text className="bm-memo">{`“${MEMO}”`}</Text>
                    </Collapse>
                  </div>
                </div>
              </Collapse>
              <FillerShelfRow tone="sage" titleW={110} />
              <FillerShelfRow tone="clay" titleW={84} />
              <FillerShelfRow tone="plum" titleW={126} extra />
            </Card>
          </section>
        </div>
      </Window>

      {/* 상세 모달: 앱에서처럼 배경을 어둡게 하고 창 가운데에 내려온다 */}
      <div className="bm-scrim" data-show={s.detail || undefined} />
      <div className="bm-detail">
        <Collapse open={s.detail} reveal="drop">
          <Card pad="medium" gap={12} className="bm-detail__card">
            <div className="bm-detail__head">
              <Cover tone="navy" size="sm" />
              <div className="bm-detail__who">
                <Text className="bm-book">{BOOK}</Text>
                <Text className="bm-author">{AUTHOR}</Text>
              </div>
            </div>
            <div className="bm-fieldrow bm-fieldrow--inline">
              <Text className="bm-label">독서 상태</Text>
              <div className="bm-select" data-target="status" data-cursor="pointer">
                <Roll variant="fade">{STATUS_LABEL[s.status]}</Roll>
                <ChevronDown size={14} strokeWidth={1.8} />
              </div>
            </div>
            <div className="bm-fieldrow bm-fieldrow--inline">
              <Text className="bm-label">별점</Text>
              <Stars value={s.cardRating} target="star" />
            </div>
            <div className="bm-fieldrow bm-fieldrow--memo">
              <Text className="bm-label">한 줄 메모</Text>
              <Field value={s.memo} focused={s.memoFocus} placeholder="한 줄로 남겨 보세요" box={{ 'data-target': 'memo' }} />
            </div>
            <div className="bm-detail__foot">
              <Button variant="primary" data-target="save">저장</Button>
            </div>
          </Card>
        </Collapse>
      </div>
    </>
  )
}

export default function HeroDemo() {
  return (
    <Stage
      width={960}
      height={440}
      compact={{ below: 600, width: 358, height: 340 }}
      initial={initial}
      poster={POSTER}
      script={script}
      cursor={{ at: REST }}
      className="bm bm-hero"
    >
      {(s, _rect, layout) => (
        <>
          <Scene s={s} />
          {/* 커서가 쉬는 빈 자리 */}
          <span data-target="rest" style={{ position: 'absolute', left: REST[layout].x, top: REST[layout].y }} />
        </>
      )}
    </Stage>
  )
}
