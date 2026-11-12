const STARS = [1, 2, 3, 4, 5]

function Star({ filled }) {
  return (
    <svg className={`star ${filled ? 'star--filled' : ''}`} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
    </svg>
  )
}

// 별점 컴포넌트. onChange가 없으면 읽기 전용(목록), 있으면 선택 가능(모달).
// 이미 선택한 별을 다시 누르면 별점이 0(미평가)으로 돌아간다.
function StarRating({ value, onChange, label = '별점' }) {
  if (!onChange) {
    return (
      <span className="stars" role="img" aria-label={value ? `${label} 5점 만점에 ${value}점` : `${label} 없음`}>
        {STARS.map((n) => <Star key={n} filled={n <= value} />)}
      </span>
    )
  }

  return (
    <div className="stars stars--input" role="radiogroup" aria-label={label}>
      {STARS.map((n) => (
        <button
          key={n}
          className="stars__btn"
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n}점`}
          onClick={() => onChange(value === n ? 0 : n)}
        >
          <Star filled={n <= value} />
        </button>
      ))}
    </div>
  )
}

export default StarRating
