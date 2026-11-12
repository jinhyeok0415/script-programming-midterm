import { FILTER_ALL, FILTER_OPTIONS, SORT_OPTIONS } from '../../constants.js'

// 서재 필터 바: 상태 탭, 서재 내 키워드 검색, 정렬 선택.
function LibraryFilter({ status, onStatusChange, query, onQueryChange, sort, onSortChange, counts }) {
  return (
    <div className="lib-filter">
      <div className="lib-filter__tabs" role="group" aria-label="독서 상태 필터">
        {FILTER_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`tab ${status === option.value ? 'tab--active' : ''}`}
            type="button"
            aria-pressed={status === option.value}
            onClick={() => onStatusChange(option.value)}
          >
            {option.label}
            <span className="tab__count">{option.value === FILTER_ALL ? counts.total : counts[option.value]}</span>
          </button>
        ))}
      </div>
      <div className="lib-filter__tools">
        <label className="sr-only" htmlFor="library-search">내 서재에서 검색</label>
        <input
          id="library-search"
          className="input"
          type="search"
          placeholder="제목·저자·메모 검색"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        <label className="sr-only" htmlFor="library-sort">정렬 기준</label>
        <select id="library-sort" className="select" value={sort} onChange={(event) => onSortChange(event.target.value)}>
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default LibraryFilter
