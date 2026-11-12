// 하단 푸터: 과제 정보와 데이터 출처(Open Library)를 표시한다.
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>책갈피 · 스크립트 프로그래밍 중간과제 · 20241242 김진혁</p>
        <p>
          도서 데이터 제공: <a href="https://openlibrary.org" target="_blank" rel="noreferrer">Open Library</a>
          {' · '}
          <a href="https://www.nl.go.kr" target="_blank" rel="noreferrer">국립중앙도서관</a>
        </p>
      </div>
    </footer>
  )
}

export default Footer
