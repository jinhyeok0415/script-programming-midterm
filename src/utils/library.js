import { FILTER_ALL, STATUS } from '../constants.js'
import { todayString } from './date.js'

// 서재에 저장할 도서 객체를 만든다. (검색 결과 등록과 직접 등록이 함께 사용)
export function createBook({ id, title, authors = [], year = null, coverId = null, coverUrl = null, source = 'manual', status }) {
  return {
    id,
    title,
    authors,
    year,
    coverId,
    coverUrl,
    source, // 'openlibrary' | 'nl' | 'manual' (어디서 담았는지)
    status,
    rating: 0,
    memo: '',
    finishedAt: status === STATUS.DONE ? todayString() : null,
    createdAt: Date.now(),
  }
}

// 직접 등록한 책에 붙일 고유 id
export function createManualId() {
  const unique = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `manual:${unique}`
}

// 상태 탭 + 키워드(제목·저자·메모) 필터 후 정렬
export function filterAndSortBooks(books, { status, query, sort }) {
  const keyword = query.trim().toLowerCase()

  const filtered = books.filter((book) => {
    if (status !== FILTER_ALL && book.status !== status) return false
    if (!keyword) return true
    return [book.title, ...book.authors, book.memo].join('\n').toLowerCase().includes(keyword)
  })

  const sorted = [...filtered]
  if (sort === 'title') {
    sorted.sort((a, b) => a.title.localeCompare(b.title, 'ko'))
  } else if (sort === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt)
  } else {
    sorted.sort((a, b) => b.createdAt - a.createdAt)
  }
  return sorted
}

// 통계: 전체/상태별 권수, 평균 별점(별점을 매긴 책만 계산)
export function getStats(books) {
  const rated = books.filter((book) => book.rating > 0)
  const total = rated.reduce((sum, book) => sum + book.rating, 0)
  return {
    total: books.length,
    want: books.filter((book) => book.status === STATUS.WANT).length,
    reading: books.filter((book) => book.status === STATUS.READING).length,
    done: books.filter((book) => book.status === STATUS.DONE).length,
    averageRating: rated.length > 0 ? total / rated.length : null,
    ratedCount: rated.length,
  }
}
