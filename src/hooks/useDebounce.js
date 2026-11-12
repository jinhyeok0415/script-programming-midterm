import { useEffect, useState } from 'react'

// 입력값이 delay(ms) 동안 바뀌지 않을 때만 반영된 값을 돌려준다.
// flush(next)를 호출하면 기다리지 않고 즉시 반영한다(Enter 키 등).
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  const flush = (next = value) => setDebounced(next)

  return [debounced, flush]
}
