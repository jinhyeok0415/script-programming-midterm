import { useCallback, useMemo, useState } from 'react'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Hero from './components/hero/Hero.jsx'
import FeatureCards from './components/hero/FeatureCards.jsx'
import SourcePicker from './components/search/SourcePicker.jsx'
import SearchBar from './components/search/SearchBar.jsx'
import SearchResults from './components/search/SearchResults.jsx'
import ManualAddForm from './components/forms/ManualAddForm.jsx'
import LibraryStats from './components/library/LibraryStats.jsx'
import LibraryFilter from './components/library/LibraryFilter.jsx'
import LibraryList from './components/library/LibraryList.jsx'
import BookDetailModal from './components/library/BookDetailModal.jsx'
import ConfirmDialog from './components/common/ConfirmDialog.jsx'
import Toast from './components/common/Toast.jsx'
import { useBookSearch } from './hooks/useBookSearch.js'
import { DEFAULT_PROVIDER_ID, PROVIDER_LIST, getProvider, isProviderId } from './api/providers.js'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { FILTER_ALL } from './constants.js'
import { createBook, createManualId, filterAndSortBooks, getStats } from './utils/library.js'

// 앱 루트: 서재 데이터와 화면 상태(필터, 모달, 토스트)를 한곳에서 관리하고 자식에게 내려준다.
// 서재(library)는 검색 카드·목록·통계·모달이 함께 쓰므로 가장 가까운 공통 부모인 App에 둔다.
function App() {
  const [library, setLibrary] = useLocalStorage('bookmark.library', [], Array.isArray)

  // 검색 출처(Open Library / 국립중앙도서관)와 출처별 인증키. 둘 다 이 브라우저의 localStorage에만 저장한다.
  // 인증키는 접속자가 화면에서 직접 입력한 본인 키이며, 소스코드·환경변수·빌드 결과에는 들어 있지 않다.
  const [providerId, setProviderId] = useLocalStorage('bookmark.searchProvider', DEFAULT_PROVIDER_ID, isProviderId)
  const [apiKeys, setApiKeys] = useLocalStorage(
    'bookmark.apiKeys',
    {},
    (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  )
  const provider = getProvider(providerId)
  const search = useBookSearch(provider.id, apiKeys[provider.id])

  // 서재 보기 조건
  const [statusFilter, setStatusFilter] = useState(FILTER_ALL)
  const [libraryQuery, setLibraryQuery] = useState('')
  const [sort, setSort] = useState('recent')

  // 모달 / 확인 다이얼로그 / 토스트
  const [selectedId, setSelectedId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [toast, setToast] = useState(null)

  const libraryIds = useMemo(() => new Set(library.map((book) => book.id)), [library])
  const visibleBooks = useMemo(
    () => filterAndSortBooks(library, { status: statusFilter, query: libraryQuery, sort }),
    [library, statusFilter, libraryQuery, sort],
  )
  const counts = useMemo(() => getStats(library), [library])
  const selectedBook = library.find((book) => book.id === selectedId) ?? null

  const showToast = useCallback((message, action) => {
    setToast({ id: Date.now(), message, ...action })
  }, [])
  const dismissToast = useCallback(() => setToast(null), [])

  // 등록 (Create): 검색 결과에서 담기
  const handleAddBook = (book, status) => {
    if (libraryIds.has(book.id)) return
    setLibrary((prev) => [createBook({ ...book, status }), ...prev])
    showToast(`‘${book.title}’을(를) 서재에 담았어요.`)
  }

  // 등록 (Create): 직접 입력. 오류 문구 또는 null(성공)을 돌려준다.
  const handleAddManual = ({ title, authors, year, status }) => {
    const normalized = title.toLowerCase()
    if (library.some((book) => book.title.trim().toLowerCase() === normalized)) {
      return '같은 제목의 책이 이미 서재에 있어요.'
    }
    setLibrary((prev) => [createBook({ id: createManualId(), title, authors, year, status }), ...prev])
    showToast(`‘${title}’을(를) 서재에 등록했어요.`)
    return null
  }

  // 수정 (Update)
  const handleUpdateBook = (id, changes) => {
    setLibrary((prev) => prev.map((book) => (book.id === id ? { ...book, ...changes } : book)))
    setSelectedId(null)
    showToast('변경 사항을 저장했어요.')
  }

  // 삭제 (Delete): 확인 다이얼로그에서 승인하면 삭제하고, 되돌리기 토스트를 띄운다.
  const handleConfirmDelete = () => {
    const target = pendingDelete
    setLibrary((prev) => prev.filter((book) => book.id !== target.id))
    setPendingDelete(null)
    setSelectedId(null)
    showToast(`‘${target.title}’을(를) 삭제했어요.`, {
      actionLabel: '되돌리기',
      onAction: () => handleUndoDelete(target),
    })
  }

  // 삭제 되돌리기: 삭제한 책 객체를 그대로 다시 넣는다(등록일 유지).
  const handleUndoDelete = (book) => {
    setLibrary((prev) => (prev.some((item) => item.id === book.id) ? prev : [book, ...prev]))
    showToast(`‘${book.title}’을(를) 복구했어요.`)
  }

  // 인증키 저장 / 삭제
  const handleSaveKey = (id, key) => {
    setApiKeys((prev) => ({ ...prev, [id]: key }))
    showToast(`${getProvider(id).label} 인증키를 저장했어요.`)
  }
  const handleClearKey = (id) => {
    setApiKeys((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    showToast(`${getProvider(id).label} 인증키를 삭제했어요.`)
  }

  const handleResetFilters = () => {
    setStatusFilter(FILTER_ALL)
    setLibraryQuery('')
    setSort('recent')
  }

  return (
    <div className="app" id="top">
      <Header />
      <main className="app__main">
        <Hero />
        <FeatureCards />
        <section className="section container" id="search">
          <h2 className="section__title">책 검색</h2>
          <p className="section__desc">제목이나 저자로 검색해 서재에 담아 보세요.</p>
          <SourcePicker
            providers={PROVIDER_LIST}
            providerId={provider.id}
            onProviderChange={setProviderId}
            apiKeys={apiKeys}
            onSaveKey={handleSaveKey}
            onClearKey={handleClearKey}
          />
          <SearchBar
            value={search.query}
            onChange={search.setQuery}
            onSubmit={search.searchNow}
            onClear={search.clear}
          />
          <SearchResults
            status={search.status}
            results={search.results}
            error={search.error}
            activeQuery={search.activeQuery}
            providerLabel={provider.label}
            libraryIds={libraryIds}
            onAddBook={handleAddBook}
            onRetry={search.retry}
          />
          <ManualAddForm onAddManual={handleAddManual} />
        </section>

        <section className="section container" id="library">
          <h2 className="section__title">내 서재</h2>
          <p className="section__desc">담은 책의 독서 상태와 기록을 한곳에서 관리합니다.</p>
          <LibraryStats library={library} />
          <LibraryFilter
            status={statusFilter}
            onStatusChange={setStatusFilter}
            query={libraryQuery}
            onQueryChange={setLibraryQuery}
            sort={sort}
            onSortChange={setSort}
            counts={counts}
          />
          <LibraryList
            books={visibleBooks}
            totalCount={library.length}
            onOpen={setSelectedId}
            onDelete={setPendingDelete}
            onResetFilters={handleResetFilters}
          />
        </section>
      </main>
      <Footer />

      {selectedBook && (
        <BookDetailModal
          key={selectedBook.id}
          book={selectedBook}
          onSave={handleUpdateBook}
          onRequestDelete={setPendingDelete}
          onClose={() => setSelectedId(null)}
        />
      )}
      {pendingDelete && (
        <ConfirmDialog
          title="책을 삭제할까요?"
          message={`‘${pendingDelete.title}’을(를) 서재에서 삭제합니다. 삭제 직후에는 알림의 “되돌리기”로 복구할 수 있어요.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}

export default App
