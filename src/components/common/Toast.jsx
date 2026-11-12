import { useEffect } from 'react'

const AUTO_CLOSE_MS = 6000

// 화면 아래에 잠깐 뜨는 알림. actionLabel/onAction이 있으면 "되돌리기" 같은 버튼을 보여준다.
// toast.id가 바뀌면(새 알림) 자동 닫힘 타이머를 처음부터 다시 시작한다.
function Toast({ toast, onDismiss }) {
  const toastId = toast?.id

  useEffect(() => {
    if (!toastId) return undefined
    const timer = setTimeout(onDismiss, AUTO_CLOSE_MS)
    return () => clearTimeout(timer)
  }, [toastId, onDismiss])

  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toast && (
        <div className="toast">
          <span className="toast__message">{toast.message}</span>
          {toast.actionLabel && (
            <button className="toast__action" type="button" onClick={toast.onAction}>
              {toast.actionLabel}
            </button>
          )}
          <button className="toast__close" type="button" aria-label="알림 닫기" onClick={onDismiss}>×</button>
        </div>
      )}
    </div>
  )
}

export default Toast
