import { useState } from 'react'
import BookCover from '../common/BookCover.jsx'
import { STATUS, STATUS_OPTIONS } from '../../constants.js'

// 검색 결과 카드 한 장. 독서 상태를 고른 뒤 "서재에 담기"로 등록한다.
function BookCard({ book, isAdded, onAddBook }) {
  const [status, setStatus] = useState(STATUS.WANT)
  const selectId = `status-${book.id}`

  return (
    <li className="book-card">
      <BookCover coverId={book.coverId} coverUrl={book.coverUrl} title={book.title} />
      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__meta">
          {book.authors.length > 0 ? book.authors.slice(0, 3).join(', ') : '저자 정보 없음'}
        </p>
        <p className="book-card__meta">{book.year ? `${book.year}년${book.source === 'openlibrary' ? ' 초판' : ''}` : '출판연도 미상'}</p>
        <div className="book-card__actions">
          <label className="sr-only" htmlFor={selectId}>{book.title} 독서 상태</label>
          <select
            id={selectId}
            className="select"
            value={status}
            disabled={isAdded}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button
            className="btn btn--primary"
            type="button"
            disabled={isAdded}
            onClick={() => onAddBook(book, status)}
          >
            {isAdded ? '담김' : '서재에 담기'}
          </button>
        </div>
      </div>
    </li>
  )
}

export default BookCard
