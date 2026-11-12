// 도서 검색 출처(provider) 레지스트리.
// 새 출처를 추가하려면 PROVIDERS에 항목 하나를 더하면 된다. 각 출처의 search(query, { signal })는
// 앱 도서 객체 { id, source, title, authors, year, coverId, coverUrl, pages } 배열을 돌려줘야 한다.
//
// 인증키가 필요한 출처는 화면에서 입력받지 않고 환경변수(.env.local)에서 읽는다.
// 키가 없으면 available이 false가 되어 검색 화면에서 "사용할 수 없음"으로 안내한다.
import { searchNationalLibrary } from './nationalLibrary.js'
import { searchOpenLibrary } from './openLibrary.js'

// .env.local 의 VITE_NL_CERT_KEY (국립중앙도서관 인증키). 주의: VITE_ 로 시작하는 값은 빌드 결과에 포함된다.
const nlKey = (import.meta.env.VITE_NL_CERT_KEY ?? '').trim()

export const PROVIDERS = {
  openlibrary: {
    id: 'openlibrary',
    label: 'Open Library',
    description: '전 세계 도서를 검색해요. 영문 자료가 많아요.',
    available: true,
    search: (query, options) => searchOpenLibrary(query, options),
  },
  nl: {
    id: 'nl',
    label: '국립중앙도서관',
    description: '국내에서 출판된 도서(ISBN 서지정보)를 검색해요. 한글 제목·저자 검색에 좋아요.',
    available: nlKey !== '',
    search: (query, options) => searchNationalLibrary(query, { ...options, apiKey: nlKey }),
  },
}

export const PROVIDER_LIST = Object.values(PROVIDERS)
export const DEFAULT_PROVIDER_ID = 'openlibrary'

export const isProviderId = (value) => typeof value === 'string' && value in PROVIDERS
export const getProvider = (id) => PROVIDERS[id] ?? PROVIDERS[DEFAULT_PROVIDER_ID]
