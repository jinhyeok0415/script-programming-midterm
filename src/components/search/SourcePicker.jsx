import { useState } from 'react'

// 인증키 입력 폼. 입력 중인 값(draft)은 이 폼 안에서만 들고 있다가 "저장"을 눌러야 앱에 반영한다.
// (키를 한 글자씩 바꿀 때마다 검색이 다시 실행되지 않도록)
// 부모에서 key={provider.id}를 주어 출처가 바뀌면 입력값이 비워진다.
function KeyForm({ provider, hasKey, onSaveKey, onClearKey }) {
  const [draft, setDraft] = useState('')
  const inputId = `source-key-${provider.id}`

  const handleSubmit = (event) => {
    event.preventDefault()
    const key = draft.trim()
    if (!key) return
    onSaveKey(provider.id, key)
    setDraft('')
  }

  return (
    <form className="source__key" onSubmit={handleSubmit}>
      <label className="field__label" htmlFor={inputId}>{provider.label} {provider.keyLabel}</label>
      <div className="source__key-row">
        <input
          id={inputId}
          className="input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={draft}
          placeholder={hasKey ? '저장된 키가 있어요. 바꾸려면 새 키를 붙여 넣으세요' : '본인의 인증키를 붙여 넣으세요'}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="btn btn--primary" type="submit" disabled={!draft.trim()}>저장</button>
        {hasKey && (
          <button className="btn" type="button" onClick={() => onClearKey(provider.id)}>키 삭제</button>
        )}
      </div>
      <p className="source__hint" role="status">
        {hasKey ? '✓ 인증키가 저장되어 있어요. ' : ''}
        키는 이 브라우저(localStorage)에만 저장되고 {provider.label} 서버로만 전달돼요. 공용 PC라면 사용 후 &lsquo;키 삭제&rsquo;를 눌러 주세요.{' '}
        <a href={provider.keyGuideUrl} target="_blank" rel="noreferrer">인증키 발급 안내</a>
      </p>
    </form>
  )
}

// 검색 출처 선택(라디오) + 선택한 출처가 인증키를 요구하면 키 입력 폼을 보여 준다.
function SourcePicker({ providers, providerId, onProviderChange, apiKeys, onSaveKey, onClearKey }) {
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
      {provider.needsKey && (
        <KeyForm
          key={provider.id}
          provider={provider}
          hasKey={Boolean(apiKeys[provider.id])}
          onSaveKey={onSaveKey}
          onClearKey={onClearKey}
        />
      )}
    </fieldset>
  )
}

export default SourcePicker
