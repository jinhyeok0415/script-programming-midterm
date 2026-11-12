import { useState } from 'react'
import Modal from '../common/Modal.jsx'
import BookCover from '../common/BookCover.jsx'
import StarRating from '../common/StarRating.jsx'
import { STATUS, STATUS_OPTIONS } from '../../constants.js'
import { todayString } from '../../utils/date.js'

const MEMO_MAX_LENGTH = 100

// 책 상세 모달: 독서 상태·별점·한 줄 메모·완독일을 수정한다.
// 입력 중인 값은 draft로 따로 들고 있다가 "저장"을 눌렀을 때만 서재에 반영한다.
// (부모에서 key={book.id}를 주어 책이 바뀌면 draft가 새로 만들어진다.)
function BookDetailModal({ book, onSave, onRequestDelete, onClose }) {
  const [draft, setDraft] = useState({
    status: book.status,
    rating: book.rating,
    memo: book.memo,
    finishedAt: book.finishedAt ?? '',
  })

  const updateDraft = (changes) => setDraft((prev) => ({ ...prev, ...changes }))

  // "다 읽음"으로 바꾸면 완독일을 오늘로 채워 준다.
  const handleStatusChange = (event) => {
    const status = event.target.value
    updateDraft({
      status,
      finishedAt: status === STATUS.DONE && !draft.finishedAt ? todayString() : draft.finishedAt,
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(book.id, {
      status: draft.status,
      rating: draft.rating,
      memo: draft.memo.trim(),
      finishedAt: draft.status === STATUS.DONE && draft.finishedAt ? draft.finishedAt : null,
    })
  }

  return (
    <Modal title="책 상세" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="detail__summary">
          <BookCover coverId={book.coverId} coverUrl={book.coverUrl} title={book.title} />
          <div>
            <h3 className="detail__title">{book.title}</h3>
            <p className="detail__meta">{book.authors.join(', ') || '저자 정보 없음'}</p>
            {book.year && <p className="detail__meta">{book.year}년</p>}
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="detail-status">독서 상태</label>
          <select id="detail-status" className="select" value={draft.status} onChange={handleStatusChange}>
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <span className="field__label">별점</span>
          <div className="detail__rating">
            <StarRating value={draft.rating} onChange={(rating) => updateDraft({ rating })} label="별점 선택" />
            <span className="field__hint">
              {draft.rating ? `${draft.rating}점 (같은 별을 다시 누르면 취소)` : '아직 평가하지 않았어요'}
            </span>
          </div>
        </div>

        <div className="field">
          <label className="field__label" htmlFor="detail-memo">한 줄 메모</label>
          <input
            id="detail-memo"
            className="input"
            type="text"
            maxLength={MEMO_MAX_LENGTH}
            placeholder="이 책에 대한 생각을 한 줄로 남겨 보세요"
            value={draft.memo}
            onChange={(event) => updateDraft({ memo: event.target.value })}
          />
          <span className="field__hint">{draft.memo.length}/{MEMO_MAX_LENGTH}</span>
        </div>

        {draft.status === STATUS.DONE && (
          <div className="field">
            <label className="field__label" htmlFor="detail-finished">완독일</label>
            <input
              id="detail-finished"
              className="input"
              type="date"
              max={todayString()}
              value={draft.finishedAt}
              onChange={(event) => updateDraft({ finishedAt: event.target.value })}
            />
          </div>
        )}

        <div className="modal__footer modal__footer--split">
          <button className="btn btn--ghost-danger" type="button" onClick={() => onRequestDelete(book)}>삭제</button>
          <div className="modal__footer-group">
            <button className="btn" type="button" onClick={onClose}>취소</button>
            <button className="btn btn--primary" type="submit">저장</button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

export default BookDetailModal
