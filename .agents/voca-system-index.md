# MyVoca 핵심 운용 로직 시스템 문서 인덱스 (MyVoca System Architecture & Logic Index)

본 문서는 MyVoca 서비스의 설계 사상, 데이터 흐름, 핵심 비즈니스 로직 및 유저 시나리오를 구체화한 대-중-소 세부 문서들의 전체 지도(Index)이자 진입점입니다. 
아래 테이블을 참고하여 각 도메인 영역별로 세분화된 문서를 유기적으로 파악할 수 있습니다.

---

## 1. MyVoca 핵심 운용 로직 문서 체계 (대-중-소 구성)

모든 문서는 한국어 전용 작성 원칙과 이모지 전면 금지 규칙을 엄격히 준수하여 시각적인 가시성을 극대화한 테이블과 체크리스트 레이아웃으로 작성되었습니다.

| 대분류 (Category) | 중분류 (Sub-Category) | 소분류 세부 문서 링크 (Specification Documents) | 핵심 명세 내용 |
| :--- | :--- | :--- | :--- |
| **1. 앱의 전체 아키텍쳐 및 스키마** | 1.1 시스템 레이어 아키텍처 | [system-architecture.md](file:///.agents/architecture/system-architecture.md) | 3차 아키텍처 계층 구조 및 모듈 간의 철저한 단방향 의존성 흐름 규칙 정의 |
| | 1.2 데이터베이스 및 저장소 스키마 | [database-schema.md](file:///.agents/architecture/database-schema.md) | Supabase 4대 테이블 사양, LocalStorage 키 스키마 상세, 난이도 매핑 규칙 명세 |
| | 1.3 점진적 백그라운드 단어 로딩 | [progressive-loading.md](file:///.agents/architecture/progressive-loading.md) | 넌블로킹 청크 로딩, WordQueueManager 및 useMaster 훅의 Re-queue 우선순위 정렬 메커니즘 |
| **2. 도메인에 따른 비즈니스 로직** | 2.1 로컬 퍼스트 및 동기화 오케스트레이션 | [local-first-sync.md](file:///.agents/domain/local-first-sync.md) | Local-First 아키텍처 설계와 voca.local.js & voca.sync.js 조율 오케스트레이션 및 3단계 유니크 충돌 예방 기법 |
| | 2.2 학습 달성 및 연속 학습일 (Streak) | [study-achievement.md](file:///.agents/domain/study-achievement.md) | 퀴즈 완료 시 status & completed_at 마킹, Streak 연산 공식 및 target 청크 자동 전진 로직 |
| | 2.3 데이터 마이그레이션 및 예외 포팅 | [migration-recovery.md](file:///.agents/domain/migration-recovery.md) | 게스트 → 회원 가입 전환 시 벌크 이송 프로세스 및 구 selected 숫자값 자동 변환 복구 방어 코드 |
| **3. 유저 시나리오에 따른 비즈니스 로직** | 3.1 신규 사용자 온보딩 프로세스 | [onboarding.md](file:///.agents/scenarios/onboarding.md) | 최초 닉네임 입력부터 default(700) 레벨 학습 계획 빌드 및 로더 프리 로드 흐름 |
| | 3.2 단어 암기 및 퀴즈 플레이어 | [study-play-quiz.md](file:///.agents/scenarios/study-play-quiz.md) | URL 파라미터 은닉화(/play, /quiz), selected 기반 동적 바인딩, 카드 -> 퀴즈 -> 결과 연동 |
| | 3.3 설정 제어 및 공장 초기화 | [settings-reset.md](file:///.agents/scenarios/settings-reset.md) | 난이도 변경 Real Progress 진행율 피드백, resetVoca를 통한 오프라인 중심 자원 전면 파지 규칙 |
| **4. 그 외 시스템 기반 사항** | 4.1 UI/UX 및 디자인 시스템 | [ui-UX-design.md](file:///.agents/docs/ui-UX-design.md) | 글래스모피즘 코어 룰, 마이크로 애니메이션 물리 가이드라인, iconList 단일 진입점 설계 |
| | 4.2 런타임 안정성 및 보안 | [stability-security.md](file:///.agents/docs/stability-security.md) | 리액트 무한 루프 방지 문자열 딥 비교 기법, Supabase 통신 예외 복구 및 API 키 보안 격리 수칙 |

---

## 2. 문서 기반 및 개발 히스토리 요약

본 문서 체계는 MyVoca 서비스의 다음 기반 요소와 이전 개발 히스토리를 심층 분석하여 완전하게 구축되었습니다.

### 2.1 참조 소스코드 핵심 레이어
- **UI/UX 계층**: 리액트 컴포넌트(`App.jsx`, `StepToNick.jsx`, `StepToData.jsx`, `Play.jsx`, `Quiz.jsx`, `Complete.jsx`) 및 리액트 전역 훅/컨텍스트(`useMaster.js`, `useVoca.js`)
- **API/스토리지 오케스트레이션 계층**: `src/api/voca/voca.local.js`, `src/api/voca/voca.sync.js`, `src/api/voca/index.js`, `src/app/services/WordQueueManager.js`
- **유틸리티 계층**: 로컬스토리지 영속화 유틸리티(`src/utils/storage.js`)

### 2.2 세션 완료 로그 기반 히스토리
- **2026-05-28 (로컬 퍼스트 & 동기화 아키텍처 개편)**: Source of Truth를 로컬 스토리지로 일원화하고 Supabase로의 백업은 백그라운드 넌블로킹 동기화 레이어가 단독 수행하도록 분리.
- **2026-05-28 (고유 ID 도입 및 Play/Quiz 주소 은닉화)**: 영문 슬러그 매핑(`${level}_d${day}_${toEnglishSlug(category)}`) 고유 식별 체계 확립, `/play` 및 `/quiz` 경로 파라미터 삭제 후 `selected` 기반 동적 로드 이식.
- **2026-05-29 (홈 대시보드 리팩토링 및 캘린더 복구)**: 단어수 기반 진행률 산출, 완료 날짜 필드 `completed_at` 연동을 통한 Streak(`continued`) 계산 단순화 및 퀴즈 완료 시점에만 status 완료 커밋 수행하도록 프로세스 전면 정비.
