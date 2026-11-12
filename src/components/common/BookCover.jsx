import { useState } from 'react'
import { getCoverUrl } from '../../api/openLibrary.js'

// 책 표지 이미지. 표지 주소(coverUrl, 국내 도서관 API)나 Open Library 표지 번호(coverId)로 그린다.
// 둘 다 없거나 이미지 로딩에 실패하면 대체 표지를 보여준다.
function BookCover({ coverId, coverUrl, title }) {
  const [failed, setFailed] = useState(false)
  const url = coverUrl ?? getCoverUrl(coverId)

  if (!url || failed) {
    // 대체 표지에는 제목의 첫 글자(또는 숫자)를 쓴다. "(만화) 어린왕자"처럼 기호로 시작하면 기호는 건너뛴다.
    const initial = [...title].find((char) => /[\p{L}\p{N}]/u.test(char)) ?? title.slice(0, 1)
    return (
      <div className="cover cover--empty" role="img" aria-label={`${title} 표지 없음`}>
        <span>{initial}</span>
      </div>
    )
  }

  return (
    <img
      className="cover"
      src={url}
      alt={`${title} 표지`}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  )
}

export default BookCover
