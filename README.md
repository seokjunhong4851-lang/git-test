# 슬기로운 TSV 생활

TSV 팀원들이 공지, 멤버 정보, 근태 일정, 근무표와 회식 장소를 함께 관리하기 위한 웹 대시보드입니다.

이 문서는 코딩을 처음 접하는 사람도 프로젝트를 실행하고 수정할 수 있도록 작성했습니다. 앞으로 기능이나 구조가 바뀌면 코드와 함께 이 문서도 반드시 수정합니다.

## 1. 현재 구현된 내용

- 큰 제목: `슬기로운 TSV 생활`
- 전체 폭 메뉴: `공지사항`
- 4개 메뉴: `멤버 소개`, `근태캘린더`, `근무표 사다리`, `회식 장소`
- PC, 태블릿, 휴대전화 크기에 맞춰 자동으로 바뀌는 화면
- 각 메뉴를 누르면 독립된 기능 페이지로 이동
- 메뉴를 한 파일에서 추가, 수정, 숨김 처리할 수 있는 구조

현재 각 기능 페이지는 자리만 만들어 둔 상태입니다. 실제 데이터 저장 기능은 Supabase를 연결하는 단계에서 추가합니다.

## 2. 사용 기술

- **Next.js / React**: 화면과 페이지 구성
- **TypeScript**: 실수를 줄이기 위한 프로그래밍 언어
- **CSS**: 색상, 간격, 카드와 반응형 화면 디자인
- **pnpm**: 필요한 외부 패키지 설치 및 실행
- **Git**: 코드 변경 이력과 백업 관리
- **Supabase(추후 연결)**: 공지사항과 일정 등 실제 데이터 저장
- **Vercel(추후 연결)**: 팀원이 링크로 접속할 수 있도록 사이트 배포

## 3. 프로젝트 구조

```text
dashboard/
├─ app/
│  ├─ page.tsx                    # 홈 화면: 하위 기능을 모아 보여주는 중앙 파일
│  ├─ layout.tsx                  # 사이트 제목, 언어와 공통 설정
│  ├─ globals.css                 # 전체 디자인과 반응형 화면
│  ├─ config/
│  │  └─ menu.ts                  # 홈 화면 메뉴 목록을 관리하는 핵심 파일
│  ├─ components/
│  │  ├─ DashboardMenu.tsx        # menu.ts를 읽어서 홈 카드 생성
│  │  └─ FeaturePlaceholder.tsx   # 개발 전 기능 페이지의 공통 화면
│  ├─ notices/page.tsx            # 공지사항 담당 폴더
│  ├─ members/page.tsx            # 멤버 소개 담당 폴더
│  ├─ attendance/page.tsx         # 근태캘린더 담당 폴더
│  ├─ ladder/page.tsx             # 근무표 사다리 담당 폴더
│  └─ dining/page.tsx             # 회식 장소 담당 폴더
├─ public/                         # 이미지와 공개 파일
├─ package.json                    # 실행 명령과 패키지 정보
└─ README.md                       # 현재 문서
```

Python의 `app.py`가 여러 함수를 불러오는 것과 비슷하게 `app/page.tsx`는 홈 화면을 조립하는 역할만 합니다. 실제 메뉴 정보는 `app/config/menu.ts`, 개별 기능은 각 하위 폴더에서 관리합니다.

## 4. 처음 실행하는 방법

### 준비물

1. VS Code
2. Node.js 22 이상
3. Git
4. pnpm

Node.js 설치 후 PowerShell에서 다음 명령으로 pnpm을 설치할 수 있습니다.

```powershell
npm install -g pnpm
```

### 프로젝트 열기

VS Code에서 `C:\Users\seokj\python\dashboard` 폴더를 엽니다.

VS Code 상단 메뉴에서 `터미널 > 새 터미널`을 선택하고 다음 명령을 차례대로 실행합니다.

```powershell
pnpm install
pnpm dev
```

터미널에 표시되는 `Local` 주소를 브라우저에서 열면 됩니다. 보통 `http://localhost:3000` 형태입니다.

개발 서버를 종료하려면 터미널에서 `Ctrl + C`를 누릅니다.

## 5. 메뉴 수정 방법

홈 메뉴는 `app/config/menu.ts`의 `dashboardMenus` 배열에서 관리합니다.

### 이름 또는 아이콘 수정

수정할 메뉴의 `title`과 `icon` 값을 바꿉니다.

