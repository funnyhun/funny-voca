# API Layer Agent Rules (src/api)

이 폴더는 데이터 소스(Supabase, LocalStorage)에 대한 모든 접근을 관리한다.

## 핵심 원칙

> `guest/`와 `user/`는 **철저하게 동일한 서비스 구조**를 가진다.
> 파일 구성과 함수명이 같으며, 구현 내용(데이터 원천)만 다르다.

---

## 계층 구조

```
util/storage.js  ← LS CRUD 유틸 (순수 함수, 도메인 무관)

guest/*.js       ← LocalStorage 기반 구현
user/*.js        ← Supabase(인증) 기반 구현
  ↕ 동일 파일 구성, 동일 함수명, 다른 구현 → hooks에서 as 별칭으로 구분

common/          ← 진짜 공유 자산 (anon Supabase)
auth/            ← 인증 세션 및 액션

hooks/           ← as 별칭 + session 분기 (UI 진입점)
```

### 각 계층의 책임

| 계층 | 책임 | 데이터 원천 |
|---|---|---|
| `util/` | LS CRUD 순수 유틸 함수 | LocalStorage |
| `guest/` | LS 기반 서비스 로직 | LocalStorage |
| `user/` | Supabase 기반 서비스 로직 | Supabase DB (인증) |
| `common/` | anon 접근 Supabase 공유 로직 | Supabase (anon) |
| `auth/` | 인증 세션 관리 | Supabase Auth |
| `hooks/` | session 분기 + guest/user 라우팅 | — |

> UI 컴포넌트는 **반드시 `hooks/`를 통해서만** API를 호출한다.
> 단, `auth/`와 `common/supabase.js`는 직접 사용 가능.

---

## 폴더 구조

```
src/api/
├── auth/
│   ├── actions.js     signInWithKakao, signOut
│   └── session.js     getSession, getUserId
├── common/
│   ├── supabase.js    Supabase 클라이언트
│   └── master.js      getMaster() — anon 접근, guest/user 공유
├── util/
│   └── storage.js     getStorage / setStorage / removeStorage / clearStorage / KEYS
├── guest/
│   ├── voca.js        postVoca / getVoca / updateVoca
│   ├── stats.js       updateStats
│   └── profile.js     getProfile / updateProfile
└── user/
    ├── voca.js        postVoca / getVoca / updateVoca
    ├── stats.js       updateStats (향후)
    ├── profile.js     getProfile / updateProfile
    └── migration.js   migrateVoca

src/hooks/
├── useVoca.js         useVoca 커스텀 훅 및 낙관적 업데이트 관리
├── useStats.js        useStats 커스텀 훅 및 통계 데이터 관리
└── useProfile.js      useProfile 커스텀 훅 및 닉네임 설정 관리
```

---

## 네이밍 규칙

### 동사

| 동사 | 의미 |
|---|---|
| `get` | 조회 |
| `post` | 생성 / 초기화 |
| `update` | 수정 |
| `delete` | 삭제 |

### 도메인 단어

| 단어 | 의미 |
|---|---|
| `Voca` | 사용자 학습 데이터 |
| `Master` | 전체 단어 원천 데이터 |
| `Stats` | 학습 통계 및 설정 |
| `Profile` | 사용자 프로필 |

### 규칙

- **형식**: `동사 + 도메인` — `getVoca`, `updateStats`, `getProfile`
- **간결함**: 불필요한 접미사 금지 (`Data`, `Item`, `Info`, `Record` 등)
- **대칭**: `guest/`와 `user/`의 동일 기능 함수는 **반드시 같은 이름**

```js
// 올바른 예
getVoca, postVoca, updateVoca, getMaster, updateStats, getProfile

// 금지
getVocaData, getMasterWordData, getUserProfile, fetchUserVocaData
```

---

## 동기식 낙관적 업데이트 & 비동기 은닉 전략

학습 진행 상태 갱신 시, 사용자가 느끼는 딜레이를 0ms로 극화하기 위해 낙관적 업데이트(Optimistic Update) 전략을 수행한다.

1. **로컬 상태의 동기식 즉각 반영**:
   - `updateStatus` 액션 호출 시, `useVoca` 훅 내의 `useState` 상태를 먼저 즉시 갱신한다.
   - 갱신된 로컬 상태는 실시간 가공 함수(`processWordMap`)를 거쳐 뷰 레이어에 즉시 렌더링된다.
2. **백그라운드 비동기 동기화 (syncStatus)**:
   - 외부 영속성(Supabase DB 또는 로컬스토리)의 동기화는 훅 내부의 `syncStatus`가 백그라운드 비동기로 가동되어 완벽히 은닉화된다.
   - 네트워크 지연이나 에러 발생 시 UI를 복잡하게 롤백하지 않고 `console.error`로 처리하여 소멸시킨다. (다음 진입 시 최상위 Loader가 맞춰줌)
3. **초기화 및 리로드 은닉 (resetVoca)**:
   - 데이터 초기화 시 컴포넌트가 직접 Supabase DB나 로컬스토리지 삭제 API를 쿼리하지 않는다.
   - `useVoca` 훅의 `resetVoca` 비동기 액션이 내부적으로 DB 데이터 삭제, 로컬스토리지 청소 및 신규 Voca 적재(`postVoca`)를 책임지고 일괄 가동한다.

---

## 커스텀 훅 패턴 (as 별칭)

`guest/`와 `user/`의 동일 함수명을 훅에서 `as`로 구분하여 session 기반 라우팅을 처리한다.

```js
// hooks/useVoca.js (예시)
import { postVoca as gPost, updateVoca as gUpdate } from '../api/guest/voca';
import { postVoca as uPost, updateVoca as uUpdate } from '../api/user/voca';

export const useVoca = () => {
  const { session } = useAuth();
  const uid = session?.user.id;

  const postVoca   = (level)          => session ? uPost(uid, level)            : gPost(level);
  const updateVoca = (wordId, status) => session ? uUpdate(uid, wordId, status) : gUpdate(wordId, status);

  return { postVoca, updateVoca };
};
```

---

## 코딩 표준

1. **try-catch 필수**: 모든 비동기 함수는 `try-catch` 블록을 포함한다.
2. **로그 prefix**: `[계층/도메인]` 형식 준수
   - 예: `[Guest/Voca]`, `[User/Voca]`, `[Common/Master]`, `[Auth/Session]`
3. **Supabase 응답 분리**: `{ data, error }` 구조분해 후 `error` 먼저 처리
4. **JSDoc 필수**: 모든 함수에 파라미터와 반환값 타입 명시
5. **`util/storage.js`는 순수 유틸만**: 비즈니스 로직 및 도메인 판단 금지
6. **난이도 매핑 브릿지 보장**: `guest/voca.js` 및 `user/voca.js` 등의 모듈에서 데이터를 가공하거나 저장할 때, 초급 난이도 `"default"`는 로컬스토리지 템플릿 빌드 시 항상 `"default"` 키 아래로 저장되고, DB 조회 시에는 `"700"` 레벨로 변환되어 통일적으로 처리되어야 함.

