---
category: "domain"
description: "학습자 프로필 도메인의 온보딩 및 Streak 학습 통계 시나리오 명세"
---

# 프로필 도메인 명세서 (Profile Domain Specification)

본 문서는 학습자의 서비스 온보딩과 지속적인 학습 통계(Streak) 유지를 위한 사용자 중심의 시나리오를 정의하고, 이를 완수하기 위해 설계된 시스템 기능 및 구체적인 기술 매핑 사양을 명세합니다.

---

## 1. 온보딩 시나리오 (Onboarding)

### 1.1 시나리오 정의
- **상황**: 학습자가 서비스를 처음 발견하여 가입하거나 게스트(Guest) 상태로 앱에 최초 진입합니다. 닉네임 입력 단계를 마친 뒤, "시작하기"를 누르는 즉시 홈 화면으로 부드럽게 이동하여 700 난이도(default)의 단어장을 제공받아 즉시 암기를 개시할 수 있어야 합니다.
- **사용자 흐름**: 닉네임 입력 -> 학습 레벨 자동 지정(700) -> 대시보드로 이동 -> 첫 번째 추천 청크('700-marketing_1' 등)의 단어 리스트가 바로 화면에 로출됨.

### 1.2 필수 기능 & UX 정의
- **무지연 화면 렌더링**: 사용자가 홈 화면으로 전입한 순간 로딩 스피너의 방해를 받지 않고 첫 청크의 영어 단어 카드들을 0ms 속도로 즉각 볼 수 있어야 합니다.
- **최초 상태 빌드**: 신규 사용자이므로 기존 진행률이나 단어장 내역이 아예 없는 공백 상태입니다. 따라서 서버 통신이 실패하더라도 로컬 스토리지에 700 레벨의 기본 청크 정렬 계획이 즉시 배정 및 캐싱 완료되어야 합니다.

### 1.3 구현 기술 및 데이터 매핑
- **선제 배정 및 1순위 프리 로드**:
  - `src/app/router/user/index.js` 의 `loadUserData` -> `handleGuestLoading` 내부에서 첫 가입/진입 시점을 감지해 공통 로컬 저장소 캐시 엔진을 활용, 700 레벨 학습 데이터를 선제 배정합니다.
  - 최우선 1순위 청크(`firstChunk`)의 단어들만을 Supabase DB로부터 즉각 동기적으로 선제 쿼리(`getWordsByChunk`)해 `KEYS.MASTER`에 캐싱함으로써 홈 화면의 0ms 반응성을 확보합니다.
- **관련 데이터 매핑**:
  - 유저 프로필 상태 구조는 [schema.md](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/.agents/schema.md#31-keysprofile-profile)의 `profile` 스키마 규격을 충족합니다.
  - 최초 청크의 단어 목록은 [schema.md](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/.agents/schema.md#33-keysmaster-master)의 `master` 스키마 형태로 보관됩니다.

---

## 2. 학습 통계 시나리오 (Study Statistics)

### 2.1 시나리오 정의
- **상황**: 학습자가 영어 단어 암기를 게을리하지 않도록 지속적인 동기를 고취시키는 시나리오입니다. 학습자가 퀴즈를 모두 통과하여 하루에 최소 1개 이상의 청크 학습을 성공적으로 완수할 때마다 연속 학습일(Streak) 숫자가 증가해야 합니다. 이 Streak은 학습 레벨(700, 800, 900)에 상관없이 사용자의 전역 프로필 상태에서 단일하게 통합 관리됩니다.
- **사용자 흐름**: 오늘 미완료된 청크 퀴즈 풀기 -> 결과 페이지 진입 -> 연속 학습 일수(Streak)가 1일 증가했음을 대시보드와 UI에서 실시간으로 확인.

### 2.2 필수 기능 & UX 정의
- **하루 1회 제한 및 중복 가산 방지**: Streak(연속 학습일)은 하루에 청크를 1개 완료하든 10개 완료하든 **하루에 단 1회만 가산**되어야 합니다. 하루에 여러 개 청크를 완수했다고 해서 숫자가 중복으로 오르는 어뷰징을 방지해야 합니다.
- **기기 로컬 날짜(YYYY-MM-DD) 기반 연속성 판단**: 
  - 0ms 무지연 반응성과 오프라인 연속 학습 보장을 위해, 날짜 연산은 전적으로 학습자의 기기 로컬 시간대(`YYYY-MM-DD`)를 기준으로 판단합니다.
  - 오늘 최초로 학습을 마쳤을 때, 기기 시간 기준 어제 날짜(YYYY-MM-DD)에 완료된 기록이 존재한다면 Streak 값을 이어 가고, 어제 완료한 기록이 없다면 다시 1일부터 시작해야 합니다.

### 2.3 구현 기술 및 데이터 매핑
- **Streak 가산 공식 및 중복 방어 코드**:
  - `voca.local.js` 의 `updateLocalVocaStatus` 에서 퀴즈 성공(`status = true`) 이벤트가 접수되면, 로컬 캐시의 `profile.completed_date` 값을 수집합니다.
  - **오늘 이미 완료한 상태인지 대조**: `completed_date`가 오늘 날짜(기기 로컬 YYYY-MM-DD)와 일치하는 경우, 완료 날짜 정보만 갱신 상태로 유지하고 Streak(`continued` 속성)의 추가 가산은 건너뜁니다.
  - **어제 완료 여부 체크**: 오늘 최초 완료인 경우, 기기 시간 기준 어제 날짜 문자열(`yesterdayStr`)을 동적으로 계산한 뒤 기존 완수 청크 목록의 `completed_at` 날짜와 비교하여, 어제 학습 이력이 있다면 `continued` 값을 `+1` 시키고 없다면 `1`로 리셋합니다.
  - **전역 레벨 통합 관리**: Streak 관련 값인 `continued` 및 `completed_date`는 `KEYS.VOCA`의 개별 레벨 그룹에 종속되지 않으며, [schema.md](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/.agents/schema.md#31-keysprofile-profile)의 `profile` 스키마(즉 `KEYS.PROFILE`) 하위에 단일 필드로 보관되어 원격 DB `User` 테이블과 직접 1:1 백업 동기화됩니다.
- **관련 데이터 매핑**:
  - `profile.continued`와 `profile.completed_date` 데이터가 갱신 및 커밋되며, 이는 [schema.md](file:///z:/home/minhulee/Projects/funny-voca/funny-voca-app/.agents/schema.md#31-keysprofile-profile)의 데이터 명세를 단일 참조로 사용합니다.

