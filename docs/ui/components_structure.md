# MyVoca 프론트엔드 UI 컴포넌트 아키텍처 가이드

본 문서는 MyVoca 어플리케이션의 디렉토리 구조 복잡성을 완화하고 리액트 컴포넌트, 공용 함수, 정적 리소스의 경계를 명확히 하기 위해 개선된 **3차 아키텍처(src/ui, src/common, src/assets)** 디렉토리 및 컴포넌트 구조를 정의합니다.

---

## 1. 디렉토리 구조 요약

프로젝트 루트의 `src/` 디렉토리는 역할에 따라 다음과 같이 3개의 최상위 카테고리로 엄격히 분리되었습니다.

```text
src/
├── ui/              # 리액트 UI 뷰 및 스타일 레이어
│   ├── app/         # 전역 상태, 라우터 설정, 글로벌 스타일 (App, router, GlobalStyle)
│   ├── common/      # 프로젝트 공용 UI 컴포넌트 및 레이아웃 (components, layout, hooks, setup)
│   └── services/    # 각 도메인별 주요 서비스 화면 (Home, Play, Voca, Settings)
├── common/          # 도메인 비특이적 공용 API 및 유틸리티 함수
│   ├── api/         # Supabase 및 Local Storage 등 데이터 영속성 API (facade, guest, user)
│   └── utils/       # 순수 독립 유틸리티 함수 (shuffleArray 등)
└── assets/          # 정적 그래픽/폰트 에셋 및 아이콘
    └── iconList.jsx # SVG 아이콘 모음집
```

---

## 2. 세부 디렉토리 역할 및 규칙

### 1) `src/ui/` (UI & Style Layer)
사용자 화면을 구성하고 렌더링하는 순수 프론트엔드 리액트 레이어입니다.

*   **`ui/app/`**:
    *   `App.jsx`: 애플리케이션 최상위 컨텍스트 공급자 및 공통 레이아웃 배치
    *   `GlobalStyle.js`: 글로벌 CSS 및 전역 스타일 선언
    *   `router/`: 라우터 매핑 객체 (`router.jsx`) 및 로더 함수 분리
*   **`ui/common/`**:
    *   `components/`: 버튼, 진행바 등 순수 공용 컴포넌트
    *   `Layout/`: 헤더, 로딩, 내비게이션, 알림 목록 등 핵심 레이아웃 프레임 (각각 개별 격리 폴더 및 스타일 파일 구조)
    *   `hooks/`: UI 전반에 재사용되는 훅 (`useWord`, `useMyParam`, `useTheme` 등)
    *   `Setup/`: 온보딩 과정 전용 공통 컴포넌트 (`Nick`, `Data`로 축약 개편 및 스타일 파일 격리)
*   **`ui/services/` (주요 서비스 화면)**:
    *   각 도메인 서비스(Home, Play, Voca, Settings)별로 폴더를 구성하며, 컴포넌트와 전용 스타일(`*.styles.js`)을 한 폴더 내에 묶어 모듈성을 강화했습니다.
    *   *예시*: `Home/Home.jsx`, `Home/Home.styles.js`, `Home/Calendar.jsx` 및 `Play/Play.jsx`, `Play/Item/Item.jsx` (불필요한 중간 Card depth 거세 및 1뎁스 서브폴더화 완료)

### 2) `src/common/` (Core Logic & Infrastructure)
리액트 UI 프레임워크와 결합되지 않고 독립적으로 사용 가능한 API 및 헬퍼 함수 집합입니다.

*   **`common/api/`**:
    *   데이터 읽기/쓰기를 일관되게 처리하는 파사드 패턴 적용
    *   `guest/`: 비로그인 사용자의 로컬 데이터 퍼시스턴스
    *   `user/`: 로그인 사용자의 Supabase 원격 데이터 퍼시스턴스
*   **`common/utils/`**:
    *   어느 환경에서나 독립적으로 동작하는 수학적/알고리즘적 헬퍼 함수 (`utils.js` 등)

### 3) `src/assets/` (Static Resources)
전역 정적 에셋이 위치하는 독립적 카테고리입니다.
*   `iconList.jsx`: 전체 앱에서 사용하는 고해상도 SVG 아이콘 라이브러리

---

## 3. 핵심 규칙 및 모범 사례 (Best Practices)

1.  **임포트 경로 규칙**:
    *   `@/ui/`로 시작하는 절대 경로는 화면 프레젠테이션 및 리액트 관련 구성요소에만 사용합니다.
    *   `@/common/` 경로는 비즈니스 로직, 데이터 지속성 API, 유틸리티 함수에만 사용합니다.
    *   `@/assets/` 경로는 아이콘 및 미디어 등 정적 에셋 참조에 사용합니다.
2.  **스타일 컴포넌트 분리**:
    *   각 컴포넌트 내부에 존재하던 Styled Component는 모듈성 강화를 위해 무조건 동일 폴더 내의 `[ComponentName].styles.js`로 분리하여 관리합니다.
    *   공용으로 쓰이는 스타일 레이아웃 조각은 `ui/common/styled/` 폴더에 둡니다.
3.  **의존성 단방향화**:
    *   `src/common/` 하위 모듈은 `src/ui/` 하위 모듈을 임포트해서는 안 됩니다. (순수 로직의 UI 결합 방지)
