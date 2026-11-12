// 상단 헤더: 서비스 로고와 섹션 이동 링크를 보여준다.
function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="header__brand" href="#top" aria-label="책갈피 홈">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
          책갈피
        </a>
        <nav className="header__nav" aria-label="주요 메뉴">
          <a className="header__link" href="#search">책 검색</a>
          <a className="header__link" href="#library">내 서재</a>
        </nav>
      </div>
    </header>
  )
}

export default Header
