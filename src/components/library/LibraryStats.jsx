import { useMemo } from 'react'
import { getStats } from '../../utils/library.js'

// 서재 상단 통계: 전체/상태별 권수와 평균 별점. 서재가 바뀔 때만 다시 계산한다(useMemo).
function LibraryStats({ library }) {
  const stats = useMemo(() => getStats(library), [library])

  const items = [
    { label: '전체', value: `${stats.total}권` },
    { label: '읽고 싶음', value: `${stats.want}권` },
    { label: '읽는 중', value: `${stats.reading}권` },
    { label: '다 읽음', value: `${stats.done}권` },
    {
      label: '평균 별점',
      value: stats.averageRating === null ? '-' : stats.averageRating.toFixed(1),
      note: stats.ratedCount > 0 ? `${stats.ratedCount}권 평가` : '평가한 책 없음',
    },
  ]

  return (
    <dl className="stats" aria-label="독서 현황">
      {items.map((item) => (
        <div className="stats__item" key={item.label}>
          <dt className="stats__label">{item.label}</dt>
          <dd className="stats__value">{item.value}</dd>
          {item.note && <dd className="stats__note">{item.note}</dd>}
        </div>
      ))}
    </dl>
  )
}

export default LibraryStats
