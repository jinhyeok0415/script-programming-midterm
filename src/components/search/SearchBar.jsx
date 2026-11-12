import { useEffect, useRef } from 'react'

// 검색 입력창. "#search" 링크로 이동할 때 입력창에 포커스(useRef), Enter는 즉시 검색, Esc는 입력 지우기.
// 페이지를 열자마자 포커스하면 브라우저가 검색창까지 스크롤해 히어로가 가려지고
// 모바일에서는 키보드가 바로 뜨므로, 검색으로 이동했을 때만 포커스한다.
function SearchBar({ value, onChange, onSubmit, onClear }) {
  const inputRef = useRef(null)

  useEffect(() => {
    // 링크를 눌러 이동할 때는 브라우저가 이미 스크롤하므로 포커스만 준다.
    const focusAfterLinkJump = () => {
      if (window.location.hash === '#search') inputRef.current?.focus({ preventScroll: true })
    }
    // 주소에 #search 를 붙여 처음부터 열면 React가 그리기 전에 앵커 스크롤이 끝나 있으므로 직접 스크롤한다.
    if (window.location.hash === '#search') inputRef.current?.focus()
    window.addEventListener('hashchange', focusAfterLinkJump)
    return () => window.removeEventListener('hashchange', focusAfterLinkJump)
  }, [])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && value) {
      onClear()
    }
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="book-search">책 제목 또는 저자 검색</label>
      <input
        id="book-search"
        ref={inputRef}
        className="search-bar__input"
        type="search"
        placeholder="책 제목이나 저자를 입력하세요"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="btn btn--primary" type="submit">검색</button>
    </form>
  )
}

export default SearchBar
