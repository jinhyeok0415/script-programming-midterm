// 도서 검색 출처(provider)가 돌려주는 오류. 화면에 그대로 보여 줄 한국어 메시지와 원인 코드를 가진다.
// code 예: 'AUTH'(인증키 문제), 'HTTP_500'(서버 응답 오류)
export class ProviderError extends Error {
  constructor(message, code = 'UNKNOWN') {
    super(message)
    this.name = 'ProviderError'
    this.code = code
  }
}
