import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages 는 https://<계정>.github.io/<저장소 이름>/ 아래에서 서비스된다.
// 그래서 빌드 결과(JS·CSS 파일)의 주소 앞에 저장소 이름을 붙여야 한다(base).
//   - npm run build   : 저장소 경로를 붙인다.
//   - npm run preview : 빌드 결과를 확인하는 명령이라 같은 경로로 서비스한다. (vite preview 도 command 가 'serve'로 오므로 isPreview 로 구분)
//   - npm run dev     : 개발 서버는 기존처럼 루트(/)에서 동작한다.
const REPO_BASE = '/script-programming-midterm/'

// https://vite.dev/config/
export default defineConfig(({ command, isPreview }) => ({
  plugins: [react()],
  base: command === 'build' || isPreview ? REPO_BASE : '/',
}))
