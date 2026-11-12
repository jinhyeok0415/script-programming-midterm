// 목록이 비었을 때 보여주는 안내. 제목, 설명, 선택적 행동 버튼/링크를 받는다.
// 6단계에서 stageshow still 일러스트로 교체할 자리(illustration)를 열어 둔다.
function EmptyState({ title, description, illustration, children }) {
  return (
    <div className="empty-state">
      {illustration}
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {children}
    </div>
  )
}

export default EmptyState
