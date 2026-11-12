// 독서 상태 상수: 값(저장용)과 한글 라벨(화면용)
export const STATUS = {
  WANT: 'want',
  READING: 'reading',
  DONE: 'done',
}

export const STATUS_OPTIONS = [
  { value: STATUS.WANT, label: '읽고 싶음' },
  { value: STATUS.READING, label: '읽는 중' },
  { value: STATUS.DONE, label: '다 읽음' },
]

export const STATUS_LABEL = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
)

// 서재 필터 탭 값 ('all' + 독서 상태)
export const FILTER_ALL = 'all'
export const FILTER_OPTIONS = [{ value: FILTER_ALL, label: '전체' }, ...STATUS_OPTIONS]

// 서재 정렬 기준
export const SORT_OPTIONS = [
  { value: 'recent', label: '최근 등록순' },
  { value: 'title', label: '제목순' },
  { value: 'rating', label: '별점순' },
]
