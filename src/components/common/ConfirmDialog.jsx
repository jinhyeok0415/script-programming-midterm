import Modal from './Modal.jsx'

// 삭제 같은 되돌리기 어려운 동작 전에 한 번 더 확인하는 다이얼로그 (confirm() 대체).
// 실수로 Enter를 눌러도 삭제되지 않도록 처음 포커스는 "취소"에 둔다.
function ConfirmDialog({ title, message, confirmLabel = '삭제', onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel} size="sm">
      <p className="modal__text">{message}</p>
      <div className="modal__footer">
        <button className="btn" type="button" data-autofocus onClick={onCancel}>취소</button>
        <button className="btn btn--danger" type="button" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
