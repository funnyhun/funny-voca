# API Layer Agent Rules (src/common/api)

이 폴더는 데이터 소스(Supabase, LocalStorage)에 대한 모든 접근을 관리하고 비즈니스 로직의 영속성을 책임지는 코어 API 레이어입니다.

---

## 1. 핵심 원칙

> `guest/`와 `user/`는 **철저하게 동일한 서비스 구조**를 가집니다.
> 파일 구성과 함수명이 똑같고, 구현 내용(데이터 원천)만 다릅니다. 이들은 `src/ui/common/hooks/` 레이어에서 상황(인증 상태)에 따라 바인딩됩니다.

---

## 2. 계층 구조

```text
common/api/
├── util/storage.js      # LS(LocalStorage) CRUD 유틸 (도메인 비특이적 순수 함수)
├── guest/*.js           # LocalStorage 기반 비로그인 게스트용 구현
├── user/*.js            # Supabase 원격 DB 기반 로그인 유저용 구현
├── common/              # 비로그인/로그인 공용 자산 및 헬퍼 함수
└── auth/                # Supabase Auth 연동 세션 및 계정 액션
```

### 각 계층의 책임

| 계층 | 책임 | 데이터 원천 |
|---|---|---|
| `util/` | LS CRUD 순수 유틸 함수 | LocalStorage |
| `guest/` | LS 기반 서비스 로직 | LocalStorage |
| `user/` | Supabase 기반 서비스 로직 | Supabase DB (인증) |
| `common/` | anon 접근 Supabase 공유 로직 | Supabase (anon) |
| `auth/` | 인증 세션 및 로그인 관리 | Supabase Auth |

> UI 컴포넌트는 **반드시 `src/ui/common/hooks/`를 통해서만** API를 호출합니다.
> 단, `auth/`와 `common/supabase.js`는 직접 사용 가능합니다.

---

## 3. 폴더 구조

```text
src/common/api/
├── auth/
│   ├── actions.js       # signInWithKakao, signOut
│   └── session.js       # getSession, getUserId
├── common/
│   ├── supabase.js      # Supabase 클라이언트 및 대용량 조회 페이징 헬퍼
│   └── master.js        # getMaster() — anon 접근, guest/user 공유 단어 정보
├── util/
│   └── storage.js       # getStorage / setStorage / removeStorage / clearStorage / KEYS
├── guest/
│   ├── voca.js          # postVoca / getVoca / updateVoca
│   ├── stats.js         # updateStats
│   └── profile.js       # getProfile / updateProfile
└── user/
    ├── voca.js          # postVoca / getVoca / updateVoca
    ├── stats.js         # updateStats
    ├── profile.js       # getProfile / updateProfile
    └── migration.js     # migrateVoca (게스트 -> 유저 학습 데이터 마이그레이션)

src/ui/common/hooks/ (UI 바인딩 및 상태 브릿저)
├── useVoca.jsx          # useVoca 커스텀 훅 및 낙관적 업데이트 관리
├── useStats.jsx         # useStats 커스텀 훅 및 통계 데이터 관리
├── useProfile.jsx       # useProfile 커스텀 훅 및 닉네임 설정 관리
└── useWord.jsx          # 특정 Day의 단어 리스트와 학습 상태(done) 결합 브릿저
```

---

## 4. 네이밍 규칙

### 동사
*   `get`: 조회
*   `post`: 생성 / 초기화
*   `update`: 수정 / 갱신
*   `delete`: 삭제

### 도메인 단어
*   `Voca`: 사용자 학습 데이터
*   `Master`: 전체 단어 마스터 데이터
*   `Stats`: 학습 통계 및 설정
*   `Profile`: 사용자 프로필

### 규칙
*   **형식**: `동사 + 도메인` — `getVoca`, `updateStats`, `getProfile`
*   **간결함**: 불필요한 접미사 금지 (`Data`, `Item`, `Info`, `Record` 등)
*   **대칭**: `guest/`와 `user/`의 동일 기능 함수는 **반드시 같은 이름**으로 정의합니다.

```js
// 올바른 예
getVoca, postVoca, updateVoca, getMaster, updateStats, getProfile

// 금지
getVocaData, getMasterWordData, getUserProfile, fetchUserVocaData
```

---

## 5. 동기식 낙관적 업데이트 & 비동기 은닉 전략

학습 진행 상태 갱신 시, 사용자가 느끼는 딜레이를 0ms로 극화하기 위해 낙관적 업데이트(Optimistic Update) 전략을 수행합니다.

1.  **로컬 상태의 동기식 즉각 반영**:
    *   `updateStatus` 액션 호출 시, `useVoca` 훅 내의 `useState` 상태를 먼저 즉시 갱신합니다.
    *   갱신된 로컬 상태는 실시간 가공 함수(`processWordMap`)를 거쳐 뷰 레이어에 즉시 렌더링됩니다.
2.  **백그라운드 비동기 동기화 (syncStatus)**:
    *   외부 영속성(Supabase DB 또는 로컬스토리)의 동기화는 훅 내부의 `syncStatus`가 백그라운드 비동기로 가동되어 완벽히 은닉화됩니다.
    *   네트워크 지연이나 에러 발생 시 UI를 복잡하게 롤백하지 않고 `console.error`로 처리하여 소멸시킵니다. (다음 진입 시 최상위 Loader가 맞춰줌)
3.  **초기화 및 리로드 은닉 (resetVoca)**:
    *   데이터 초기화 시 컴포넌트가 직접 Supabase DB나 로컬스토리지 삭제 API를 쿼리하지 않습니다.
    *   `useVoca` 훅의 `resetVoca` 비동기 액션이 내부적으로 DB 데이터 삭제, 로컬스토리지 청소 및 신규 Voca 적재(`postVoca`)를 책임지고 일괄 가동합니다.

---

## 6. 코딩 표준 및 주의사항

1.  **try-catch 필수**: 모든 비동기 함수는 `try-catch` 블록을 포함합니다.
2.  **로그 prefix**: `[계층/도메인]` 형식 준수
    *   예: `[Guest/Voca]`, `[User/Voca]`, `[Common/Master]`, `[Auth/Session]`
3.  **Supabase 응답 분리**: `{ data, error }` 구조분해 후 `error` 먼저 안전하게 처리합니다.
4.  **JSDoc 필수**: 모든 함수에 파라미터와 반환값 타입을 명시합니다.
5.  **`util/storage.js`는 순수 유틸만**: 비즈니스 로직 및 도메인 판단을 완벽히 격리시킵니다.
6.  **난이도 매핑 브릿지 보장**: 초급 난이도 `"default"`는 로컬스토리지 템플릿 빌드 시 항상 `"default"` 키 아래로 저장되고, DB 조회 시에는 `"700"` 레벨로 변환되어 통일적으로 처리되어야 합니다.
7.  **Supabase 대용량 데이터 조회 시 페이징 처리 필수**: Supabase의 기본 select Limit가 1,000개이므로, `common/supabase.js`의 `fetchPages` 헬퍼 함수를 필수적으로 사용하여 모든 데이터를 완전히 수집하도록 보장합니다.
