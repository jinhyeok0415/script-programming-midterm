// 오늘 날짜를 "YYYY-MM-DD" (로컬 시간 기준)로 돌려준다. <input type="date"> 값 형식과 같다.
export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
