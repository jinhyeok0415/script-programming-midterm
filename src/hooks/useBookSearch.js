import { useEffect, useState } from 'react'
import { getProvider } from '../api/providers.js'
import { useDebounce } from './useDebounce.js'

// 검색 출처 + 검색어 상태 + 디바운스 + API 호출을 묶은 훅.
// 새 검색이 시작되면(검색어·출처·인증키가 바뀌면) 이전 요청은 AbortController로 취소한다.
// status: 'idle' | 'needsKey' | 'loading' | 'success' | 'error' (응답 상태에서 파생)
export function useBookSearch(providerId, apiKey) {
  const provider = getProvider(providerId)
  const [query, setQuery] = useState('')
  const [debouncedQuery, flush] = useDebounce(query.trim(), 400)
  const [retryCount, setRetryCount] = useState(0)
  // 응답에 어떤 요청(출처 + 인증키 + 검색어 + 재시도 횟수)의 결과인지 함께 저장해 두고,
  // 현재 요청과 비교해 loading 여부를 판단한다.
  const [response, setResponse] = useState({ requestId: '', results: [], error: null })

  const needsKey = provider.needsKey && !apiKey
  const requestId = debouncedQuery && !needsKey ? `${provider.id}|${apiKey ?? ''}|${debouncedQuery}#${retryCount}` : ''

  useEffect(() => {
    if (!debouncedQuery || needsKey) return undefined

    const controller = new AbortController()
    const id = `${provider.id}|${apiKey ?? ''}|${debouncedQuery}#${retryCount}`
    provider
      .search(debouncedQuery, { signal: controller.signal, apiKey })
      .then((results) => setResponse({ requestId: id, results, error: null }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        let message = error.message
        if (error instanceof TypeError) message = '네트워크 연결을 확인해 주세요.'
        else if (error instanceof SyntaxError) message = '검색 결과를 읽지 못했어요. 잠시 후 다시 시도해 주세요.'
        setResponse({ requestId: id, results: [], error: message })
      })

    return () => controller.abort()
  }, [provider, apiKey, debouncedQuery, retryCount, needsKey])

  let status = 'idle'
  if (debouncedQuery && needsKey) {
    status = 'needsKey'
  } else if (requestId) {
    if (response.requestId !== requestId) status = 'loading'
    else status = response.error ? 'error' : 'success'
  }

  return {
    query,
    setQuery,
    searchNow: () => flush(query.trim()),
    clear: () => {
      setQuery('')
      flush('')
    },
    retry: () => setRetryCount((count) => count + 1),
    status,
    results: status === 'success' ? response.results : [],
    error: status === 'error' ? response.error : null,
    activeQuery: debouncedQuery,
  }
}
