# 슬기로운 TSV 생활

팀원들이 공지사항, 멤버, 근태 일정, 회식 후보를 함께 관리하는 Next.js 대시보드입니다. 코드는 GitHub에 보관하고, Vercel에서 웹사이트를 실행하며, 사용자가 입력한 데이터는 Supabase에 공동 저장합니다.

## 서비스 구성

```text
로컬 PC의 코드 → GitHub → Vercel 자동 배포
                         ↕
                  Supabase 공동 데이터
```

- GitHub: 코드 변경 이력과 백업
- Vercel: 사이트 빌드와 배포
- Supabase: 공지, 멤버, 근태, 회식 후보 데이터 저장
- 브라우저 `localStorage`: Supabase 환경 변수가 없을 때만 개발용 임시 저장

## 구현된 기능

- 공지사항 추가·삭제 및 메인 화면 최근 공지 3개 연결
- 멤버 추가·삭제와 연간 연차 관리
- FullCalendar 기반 근태 일정 추가·삭제
- 토요일 파란색, 일요일·공휴일 빨간색 표시
- 연차·근무·GY·기타 일정 색상 구분
- 실제 사다리 모양의 근무표 사다리 게임
- H3 Gate 주변 음식점 검색과 회식 후보 공동 저장
- 모든 하위 페이지의 `메인으로 돌아가기` 이동
- 서로 다른 PC와 브라우저 사이의 Supabase 실시간 동기화
- 기존 브라우저 저장 데이터를 Supabase로 자동 이전

## 폴더 구조

```text
dashboard/
├─ app/
│  ├─ page.tsx                       # 메인 요약 화면
│  ├─ config/menu.ts                 # 메뉴 이름·아이콘·링크 설정
│  ├─ components/                    # 공통 화면 부품
│  ├─ hooks/useSharedCollection.ts   # Supabase 공동 CRUD와 자동 이전
│  ├─ lib/supabase.ts                # Supabase 클라이언트 생성
│  ├─ notices/                       # 공지사항
│  ├─ members/                       # 멤버 관리
│  ├─ attendance/                    # 근태 캘린더
│  ├─ ladder/                        # 사다리 게임
│  ├─ dining/                        # 회식 장소
│  └─ api/                           # 공휴일·음식점 서버 API
├─ supabase/schema.sql               # 데이터베이스 구조와 보안 정책 백업
├─ scripts/check-site.mjs            # 배포 주소 자동 점검
├─ .env.example                      # 환경 변수 이름 예시
└─ README.md
```

## 처음 실행하는 방법

필요 프로그램은 Git, Node.js 22 이상, pnpm입니다.

```powershell
cd C:\Users\seokj\python\dashboard
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

브라우저에서 `http://localhost:3000`을 엽니다. 서버를 종료하려면 실행 중인 터미널에서 `Ctrl + C`를 누릅니다.

## 환경 변수

