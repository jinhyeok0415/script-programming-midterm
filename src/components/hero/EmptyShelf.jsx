import { Stage, Window } from './kit.js'
import './stageLook.css'
import './cards.css'

// 서재가 비었을 때의 일러스트(still): 책이 꽂힐 자리를 점선으로 보여 주는 작은 창.
// stageshow 규칙상 빈 상태에서만 회색 그림을 허용하며, 지어낸 일러스트 대신 앱 창의 일부를 잘라 쓴다.
function EmptyShelf() {
  return (
    <div className="bm-empty">
      <Stage width={300} height={160} className="bm" role="img" aria-label="아직 책이 꽂히지 않은 빈 책장">
        {() => (
          <Window chrome="hairline" url="bookmark.app" className="bm-empty__window">
            <div className="bm-empty__shelf" data-crop>
              {[0, 1, 2, 3].map((i) => (
                <span className="bm-empty__slot" key={i} />
              ))}
            </div>
            <div className="bm-empty__plank" />
          </Window>
        )}
      </Stage>
    </div>
  )
}

export default EmptyShelf
