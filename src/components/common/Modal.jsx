import { useEffect, useId, useRef } from 'react'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

// 공통 모달: Esc / 바깥 클릭으로 닫기, 열릴 때 포커스 이동, Tab 포커스 가두기,
// 닫힐 때 원래 포커스 복원, 모달이 열려 있는 동안 배경 스크롤 잠금.
function Modal({ title, onClose, children, size = 'md' }) {
  const dialogRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current

    const target = dialog.querySelector('[data-autofocus]') ?? dialog.querySelector(FOCUSABLE) ?? dialog
    target.focus()
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return

    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)]
    if (items.length === 0) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  // mouseDown으로 판단해, 입력창에서 드래그하다 바깥에서 놓아도 닫히지 않게 한다.
  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropMouseDown}>
      <div
        ref={dialogRef}
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className="modal__header">
          <h2 id={titleId} className="modal__title">{title}</h2>
          <button className="modal__close" type="button" aria-label="닫기" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
