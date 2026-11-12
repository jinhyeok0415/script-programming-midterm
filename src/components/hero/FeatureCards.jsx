import { Badge, Bar, Button, Card, Field, Meter, Row, Stage, Text, Window } from './kit.js'
import { Cover, Stars } from './parts.jsx'
import './stageLook.css'
import './cards.css'

// 기능 소개 카드 3장(검색 · 기록 · 통계): 움직이지 않는 stageshow still.
// gold 예제 static-card 의 "Pinned, bottom bleed" 구도를 따른다:
// 창은 위·좌우로 한 칸(gutter)씩 안쪽에서 시작해 아래로 잘리고, 실제 글자는 이야기에 필요한 곳에만 둔다.

const BOOK = '어린 왕자'
const AUTHOR = '앙투안 드 생텍쥐페리'

function Still({ label, children }) {
  return (
    <Stage width={360} height={280} className="bm bm-still" fidelity="standard" role="img" aria-label={label}>
      {() => (
        <Window url="bookmark.app" urlShape="pill" className="bm-still__window">
          <div className="bm-still__body" data-crop>{children}</div>
        </Window>
      )}
    </Stage>
  )
}

function FillerRow({ tone, w = 96 }) {
  return (
    <Row pad={0} lead={<Cover tone={tone} />} title={<Bar w={w} h={7} tone={3} />} subtitle={<Bar w={60} h={5} tone={2} />}>
      <Bar w={56} h={22} r={7} tone={1} />
    </Row>
  )
}

// 1. 검색: 검색어를 입력하면 책이 나오고 바로 서재에 담을 수 있다
function SearchCard() {
  return (
    <Still label="책 제목을 검색하면 결과가 나오고 서재에 담을 수 있는 화면">
      <Field value={BOOK} className="bm-still__field" />
      <Card pad="small">
        <Row pad={0} lead={<Cover />} title={<Text className="bm-book">{BOOK}</Text>} subtitle={<Text className="bm-author">{AUTHOR}</Text>}>
          <Button size="small" variant="primary">서재에 담기</Button>
        </Row>
      </Card>
      <Card pad="small">
        <FillerRow tone="sage" />
      </Card>
      <Card pad="small">
        <FillerRow tone="clay" w={80} />
      </Card>
    </Still>
  )
}

// 2. 기록: 읽은 책에 별점과 한 줄 메모를 남긴다
function RecordCard() {
  return (
    <Still label="읽은 책에 독서 상태, 별점, 한 줄 메모를 기록한 서재 화면">
      <Card pad="small" gap={0} className="bm-still__list">
        <div className="bm-still__item">
          <Row
            pad={0}
            lead={<Cover />}
            title={<Text className="bm-book">{BOOK}</Text>}
            subtitle={<Text className="bm-author">{AUTHOR}</Text>}
            meta={<Badge tone="success">다 읽음</Badge>}
          />
          <div className="bm-still__extra">
            <Stars value={4} />
            <Text className="bm-memo">“다시 읽고 싶은 책”</Text>
          </div>
        </div>
        <div className="bm-still__item bm-still__item--filler"><FillerRow tone="sage" /></div>
        <div className="bm-still__item bm-still__item--filler"><FillerRow tone="plum" w={110} /></div>
      </Card>
    </Still>
  )
}

// 3. 통계: 한눈에 보는 독서 현황. 큰 숫자는 하나만, 나머지는 줄로.
function StatsCard() {
  const rows = [
    ['읽고 싶음', 0.25],
    ['읽는 중', 0.17],
    ['다 읽음', 0.58],
  ]
  return (
    <Still label="전체 권수, 상태별 권수, 평균 별점을 보여 주는 독서 현황 화면">
      <Card pad="medium" gap={14}>
        <div className="bm-stat">
          <Text className="bm-label">전체</Text>
          <Text className="bm-stat__big">12권</Text>
        </div>
        <div className="bm-stat__rows">
          {rows.map(([label, value]) => (
            <div className="bm-stat__row" key={label}>
              <Text className="bm-stat__name">{label}</Text>
              <Meter value={value} tone={label === '다 읽음' ? 'accent' : 'ink'} />
            </div>
          ))}
        </div>
        <div className="bm-stat__avg">
          <Text className="bm-label">평균 별점</Text>
          <Stars value={4} />
          <Text className="bm-stat__avgnum">4.2</Text>
        </div>
        {/* 아래로 이어지는 필러(스테이지가 잘라 낸다) */}
        <div className="bm-stat__more">
          <Bar w={132} h={6} tone={2} />
          <Bar w={92} h={6} tone={2} />
        </div>
      </Card>
    </Still>
  )
}

const CARDS = [
  { id: 'search', title: '검색', desc: 'Open Library에서 책을 찾아 바로 서재에 담아요.', Visual: SearchCard },
  { id: 'record', title: '기록', desc: '독서 상태와 별점, 한 줄 메모를 남겨요.', Visual: RecordCard },
  { id: 'stats', title: '통계', desc: '읽은 권수와 평균 별점을 한눈에 봐요.', Visual: StatsCard },
]

function FeatureCards() {
  return (
    <section className="features container" aria-labelledby="features-title">
      <h2 id="features-title" className="section__title features__title">이렇게 쓰는 서비스예요</h2>
      <ul className="features__grid">
        {CARDS.map(({ id, title, desc, Visual }) => (
          <li className="features__item" key={id}>
            <div className="features__visual"><Visual /></div>
            <h3 className="features__name">{title}</h3>
            <p className="features__desc">{desc}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FeatureCards
