// 도서 검색 출처(provider) 레지스트리.
// 새 출처를 추가하려면 PROVIDERS에 항목 하나를 더하면 된다. 각 출처의 search(query, { signal, apiKey })는
// 앱 도서 객체 { id, source, title, authors, year, coverId, coverUrl, pages } 배열을 돌려줘야 한다.
//
// 인증키(apiKey)가 필요한 출처(needsKey)는 접속자가 화면에서 직접 입력한 본인 키를 쓴다.
// 키는 소스코드·환경변수·빌드 결과에 넣지 않으므로 저장소나 배포 파일에는 어떤 키도 포함되지 않는다.
import { searchNationalLibrary } from './nationalLibrary.js'
import { searchOpenLibrary } from './openLibrary.js'

export const PROVIDERS = {
  openlibrary: {
    id: 'openlibrary',
    label: 'Open Library',
    description: '전 세계 도서를 검색해요. 영문 자료가 많아요.',
    needsKey: false,
    search: (query, options) => searchOpenLibrary(query, options),
  },
  nl: {
    id: 'nl',
    label: '국립중앙도서관',
    description: '국내에서 출판된 도서(ISBN 서지정보)를 검색해요. 한글 제목·저자 검색에 좋아요. 본인의 무료 인증키가 필요해요.',
    needsKey: true,
    keyLabel: '인증키',
    keyGuideUrl: 'https://www.nl.go.kr/NL/contents/N31101020000.do',
    search: (query, options) => searchNationalLibrary(query, options),
  },
}

export const PROVIDER_LIST = Object.values(PROVIDERS)
export const DEFAULT_PROVIDER_ID = 'openlibrary'

export const isProviderId = (value) => typeof value === 'string' && value in PROVIDERS
export const getProvider = (id) => PROVIDERS[id] ?? PROVIDERS[DEFAULT_PROVIDER_ID]
