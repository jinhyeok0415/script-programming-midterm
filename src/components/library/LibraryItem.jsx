import BookCover from '../common/BookCover.jsx'
import StarRating from '../common/StarRating.jsx'
import { STATUS, STATUS_LABEL } from '../../constants.js'

// 서재 목록의 책 한 권. 상세·수정 모달 열기와 삭제 요청 버튼을 제공한다.
function LibraryItem({ book, onOpen, onDelete }) {
  const meta = [book.authors.join(', ') || '저자 정보 없음', book.year ? `${book.year}년` : null]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className="lib-item">
      <BookCover coverId={book.coverId} coverUrl={book.coverUrl} title={book.title} />
      <div className="lib-item__body">
        <div className="lib-item__head">
          <h3 className="lib-item__title">{book.title}</h3>
          <span className={`badge badge--${book.status}`}>{STATUS_LABEL[book.status]}</span>
        </div>
        <p className="lib-item__meta">{meta}</p>
        <StarRating value={book.rating} />
        {book.memo && <p className="lib-item__memo">“{book.memo}”</p>}
        {book.status === STATUS.DONE && book.finishedAt && (
          <p className="lib-item__meta">완독일 {book.finishedAt}</p>
        )}
        <div className="lib-item__actions">
          <button className="btn" type="button" aria-label={`${book.title} 상세·수정`} onClick={() => onOpen(book.id)}>
            상세·수정
          </button>
          <button className="btn btn--ghost-danger" type="button" aria-label={`${book.title} 삭제`} onClick={() => onDelete(book)}>
            삭제
          </button>
        </div>
      </div>
    </li>
  )
}

export default LibraryItem
