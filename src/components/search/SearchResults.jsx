import BookCard from './BookCard.jsx'

// 검색 상태(idle / needsKey / loading / error / 결과 없음 / 성공)에 맞는 화면을 보여준다.
function SearchResults({ status, results, error, activeQuery, providerLabel, libraryIds, onAddBook, onRetry }) {
  if (status === 'idle') {
    return <p className="search-message">검색어를 입력하면 {providerLabel}에서 책을 찾아 드려요.</p>
  }

  if (status === 'needsKey') {
    return (
      <p className="search-message" role="status">
        {providerLabel} 검색에는 본인의 인증키가 필요해요. 위의 &lsquo;검색 출처&rsquo;에서 인증키를 저장하면 바로 검색해 드려요.
      </p>
    )
  }

  if (status === 'loading') {
    return (
      <p className="search-message" role="status">
        <span className="spinner" aria-hidden="true" />
        {providerLabel}에서 &lsquo;{activeQuery}&rsquo; 검색 중…
      </p>
    )
  }

  if (status === 'error') {
    return (
      <div className="search-message search-message--error" role="alert">
        <p>{error}</p>
        <button className="btn" type="button" onClick={onRetry}>다시 시도</button>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <p className="search-message" role="status">
        {providerLabel}에는 &lsquo;{activeQuery}&rsquo;에 대한 결과가 없어요.
        다른 검색어나 다른 검색 출처로 찾아보거나, 아래에서 직접 등록해 보세요.
      </p>
    )
  }

  return (
    <>
      <p className="search-count" role="status">{results.length}건의 검색 결과 · {providerLabel}</p>
      <ul className="book-grid">
        {results.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isAdded={libraryIds.has(book.id)}
            onAddBook={onAddBook}
          />
        ))}
      </ul>
    </>
  )
}

export default SearchResults
