---
category: "core"
description: "앱의 3계층 아키텍처 및 낙관적 업데이트와 비동기 백그라운드 서버 저장 설계 명세"
---

# 애플리케이션 아키텍처 명세서 (Application Architecture Specification)

본 문서는 MyVoca 애플리케이션의 핵심 계층 구조, 단방향 의존성 규칙, 그리고 UI 성능을 극대화하기 위한 낙관적 업데이트 및 백그라운드 비동기 서버 저장 기법의 설계 사양을 명세합니다.

---

## 1. 3대 레이어 계층 구조 (3-Layer Architecture)

MyVoca 애플리케이션은 각 레이어의 역할과 책임을 명확히 구분하고 테스트 및 유지보수성을 극대화하기 위해 다음과 같이 3개의 계층으로 소스 코드를 격리합니다.

| 계층 (Layer) | 역할 및 책임 | 주요 디렉토리 경로 |
| :--- | :--- | :--- |
| **1. UI 계층 (UI Layer)** | 리액트 컴포넌트 렌더링, 클라이언트 사이드 라우팅, 컴포넌트 격리 상태 및 훅을 통한 도메인 수명 주기 연동 | [src/app/](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/src/app) |
| **2. 공통 비즈니스 계층 (Common Layer)** | 외부 서버 API 통신 게이트웨이, 로컬 스토리지 캐시 제어 엔진, 동기화 및 큐 매니저 백그라운드 연산, 포맷터 | [src/api/](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/src/api), [src/utils/](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/src/utils) |
| **3. 에셋 계층 (Assets Layer)** | 테마 설정, 이미지 및 공용 벡터 아이콘 리소스 등 상태 변화가 없는 정적 자원 | [src/assets/](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/src/assets) |

---

## 2. 모듈 의존성 단방향 규칙 (One-Way Dependency Flow)

결합도 증가로 인한 스파게티 코드를 미연에 방지하기 위해 계층 간의 흐름은 철저히 상위에서 하위로만 단방향으로 흐릅니다.

```mermaid
graph TD
    subgraph "UI Layer (src/app/)"
        Pages[Pages / Layouts]
        Hooks[Domain Custom Hooks]
        Context[React Global Context]
    end

    subgraph "Common Layer (src/api/ & src/utils/)"
        API[API Orchestrator / index.js]
        Local[Local Storage Engine]
        Sync[Non-blocking Sync Layer]
        Client[Supabase Client Bridge]
    end

    subgraph "Infrastructure & Storage"
        LS[(LocalStorage Cache)]
        DB[(Supabase PostgreSQL)]
    end

    %% Flow Paths
    Pages --> Hooks
    Hooks --> Context
    Context --> API
    API --> Local
    API --> Sync
    Local --> LS
    Sync --> Client
    Client --> DB
```

### 2.1 상향 참조 금지 수칙
- 공통 비즈니스 계층(`src/api/`, `src/utils/`)은 UI 계층(`src/app/`)의 상태, 렌더링 엔진, 라우터 및 스타일 요소들을 직접 참조(import 등)할 수 없습니다.
- UI 컴포넌트는 LocalStorage 캐시나 Supabase DB에 직접 쿼리를 수행하지 않으며, 반드시 비즈니스 계층의 Orchestrator(`src/api/voca/index.js` 등) 및 전역 커스텀 훅을 통해서만 자원에 관여합니다.

---

## 3. 낙관적 업데이트 및 비동기 백그라운드 서버 저장

MyVoca는 네트워크 단선이나 API 응답 지연(RTT)에 관계없이 사용자에게 즉각적이고 매끄러운 반응성(0ms 레이턴시)을 보장하기 위해 **낙관적 업데이트(Optimistic Update)**와 **비동기 백그라운드 서버 저장(Non-blocking Async Sync)**의 결합 구조를 핵심 사상으로 취합니다.

### 3.1 동작 아키텍처 상세
- **Source of Truth 일원화**: 모든 단어장의 완료 토글, 스케줄 조정, 진도 마킹 등의 핵심 신뢰 상태는 **로컬 저장소 캐시(`voca`, `profile`)**에 직접 즉시 저장됩니다.
- **낙관적 선 반영**: 사용자가 이벤트를 발생시키면 로컬 저장소 캐시 엔진(`voca.local.js`)이 먼저 구동되어 로컬 스토리지에 데이터를 저장하고 UI 상태를 즉시 동기화해 응답 대기 로딩을 영구 제거합니다.
- **백그라운드 비동기 위임**: 로컬 1차 갱신 및 화면 렌더링이 즉각 끝난 직후, 비동기 오케스트레이션 인터페이스가 Supabase DB 백업을 백그라운드 단에서 넌블로킹 Promise로 단독 실행합니다. 이 서버 연산 과정 중 지연이나 일시적 단선 에러가 발생해도 사용자 화면 흐름에는 어떠한 오류도 노출되지 않습니다.
  - 구체적인 비동기 원격 백업 동기화 기법은 [sync.md](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/.agents/sync.md) 문서를 참고합니다.

---

## 4. 백그라운드 단어 로딩 스케줄러 브릿지

- **점진적 백그라운드 로딩**: 초기 진입에 필수적인 최우선 청크 단어들만 라우터 로더에서 동기적으로 선제 쿼리해 0ms 렌더링을 유도하고, 나머지 전체 단어 사전 캐시는 백그라운드 큐 매니저가 점진적으로 가져와 로컬 마스터 캐시에 병합합니다.
- **WQM 큐 매니저 및 useMaster**:
  - `useMaster` 훅은 리액트 생명주기와 전역 백그라운드 큐 매니저(`WordQueueManager`)를 이어주는 넌블로킹 옵저버 브릿지입니다.
  - 상세한 단어 다운로드 큐 생성, 캐시 중복 선별 및 우선순위 격상(Re-queue) 메커니즘은 [queue.md](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/.agents/queue.md) 문서를 참고합니다.