```ts
{
  id: "dining",
  title: "맛집 투표",
  icon: "🍜",
  href: "/dining",
  enabled: true,
}
```

`id`와 `href`는 폴더 및 주소와 연결되므로 단순한 이름 변경 때는 수정하지 않는 것이 안전합니다.

### 메뉴 임시 숨김

삭제하기 전에 다음과 같이 `enabled`를 `false`로 바꾸는 방법을 권장합니다.

```ts
enabled: false,
```

코드와 페이지는 남아 있지만 홈 화면에서는 보이지 않습니다. 다시 표시하려면 `true`로 되돌립니다.

### 새 메뉴 추가

1. `app/config/menu.ts`에서 기존 항목 하나를 복사합니다.
2. `id`, `title`, `description`, `icon`, `href`를 새 값으로 바꿉니다.
3. `app` 아래에 `href`와 같은 이름의 폴더를 만듭니다.
4. 새 폴더 안에 `page.tsx`를 만듭니다.

예를 들어 `자료실` 메뉴를 추가한다면 주소를 `/resources`로 정하고 `app/resources/page.tsx`를 만듭니다.

```tsx
import { FeaturePlaceholder } from "../components/FeaturePlaceholder";

export default function ResourcesPage() {
  return (
    <FeaturePlaceholder
      icon="📁"
      title="자료실"
      description="팀 자료를 모아두는 공간입니다."
    />
  );
}
```

### 메뉴 완전 삭제

1. 먼저 아래의 Git 백업 절차를 실행합니다.
2. `app/config/menu.ts`에서 메뉴 항목을 제거합니다.
3. 연결된 `app/기능이름` 폴더를 제거합니다.
4. `pnpm build`로 오류가 없는지 확인합니다.

## 6. 네 명이 함께 개발하는 방법

한 사람이 하나의 기능 폴더를 주로 담당하는 방식을 권장합니다.

- 담당자 1: `app/notices`
- 담당자 2: `app/members`
- 담당자 3: `app/attendance`
- 담당자 4: `app/ladder` 또는 `app/dining`

`app/page.tsx`, `app/config/menu.ts`, `app/globals.css`는 모든 기능에 영향을 줄 수 있는 공용 파일입니다. 공용 파일을 수정할 때는 팀원에게 먼저 알리고 Git Pull Request로 검토하는 것이 좋습니다.

각 기능이 커지면 해당 폴더 안에서 다음처럼 다시 나눌 수 있습니다.

```text
app/notices/
├─ page.tsx          # 화면 조립
├─ components/       # 공지사항 전용 화면 부품
├─ actions/          # 저장·수정·삭제 동작
└─ types.ts          # 공지사항 데이터 형식
```

## 7. Git으로 백업하는 방법

Git은 코드를 이전 상태로 되돌릴 수 있게 변경 이력을 남깁니다. 중요한 수정 전후에 백업 지점을 만드는 습관이 좋습니다.

현재 변경 상태 확인:

```powershell
git status
```

변경 파일을 백업 대상으로 추가:

```powershell
git add .
```

백업 지점 생성:

```powershell
git commit -m "홈 대시보드 초기 화면 완성"
```

GitHub 저장소가 연결된 뒤에는 다음 명령으로 원격 저장소에도 올립니다.

```powershell
git push
```

주의: `.env`처럼 비밀 키가 담긴 파일은 절대로 GitHub에 올리지 않습니다.

## 8. 오류 확인 방법

화면을 수정한 뒤 다음 명령을 실행합니다.

```powershell
pnpm build
```

빌드가 성공하면 배포 가능한 상태라는 뜻입니다. 오류가 나오면 터미널의 첫 번째 오류 메시지와 파일 위치를 먼저 확인합니다.

## 9. 앞으로의 개발 순서

1. 홈 화면과 메뉴 구조 확인
2. GitHub 저장소 연결 및 첫 백업
3. Supabase 프로젝트와 데이터 표 설계
4. 공지사항 작성·수정·삭제 기능 구현
5. 나머지 기능을 담당 폴더별로 구현
6. Supabase 보안 정책 설정
7. Vercel에 연결하여 배포

SSO는 초기 버전에서 사용하지 않습니다. 하지만 링크를 아는 사람이 데이터를 수정할 수 있는 상태로 공개하면 위험하므로, 실제 외부 배포 전에는 최소한의 편집 비밀번호 또는 Supabase 로그인과 RLS 정책을 추가해야 합니다.
