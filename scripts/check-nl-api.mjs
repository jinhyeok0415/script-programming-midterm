// 국립중앙도서관 API 연결 점검 스크립트.
//   사용법:  npm run check:nl            (기본 검색어 "어린 왕자")
//            npm run check:nl -- 해리포터
// 인증키는 환경변수 NL_CERT_KEY 또는 .env.local / .env 파일에서 읽는다. 키 값은 출력하지 않는다.
// 이 스크립트는 개발자용 점검 도구일 뿐이며, 웹 앱은 이 변수를 읽지 않는다(앱은 접속자가 화면에서 입력한 키를 쓴다).
// 변수 이름에 VITE_ 를 붙이지 않는 이유: VITE_ 로 시작하는 값은 프론트엔드 빌드 결과에 포함될 수 있기 때문이다.
//
// 확인하는 것:
//   1) 인증키가 유효한지 (오류 코드 010/011)
//   2) 성공 응답의 JSON 구조: 최상위 키, 목록 배열의 키 이름, 항목 필드
//   3) page_size=20 이 허용되는지 (오류 013)
//   4) 앱의 정규화 함수(normalizeNationalLibraryResponse)가 실제 응답을 읽는지
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeNationalLibraryResponse } from '../src/api/nationalLibrary.js'

const URL_BASE = 'https://www.nl.go.kr/seoji/SearchApi.do'
const query = process.argv[2] ?? '어린 왕자'

function readEnvKey() {
  if (process.env.NL_CERT_KEY) return process.env.NL_CERT_KEY.trim()
  for (const file of ['.env.local', '.env']) {
    const path = resolve(process.cwd(), file)
    if (!existsSync(path)) continue
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = /^\s*NL_CERT_KEY\s*=\s*(.*?)\s*$/.exec(line)
      if (match) return match[1].replace(/^["']|["']$/g, '')
    }
  }
  return ''
}

const describe = (value) =>
  Array.isArray(value) ? `배열(${value.length}개)` : value === null ? 'null' : typeof value === 'object' ? '객체' : `${typeof value}`

async function call(key, params) {
  const search = new URLSearchParams({ cert_key: key, result_style: 'json', page_no: '1', ...params })
  const response = await fetch(`${URL_BASE}?${search}`)
  const raw = await response.text()
  let json = null
  try { json = JSON.parse(raw) } catch { /* JSON이 아님 */ }
  return { response, raw, json }
}

const key = readEnvKey()
if (!key) {
  console.log('인증키가 없어요. 아래 중 하나로 설정한 뒤 다시 실행하세요.')
  console.log('  1) .env.example 을 복사해 .env.local 을 만들고 NL_CERT_KEY=발급받은키 를 채운다')
  console.log('  2) 한 번만 쓸 때:  PowerShell  $env:NL_CERT_KEY="발급받은키"; npm run check:nl')
  process.exit(1)
}
console.log(`인증키 확인: 길이 ${key.length}자 (값은 출력하지 않아요) / 검색어: "${query}"\n`)

let failed = false
for (const [label, params] of [
  ['제목 검색 (title, page_size=20)', { title: query, page_size: '20' }],
  ['저자 검색 (author, page_size=20)', { author: query, page_size: '20' }],
]) {
  console.log(`■ ${label}`)
  const { response, raw, json } = await call(key, params)
  console.log(`  HTTP ${response.status} · ${response.headers.get('content-type')} · CORS: ${response.headers.get('access-control-allow-origin') ?? '(헤더 없음)'}`)

  if (!json) {
    console.log('  ⚠ JSON이 아닌 응답이에요. 앞부분:', raw.slice(0, 200).replace(/\s+/g, ' '))
    failed = true
    continue
  }

  console.log('  최상위 키:', Object.entries(json).map(([k, v]) => `${k}: ${describe(v)}`).join(' | '))
  if (json.RESULT === 'ERROR' || json.ERR_CODE) {
    console.log(`  ✗ 오류 응답: ERR_CODE=${json.ERR_CODE} ${json.ERR_MESSAGE ?? ''}`)
    if (json.ERR_CODE === '013') console.log('    → page_size가 허용 범위를 넘었어요. src/api/nationalLibrary.js 의 PAGE_SIZE를 줄여야 해요.')
    if (['010', '011'].includes(json.ERR_CODE)) console.log('    → 인증키가 비었거나 유효하지 않아요.')
    failed = true
    continue
  }

  const list = Object.entries(json).find(([, v]) => Array.isArray(v))
  if (list) {
    const [listKey, items] = list
    console.log(`  목록 배열 키: "${listKey}" (${items.length}건)`)
    if (items[0]) {
      console.log('  첫 항목 필드:', Object.keys(items[0]).join(', '))
      const { TITLE, AUTHOR, EA_ISBN, PUBLISHER, PUBLISH_PREDATE, TITLE_URL, PAGE, VOL } = items[0]
      console.log('  첫 항목 값:', JSON.stringify({ TITLE, VOL, AUTHOR, EA_ISBN, PUBLISHER, PUBLISH_PREDATE, PAGE, TITLE_URL }))
    }
  } else {
    console.log('  ⚠ 목록 배열을 찾지 못했어요. 전체 응답 앞부분:', raw.slice(0, 300).replace(/\s+/g, ' '))
    failed = true
  }

  try {
    const books = normalizeNationalLibraryResponse(json)
    console.log(`  앱 정규화 결과: ${books.length}건`)
    if (books[0]) console.log('  첫 번째 책:', JSON.stringify(books[0]))
    if (list && list[1].length > 0 && books.length === 0) {
      console.log('  ⚠ 목록은 있는데 앱이 한 건도 읽지 못했어요. 필드 이름을 확인해야 해요.')
      failed = true
    }
  } catch (error) {
    console.log(`  ✗ 앱 정규화 중 오류: ${error.message}`)
    failed = true
  }
  console.log('')
}

console.log(failed ? '결과: 확인이 필요한 항목이 있어요. 위 내용을 그대로 알려 주세요.' : '결과: 정상이에요.')
process.exit(failed ? 1 : 0)
