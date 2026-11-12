// 히어로·기능 카드·빈 상태 일러스트가 함께 쓰는 작은 그림 부품.
// stageshow의 가짜(authored) 화면용이며, 실제 앱 기능은 src/components 의 진짜 컴포넌트가 담당한다.

// 책 표지: 이미지 대신 책등이 있는 단색 표지
export function Cover({ tone = 'navy', size }) {
  return <span className="bm-cover" data-tone={tone} data-size={size} aria-hidden />
}

// 별점(읽기 전용 그림). target을 주면 별마다 커서 타깃(data-target="<target>-<n>")이 붙는다.
export function Stars({ value, target }) {
  return (
    <span className="bm-stars" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className="bm-star"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          data-on={n <= value || undefined}
          data-target={target ? `${target}-${n}` : undefined}
          data-cursor={target ? 'pointer' : undefined}
        >
          <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
        </svg>
      ))}
    </span>
  )
}
