// GitHub Pages 용 후처리
// - 404.html: /sales 같은 하위 주소로 바로 들어오거나 새로고침해도 앱이 뜨도록 index.html 을 복사
// - .nojekyll: GitHub Pages 의 Jekyll 처리를 끄고 파일을 그대로 서비스
import { copyFileSync, writeFileSync } from 'node:fs'

copyFileSync('dist/index.html', 'dist/404.html')
writeFileSync('dist/.nojekyll', '')
console.log('GitHub Pages 준비 완료: dist/404.html, dist/.nojekyll')
