// 검색 출처 선택(라디오). 선택한 출처를 쓸 수 없는 상태(인증키 미설정)면 그 사실을 안내한다.
// 인증키는 화면에서 입력받지 않고 환경변수(.env.local)로 설정한다.
function SourcePicker({ providers, providerId, onProviderChange }) {
  const provider = providers.find((item) => item.id === providerId) ?? providers[0]

  return (
    <fieldset className="source">
      <legend className="source__legend">검색 출처</legend>
      <div className="source__options">
        {providers.map((item) => (
          <label className="source__option" key={item.id}>
            <input
              className="source__radio"
              type="radio"
              name="search-source"
              value={item.id}
              checked={item.id === provider.id}
              onChange={() => onProviderChange(item.id)}
            />
            <span className="source__pill">{item.label}</span>
          </label>
        ))}
      </div>
      <p className="source__desc">{provider.description}</p>
      {!provider.available && (
        <p className="source__notice" role="status">
          {provider.label} 검색은 아직 인증키가 설정되지 않아 사용할 수 없어요. 지금은 다른 검색 출처를 이용해 주세요.
        </p>
      )}
    </fieldset>
  )
}

export default SourcePicker
