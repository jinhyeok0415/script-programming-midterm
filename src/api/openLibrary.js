// Open Library API 호출 모듈: 검색 결과를 앱의 도서 형태로 변환해 돌려준다.
import { ProviderError } from './ProviderError.js'

const SEARCH_URL = 'https://openlibrary.org/search.json'
const COVER_URL = 'https://covers.openlibrary.org/b/id'
const FIELDS = 'key,title,author_name,first_publish_year,cover_i,number_of_pages_median'

// 표지 이미지 주소 (coverId가 없으면 null)
export function getCoverUrl(coverId, size = 'M') {
  return coverId ? `${COVER_URL}/${coverId}-${size}.jpg` : null
}

// API 응답 한 건 → 앱 도서 객체 (id는 Open Library work key를 그대로 사용)
function toBook(doc) {
  return {
    id: doc.key,
    source: 'openlibrary',
    title: doc.title,
    authors: doc.author_name ?? [],
    year: doc.first_publish_year ?? null,
    coverId: doc.cover_i ?? null,
    coverUrl: null,
    pages: doc.number_of_pages_median ?? null,
  }
}

// 도서 검색. signal로 요청을 취소할 수 있다(AbortController).
export async function searchOpenLibrary(query, { signal } = {}) {
  const params = new URLSearchParams({ q: query, limit: '20', fields: FIELDS })
  const response = await fetch(`${SEARCH_URL}?${params}`, { signal })
  if (!response.ok) {
    throw new ProviderError(`검색 요청이 실패했습니다. (HTTP ${response.status})`, `HTTP_${response.status}`)
  }
  const data = await response.json()
  return (data.docs ?? []).filter((doc) => doc.key && doc.title).map(toBook)
}
