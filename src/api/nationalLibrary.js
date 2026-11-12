// 국립중앙도서관 ISBN 서지정보 API (https://www.nl.go.kr/seoji/SearchApi.do) 호출 모듈.
// 인증키(cert_key)가 필요하며, JSON 응답과 CORS(Access-Control-Allow-Origin: *)를 지원해
// 브라우저에서 직접 호출한다. 실제 응답으로 확인한 구조:
//   { TOTAL_COUNT: "1797", PAGE_NO: "1", docs: [ { TITLE, VOL, AUTHOR, EA_ISBN, PUBLISHER,
//     PUBLISH_PREDATE, REAL_PUBLISH_DATE, PAGE, TITLE_URL(표지), FORM, EBOOK_YN, ... } ] }
//   오류: { RESULT: "ERROR", ERR_CODE: "011", ERR_MESSAGE: "..." }
//   요청: cert_key, result_style, page_no, page_size(20 허용 확인), title(본표제), author(저자)
//   오류 코드: 010 키 누락 / 011 유효하지 않은 키 / 012 필수 변수 누락 / 013 쪽당 건수 제한 / 000 시스템 오류
import { ProviderError } from './ProviderError.js'

const SEARCH_URL = 'https://www.nl.go.kr/seoji/SearchApi.do'
const PAGE_SIZE = 20

const ERROR_MESSAGES = {
  '010': '인증키가 설정되지 않았어요. (.env.local 의 VITE_NL_CERT_KEY)',
  '011': '인증키가 올바르지 않아요. 설정한 키(.env.local 의 VITE_NL_CERT_KEY)를 확인해 주세요.',
  '012': '검색에 필요한 값이 빠졌어요.',
  '013': '한 번에 가져올 수 있는 건수를 넘었어요.',
  '000': '국립중앙도서관 서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.',
}
const AUTH_CODES = new Set(['010', '011'])

// 문자열 정리: 데이터에 섞인 글자 그대로의 "\b" 표기를 없애고 공백을 하나로 모은다.
// (정규식 \s 와 trim() 은 NBSP도 공백으로 처리하므로 따로 바꾸지 않는다)
const clean = (value) =>
  typeof value === 'string' ? value.replace(/\\b/g, '').replace(/\s+/g, ' ').trim() : ''

// 저자 필드의 역할. 책의 "저자"로 보여 줄 역할(PRIMARY)과, 있으면 빼는 역할(그림·옮김 등)을 나눈다.
// 실제 표기 예: "저자 : A" / "원작자 : A;역자 : B;" / "글: A ;그림: B" / "A 지음, B 옮김" / "A 원작/B 엮음/C 그림"
const PRIMARY_ROLES = new Set([
  '저자', '지은이', '지음', '글', '저', '원작', '원작자', '원저', '원저자', '편저', '편저자', '공저', '집필', '집필인', '저술',
])
const ROLE_SUFFIX = /^(.+?)\s+(원작자|원저자|편저자|지은이|옮긴이|집필인|원작|원저|편저|공저|지음|옮김|엮음|그림|삽화|감수|글|저|역)$/

// "역할 : 이름" 또는 "이름 역할" 한 조각 → { name, role }
function parseAuthorPart(part) {
  const labeled = /^([^:：]{1,12}?)\s*[:：]\s*(.+)$/.exec(part)
  if (labeled) return { role: labeled[1].trim(), name: labeled[2].trim() }
  const suffixed = ROLE_SUFFIX.exec(part)
  if (suffixed) return { role: suffixed[2], name: suffixed[1].trim() }
  return { role: null, name: part }
}

// 저자 문자열 → 이름 배열. 주 저작자가 있으면 그들만, 없으면 모든 이름을 돌려준다.
export function parseAuthors(value) {
  const people = clean(value)
    .split(/[;/,，]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parseAuthorPart)
    .filter((person) => person.name)
  const primary = people.filter((person) => person.role === null || PRIMARY_ROLES.has(person.role))
  const names = (primary.length > 0 ? primary : people).map((person) => person.name)
  return [...new Set(names)]
}

// 목록이 담긴 배열을 찾는다. 실제 응답은 docs 이며, 구조가 바뀌어도 읽을 수 있게 다른 이름과 첫 배열도 허용한다.
function pickList(data) {
  if (Array.isArray(data)) return data
  if (!data || typeof data !== 'object') return []
  for (const key of ['docs', 'DOCS', 'items', 'ITEMS', 'list', 'LIST']) {
    if (Array.isArray(data[key])) return data[key]
  }
  return Object.values(data).find(Array.isArray) ?? []
}

