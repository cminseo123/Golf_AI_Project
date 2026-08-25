# 더 골프 코드 — 수정 가이드

thegolfcode.com 소스. 이 문서는 **로컬에서 고쳐서 배포하는 방법**만 다룬다.

---

## 0. 딱 하나만 기억할 것

**테스트 앱을 고칠 때는 `index.html`이 아니라 `src/app.jsx`를 고치고, 반드시 `npm run build`를 돌린다.**

기사·소개·약관 같은 정적 페이지는 해당 HTML을 직접 고치면 되고 빌드가 필요 없다.

---

## 1. 로컬에서 미리보기

PowerShell을 열고 프로젝트 폴더에서:

```powershell
python -m http.server 8000
```

브라우저에서 http://127.0.0.1:8000 접속. 끌 때는 터미널에서 `Ctrl+C`.

> 파일을 더블클릭해서 여는 방식(`file://`)은 쓰지 말 것. 서비스워커와 일부 기능이 동작하지 않아 실제와 다르게 보인다.

수정하고 브라우저를 새로고침하면 바로 반영된다. 반영이 안 되면 `Ctrl+Shift+R`(강력 새로고침).

---

## 2. 뭘 고칠 때 어느 파일인가

### 빌드가 **필요한** 것 — 테스트 앱

전부 `src/app.jsx` 안에 있다. (총 1,354줄)

| 고치고 싶은 것 | 위치 |
|---|---|
| 골퍼 모드 문항 | `QUESTIONS_GOLF` (328행) |
| 초보 모드 문항 | `QUESTIONS_GENERAL` (340행) |
| 유형별 결과 내용 | `RESULT_TYPES` (351행) |
| 결과에서 추천하는 기사 | `RESULT_ARTICLE_RECOMMENDATIONS` (420행) |
| 화면 문구 (8개 국어) | `UI_TEXT` (16행) |
| 점수 축 정의 | `SCORING_AXES` (325행) |
| 베타 신청 문구 | `BETA_TEXT` (503행) |

고친 뒤:

```powershell
npm run build
```

`assets/app.<해시>.js`가 새로 만들어지고 `index.html`의 스크립트 태그가 자동으로 갱신된다.

### 빌드가 **필요 없는** 것 — 정적 페이지

| 고치고 싶은 것 | 파일 |
|---|---|
| 골프 팁 기사 20편 | `golf-*.html` |
| 기사 목록 페이지 | `articles.html` |
| 유형 상세 페이지 6개 | `result-*.html` |
| 서비스 소개 | `about.html` / `about_en.html` |
| 개인정보·약관 | `privacy.html` / `terms.html` (+`_en`) |
| 정적 페이지 공통 테마 | `site-theme.css` / `site-theme.js` |
| 캐시·보안 헤더 | `_headers` |
| 검색엔진용 주소 목록 | `sitemap.xml` |

---

## 3. 배포

```powershell
git add .
git commit -m "수정 내용 요약"
git push
```

`master`에 푸시하면 Cloudflare Pages가 자동으로 빌드·배포한다. 보통 1~2분.

### 배포했는데 사이트가 그대로일 때

Cloudflare 엣지 캐시가 옛 파일을 붙잡고 있는 것이다. 거의 매번 겪는다.

**Cloudflare 대시보드 → 캐싱 → 구성 → Purge Everything**

확인은 브라우저 시크릿 탭에서. 일반 탭은 본인 브라우저 캐시가 남아 헷갈린다.

---

## 4. 자주 하는 실수

**`index.html`의 앱 코드를 직접 고쳤다**
→ 그 안에 이제 앱 코드가 없다. 스크립트를 불러오는 태그 한 줄뿐이다. `src/app.jsx`를 고칠 것.

**`src/app.jsx`를 고치고 `npm run build`를 안 돌리고 푸시했다**
→ 사이트에 반영되지 않는다. 빌드를 돌리고 다시 커밋·푸시하면 된다.

**`npm run build`에서 에러가 난다**
→ 처음 한 번은 아래를 실행해야 한다.
```powershell
npm install
```

**JSX 문법 에러**
→ `npm run build`가 몇 번째 줄이 잘못됐는지 알려준다. 그 줄을 보면 대개 괄호나 따옴표가 안 맞는 것이다.

---

## 5. 참고

- `assets/` 안의 파일은 **직접 만들거나 지우지 말 것.** `npm run build`가 관리한다.
- 파일명에 붙는 해시(`app.c66cef3c.js`)는 내용이 바뀌면 자동으로 바뀐다. 방문자 브라우저에 옛 코드가 남는 걸 막는 장치다.
- `node_modules/`는 Git에 올라가지 않는다. 정상이다.
