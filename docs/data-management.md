# 학습 데이터 관리 시스템 문서 (Data Management System)

이 문서는 MyVoca 서비스에서 사용자의 학습 데이터가 어떻게 관리되고, 3차 아키텍처(UI / Common / Assets)를 통해 어떻게 영속화되는지 설명합니다.

---

## 1. 데이터 초기화 (Initialization)

사용자가 서비스를 처음 시작하거나 온보딩 과정을 거칠 때, 초기 데이터 세트가 생성됩니다.

- **프로세스 (`src/common/api/guest/voca.js` 등)**:
    1. **마스터 데이터 로드**: `common/api/common/master.js`를 통해 Supabase에서 전체 단어 데이터를 가져옵니다.
    2. **공통 초기화**: `initWordMap` 및 `initUserData`를 호출하여 학습 템플릿과 사용자 기본 정보를 생성합니다.
    3. **영속화**:
        - **Guest**: `@/common/api/util/storage.js`를 통해 브라우저 로컬 저장소에 안전하게 기록됩니다.
        - **Member**: 로그인 상태인 경우, 생성된 템플릿 정보를 기반으로 DB와 동기화 세션을 시작합니다.

---

## 2. 데이터 변경 및 영속화 (Persistence)

사용자의 모든 학습 상태 변경은 **커스텀 훅 및 API 레이어**를 통해 세션 상태에 따라 적절한 저장소로 분기됩니다.

- **업데이트 흐름 (`updateWordStatus`)**:
    1. **세션 확인**: `common/api/auth/session.js`의 `getSession()`을 통해 현재 권한 상태를 확인합니다.
    2. **구현체 위임**:
        - **Member (`common/api/user/voca.js`)**: Supabase `Voca` 테이블의 `status`를 직접 업데이트합니다.
        - **Guest (`common/api/guest/voca.js`)**: `@/common/api/util/storage.js`를 사용하여 로컬 데이터를 업데이트하고 캐시를 갱신합니다.

---

## 3. 서비스별 데이터 활용

모든 UI 컴포넌트는 저장소의 구현 상세를 몰라도 되도록 **API** 또는 **Loader**에서 제공하는 가공된 데이터를 사용합니다.

### 3.1 암기하기 및 퀴즈 (`ui/services/Play/Card`, `ui/services/Play/Quiz`)
- **데이터 로드**: `@/ui/common/hooks/useWord` 훅을 통해 현재 선택된 Day의 단어와 학습 상태가 병합된 리스트를 가져옵니다.
- **상태 업데이트**: 학습 완료 시 `@/ui/common/hooks/useVoca`의 `updateWordStatus`를 호출하여 세션에 맞는 영속화를 수행합니다.

### 3.2 단어장 (`ui/services/Voca`)
- **데이터 로더**: `src/ui/app/router/user/index.js`의 `loadUserData`가 전체 데이터 로드를 오케스트레이션합니다.
- **가공 로직**: DB의 로우(Row) 데이터와 로컬의 템플릿 구조를 병합하여 UI가 렌더링하기 좋은 형태의 `wordMap`으로 변환합니다.
- **난이도 1:1 매핑**: UI에서 표현하는 `"default"` 난이도는 Supabase DB의 단어 테이블 레벨 번호 `"700"` 및 게스트용 템플릿 구조와 1:1 매핑 브릿지를 이룹니다. 이를 위해 `levelToNumber` 매핑 객체(`"default": 700`)를 보장하여 데이터 수집 파이프라인에서 키 불일치 오류가 발생하지 않도록 제어합니다.

---

## 4. 데이터 마이그레이션 (Migration)

게스트 사용자가 회원으로 전환될 때, `common/api/user/migration.js`의 로직이 실행됩니다.
1. 로컬 저장소의 학습 기록(`word_map`)을 추출합니다.
2. Supabase DB로 벌크 인서트(Bulk Insert)를 수행합니다.
3. 마이그레이션이 성공하면 로컬의 레거시 데이터를 삭제하여 데이터 무결성을 유지합니다.

---

## 5. 알림(Notification) 시스템

알림 데이터는 중앙 집중식으로 관리되며, 시스템 공지와 개인 맞춤형 메시지를 통합하여 제공합니다.

- **데이터 흐름**:
    1. `loadUserData` 로더에서 공지사항과 개인 알림을 병렬로 Fetch합니다.
    2. 세션 유무에 따라 "동기화 권장" 또는 "동기화 완료"와 같은 시스템 상태 메시지를 동적으로 생성하여 최상단에 노출합니다.
    3. 모든 알림 데이터는 고유 ID를 가져 클라이언트 측에서 중복 처리가 용이하도록 설계되었습니다.