`.env.local`에는 다음 값을 입력합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://프로젝트번호.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
KAKAO_REST_API_KEY=
```

`NEXT_PUBLIC_`이 붙은 두 값은 Supabase의 공개용 연결 정보입니다. `KAKAO_REST_API_KEY`는 비밀값이므로 외부에 공개하거나 GitHub에 올리면 안 됩니다. `.env.local`은 `.gitignore`에 포함되어 Git에 올라가지 않습니다.

배포용 공개 연결 정보는 `.env.production`에도 들어 있습니다. 이 파일에는 브라우저에 공개 가능한 Supabase URL과 publishable 키만 넣을 수 있습니다. 카카오 키, Supabase `service_role`, secret 키 등 비밀값은 절대 추가하지 않습니다. Vercel 대시보드 환경 변수로 이전할 때는 `.env.production`의 값과 중복되지 않게 관리합니다.

## 공동 저장 동작

`useSharedCollection`이 다음 컬렉션을 `shared_items` 테이블에 저장합니다.

- `tsv-notices`: 공지사항
- `tsv-members`: 멤버와 연차
- `tsv-schedules`: 근태 일정
- `tsv-dining-places`: 회식 후보

사이트를 처음 열면 이전 버전의 브라우저 `localStorage` 데이터를 발견해 Supabase로 한 번 이전한 뒤 로컬 복사본을 제거합니다. 여러 브라우저가 동시에 열려 있으면 Supabase Realtime으로 변경 내용을 다시 불러옵니다.

## 매우 중요한 보안 안내

현재 요구사항에 따라 SSO와 별도 로그인 없이 사용하도록 구성되어 있습니다. 따라서 사이트 주소를 아는 사람은 데이터를 조회·추가·수정·삭제할 수 있습니다.

- 회사 기밀, 개인정보, 민감한 인사정보는 입력하지 않습니다.
- 주소를 공개 게시물에 공유하지 않습니다.
- 정식 사내 운영 전에는 사내 SSO 또는 Supabase Auth를 연결합니다.
- 인증을 추가할 때 `anon` CRUD 정책을 제거하고 사용자·팀 기반 RLS 정책으로 교체합니다.
- `service_role` 또는 secret 키를 `NEXT_PUBLIC_` 변수나 프론트엔드 코드에 절대 넣지 않습니다.

## GitHub 작업 방법

작업을 시작하기 전 최신 코드를 받습니다.

```powershell
git switch main
git pull
git switch -c feature/담당기능
```

작업 후 검사하고 저장합니다.

```powershell
pnpm lint
pnpm build
git status
git add .
git commit -m "변경 내용을 설명하는 한글 메시지"
git push -u origin feature/담당기능
```

4명이 함께 작업할 때 권장 담당 영역:

- 담당자 1: `app/notices`
- 담당자 2: `app/members`
- 담당자 3: `app/attendance`
- 담당자 4: `app/ladder`, `app/dining`

`app/page.tsx`, `app/config`, `app/components`, `app/hooks`, `app/lib`, `app/globals.css`는 공용 영역이므로 수정 전에 팀에 알리고 Pull Request에서 함께 검토합니다.

## 메뉴 수정·추가·삭제·백업

메뉴 카드 설정은 `app/config/menu.ts`에 모여 있습니다.

- 이름 변경: `title`
- 설명 변경: `description`
- 아이콘 변경: `icon`
- 페이지 주소 변경: `href`
- 임시 숨김: `enabled: false`
- 다시 표시: `enabled: true`

기능을 삭제하기 전에는 새 Git 커밋으로 백업합니다. 새 메뉴를 추가할 때는 설정 항목과 `app/새주소/page.tsx`를 함께 추가합니다.

## 데이터베이스 구조 백업

`supabase/schema.sql`은 현재 데이터베이스의 테이블과 정책을 재현하기 위한 문서입니다. 실제 스키마를 변경하면 이 파일도 같은 커밋에서 수정합니다. 데이터 자체의 정기 백업은 Supabase 대시보드의 백업 기능 또는 SQL 내보내기를 사용합니다.

## 검사와 배포 확인

```powershell
pnpm lint
pnpm build
pnpm check:site -- https://wise-tsv-dashboard.vercel.app
```

Vercel이 GitHub의 `main` 브랜치와 연결되어 있으면 `main`에 반영된 커밋이 자동 배포됩니다. 배포 후 공지 하나를 추가하고 다른 브라우저에서 보이는지 확인하면 공동 저장까지 검증할 수 있습니다.

## 문제 해결

- `gh 명령을 찾을 수 없음`: VS Code와 PowerShell을 완전히 다시 열거나 `C:\Program Files\GitHub CLI\gh.exe`를 직접 실행합니다.
- `gh token is invalid`: `gh auth login -h github.com`으로 다시 로그인합니다.
- 데이터가 브라우저마다 다름: Vercel 환경 변수 두 개가 모든 환경에 등록됐는지 확인하고 재배포합니다.
- `permission denied for table`: Supabase의 `GRANT`와 RLS 정책이 `supabase/schema.sql`과 같은지 확인합니다.
- 화면은 열리지만 변경이 실시간 반영되지 않음: 새로고침 후 Supabase Realtime에서 `shared_items`가 활성화되어 있는지 확인합니다.
- 배포 실패: Vercel 빌드 로그에서 첫 번째 오류를 확인하고 로컬에서 `pnpm build`를 다시 실행합니다.
