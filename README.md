# 안계고 오늘의 급식

NEIS OpenAPI에서 안계고등학교의 조식·중식·석식 정보를 불러오는 반응형 웹페이지입니다.

## GitHub에 업로드할 파일

아래 항목을 저장소 최상위에 그대로 업로드하세요.

- `.github`
- `public`
- `src`
- `.env.example`
- `.gitignore`
- `index.html`
- `package.json`
- `pnpm-lock.yaml`
- `vite.config.js`
- `README.md`

`node_modules`, `.tools`, `dist`, `.env` 폴더 및 파일은 업로드하지 않습니다.

## GitHub Pages 배포 방법

1. GitHub에서 새 저장소를 만들고 위 파일들을 `main` 브랜치에 업로드합니다.
2. 저장소의 **Settings → Pages**로 이동합니다.
3. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
4. 저장소의 **Actions** 탭에서 `Deploy to GitHub Pages` 작업이 완료될 때까지 기다립니다.
5. 완료된 작업 또는 **Settings → Pages**에 표시된 공개 주소로 접속합니다.

NEIS API 키를 사용할 경우 **Settings → Secrets and variables → Actions**에서
`VITE_NEIS_API_KEY`라는 Repository secret을 추가하세요. 키가 없어도 공개 API 기본 조회는 가능합니다.

## 로컬 실행

```bash
pnpm install
pnpm dev
```

배포용 빌드 확인:

```bash
pnpm build
```

## 수정 위치

- 화면과 데이터 처리: `src/App.jsx`
- 색상과 반응형 디자인: `src/styles.css`
- GitHub Pages 설정: `.github/workflows/deploy-pages.yml`
- 환경변수 예시: `.env.example`
