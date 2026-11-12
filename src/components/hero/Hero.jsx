import HeroDemo from './HeroDemo.jsx'

// 랜딩 히어로 섹션: 한 줄 소개 문구와 이동 버튼, 그 아래 커서 애니메이션 데모.
function Hero() {
  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero__copy">
        <h1 id="hero-title" className="hero__title">읽은 책과 읽을 책을 한곳에 기록하세요</h1>
        <p className="hero__lead">
          책을 검색해 서재에 담고, 별점과 한 줄 메모로 독서 기록을 남겨요.
        </p>
        <div className="hero__actions">
          <a className="btn btn--primary" href="#search">책 검색하기</a>
          <a className="btn" href="#library">내 서재 보기</a>
        </div>
      </div>
      <div className="hero__demo" id="hero-demo" role="img" aria-label="책을 검색해 서재에 담고 별점과 메모를 남기는 과정을 보여 주는 데모 애니메이션">
        <HeroDemo />
      </div>
    </section>
  )
}

export default Hero