// 표지 주소: 실제 응답에 http:// 가 섞여 있어(https에서 혼합 콘텐츠로 막힘) nl.go.kr 은 https 로 바꾼다.
function toCoverUrl(value) {
  const url = clean(value)
  if (!/^https?:\/\//.test(url)) return null
  return url.replace(/^http:\/\/((?:www\.)?nl\.go\.kr\/)/, 'https://$1')
}

// 응답 한 건 → 앱 도서 객체. 제목이 없으면 버린다.
function toBook(doc) {
  const baseTitle = clean(doc.TITLE)
  if (!baseTitle) return null
  const vol = clean(doc.VOL)
  const title = vol ? `${baseTitle} ${vol}` : baseTitle
  const authors = parseAuthors(doc.AUTHOR)
  const isbn = clean(doc.EA_ISBN)
  // 실제 발행일이 있으면 그것을, 없으면 출판예정일을 쓴다(둘 다 있는 항목은 항상 같은 해였다).
  const publishDate = clean(doc.REAL_PUBLISH_DATE) || clean(doc.PUBLISH_PREDATE)
  const pages = /\d+/.exec(clean(doc.PAGE)) // "156 p.", "약 95페이지 내외" 같은 표기에서 첫 숫자

  return {
    // ISBN이 있으면 ISBN으로 구분하고, 없으면 제목·저자·발행처·발행일로 대신한다.
    id: isbn ? `nl:${isbn}` : `nl:${[title, authors.join(','), clean(doc.PUBLISHER), publishDate].join('|')}`,
    source: 'nl',
    title,
    authors,
    year: /^\d{4}/.test(publishDate) ? Number(publishDate.slice(0, 4)) : null,
    coverId: null,
    coverUrl: toCoverUrl(doc.TITLE_URL),
    pages: pages ? Number(pages[0]) : null,
  }
}

// 응답 본문(JSON 객체) → 도서 목록. 같은 id는 하나만 남긴다. (네트워크 없이 단독으로 테스트 가능)
export function normalizeNationalLibraryResponse(data) {
  if (data && (data.RESULT === 'ERROR' || data.ERR_CODE)) {
    const code = String(data.ERR_CODE ?? 'UNKNOWN')
    throw new ProviderError(
      ERROR_MESSAGES[code] ?? (clean(data.ERR_MESSAGE) || '국립중앙도서관 검색에 실패했어요.'),
      AUTH_CODES.has(code) ? 'AUTH' : `NL_${code}`,
    )
  }
  const seen = new Set()
  return pickList(data)
    .map(toBook)
    .filter((book) => {
      if (!book || seen.has(book.id)) return false
      seen.add(book.id)
      return true
    })
}

async function request(params, { signal, apiKey }) {
  const query = new URLSearchParams({
    cert_key: apiKey,
    result_style: 'json',
    page_no: '1',
    page_size: String(PAGE_SIZE),
    ...params,
  })
  const response = await fetch(`${SEARCH_URL}?${query}`, { signal })
  if (!response.ok) {
    throw new ProviderError(`국립중앙도서관 요청이 실패했어요. (HTTP ${response.status})`, `HTTP_${response.status}`)
  }
  return normalizeNationalLibraryResponse(await response.json())
}

// 제목 검색 결과가 이 수보다 적으면 저자 검색으로 채운다.
// 실제 데이터에서 작가 이름은 일부 제목에도 들어 있어(예: "조앤 K. 롤링" 제목 5건 / 저자 24건)
// "0건일 때만 저자 검색"으로는 저자의 책이 가려졌다. 반대로 "어린 왕자"처럼 제목 결과가 충분한 검색에
// 저자 검색을 섞으면 엉뚱한 일치(저자명에 "어린왕자"가 들어간 책)가 끼어들어 이 기준 이상이면 섞지 않는다.
const TITLE_RESULTS_ENOUGH = 10

// 도서 검색: 입력을 먼저 제목으로 찾고, 결과가 적으면 저자 검색 결과로 채운다(최대 PAGE_SIZE건).
export async function searchNationalLibrary(query, { signal, apiKey } = {}) {
  const byTitle = await request({ title: query }, { signal, apiKey })
  if (byTitle.length >= TITLE_RESULTS_ENOUGH) return byTitle

  const byAuthor = await request({ author: query }, { signal, apiKey })
  const seen = new Set(byTitle.map((book) => book.id))
  return [...byTitle, ...byAuthor.filter((book) => !seen.has(book.id))].slice(0, PAGE_SIZE)
}
