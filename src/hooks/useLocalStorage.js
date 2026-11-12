import { useEffect, useState } from 'react'

// useState와 같은 형태로 쓰되, 값이 바뀔 때마다 localStorage에 저장하고
// 처음 렌더링할 때 저장된 값을 복원하는 커스텀 훅.
// isValid로 저장값의 형태를 검사해, 깨진 데이터면 초기값을 사용한다.
export function useLocalStorage(key, initialValue, isValid = () => true) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key)
      if (saved === null) return initialValue
      const parsed = JSON.parse(saved)
      return isValid(parsed) ? parsed : initialValue
    } catch {
      return initialValue // 저장된 JSON이 깨졌거나 접근이 막힌 경우
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 저장 공간이 가득 찼거나 사생활 보호 모드면 메모리 상태만 유지한다.
    }
  }, [key, value])

  return [value, setValue]
}
