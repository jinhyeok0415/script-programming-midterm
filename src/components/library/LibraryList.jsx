import LibraryItem from './LibraryItem.jsx'
import EmptyState from '../common/EmptyState.jsx'
import EmptyShelf from '../hero/EmptyShelf.jsx'

// 서재 목록. 서재가 비었을 때 / 필터 결과가 없을 때 각각 다른 안내를 보여준다.
function LibraryList({ books, totalCount, onOpen, onDelete, onResetFilters }) {
  if (totalCount === 0) {
    return (
      <EmptyState
        title="아직 서재가 비어 있어요"
        description="위에서 책을 검색해 담거나 직접 등록하면 이곳에 쌓입니다."
        illustration={<EmptyShelf />}
      >
        <a className="btn btn--primary" href="#search">책 검색하러 가기</a>
      </EmptyState>
    )
  }

  if (books.length === 0) {
    return (
      <EmptyState title="조건에 맞는 책이 없어요" description="검색어나 상태 필터를 바꿔 보세요.">
        <button className="btn" type="button" onClick={onResetFilters}>필터 초기화</button>
      </EmptyState>
    )
  }

  return (
    <ul className="lib-list">
      {books.map((book) => (
        <LibraryItem key={book.id} book={book} onOpen={onOpen} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default LibraryList
