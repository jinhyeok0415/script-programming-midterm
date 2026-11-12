import { useRef, useState } from 'react'
import { STATUS, STATUS_OPTIONS } from '../../constants.js'

const EMPTY_FORM = { title: '', authors: '', year: '', status: STATUS.WANT }

// 검색 결과에 없는 책을 직접 입력해 등록하는 폼. 제목은 필수, 출판연도는 입력했다면 숫자 검증.
// onAddManual이 오류 문구(문자열)를 돌려주면 화면에 보여주고, null이면 등록 성공으로 보고 폼을 비운다.
function ManualAddForm({ onAddManual }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null) // { field, message }
  const titleRef = useRef(null)
  const yearRef = useRef(null)

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    if (error?.field === field) setError(null)
  }

  const fail = (field, message, ref) => {
    setError({ field, message })
    ref.current?.focus()
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const title = form.title.trim()
    if (!title) return fail('title', '제목을 입력해 주세요.', titleRef)

    let year = null
    if (form.year.trim()) {
      year = Number(form.year)
      const thisYear = new Date().getFullYear()
      if (!Number.isInteger(year) || year < 1 || year > thisYear) {
        return fail('year', `출판연도는 1~${thisYear} 사이의 숫자로 입력해 주세요.`, yearRef)
      }
    }

    const authors = form.authors.split(/[,，]/).map((name) => name.trim()).filter(Boolean)
    const message = onAddManual({ title, authors, year, status: form.status })
    if (message) return fail('title', message, titleRef)

    setForm(EMPTY_FORM)
    setError(null)
    titleRef.current?.focus()
  }

  return (
    <details className="manual">
      <summary className="manual__summary">찾는 책이 없나요? 직접 등록하기</summary>
      <form className="manual__form" onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label className="field__label" htmlFor="manual-title">제목 (필수)</label>
          <input
            id="manual-title"
            ref={titleRef}
            className="input"
            type="text"
            value={form.title}
            aria-invalid={error?.field === 'title'}
            aria-describedby={error?.field === 'title' ? 'manual-error' : undefined}
            onChange={handleChange('title')}
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="manual-authors">저자 (여러 명이면 쉼표로 구분)</label>
          <input id="manual-authors" className="input" type="text" value={form.authors} onChange={handleChange('authors')} />
        </div>
        <div className="manual__row">
          <div className="field">
            <label className="field__label" htmlFor="manual-year">출판연도</label>
            <input
              id="manual-year"
              ref={yearRef}
              className="input"
              type="text"
              inputMode="numeric"
              value={form.year}
              aria-invalid={error?.field === 'year'}
              aria-describedby={error?.field === 'year' ? 'manual-error' : undefined}
              onChange={handleChange('year')}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="manual-status">독서 상태</label>
            <select id="manual-status" className="select" value={form.status} onChange={handleChange('status')}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
        {error && <p id="manual-error" className="field__error" role="alert">{error.message}</p>}
        <button className="btn btn--primary" type="submit">서재에 등록</button>
      </form>
    </details>
  )
}

export default ManualAddForm
