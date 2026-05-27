# Router User Layer Guide

이 폴더는 사용자 데이터의 로딩 및 페이지 진입 권한(Auth)을 오케스트레이션하는 레이어입니다. (`src/app/app/router/user/`)

## 1. 주요 역할
- **Data Hydration**: 앱 진입 시 필요한 마스터 데이터, 사용자 프로필, 학습 기록을 통합 로드합니다.
- **Flow Orchestration**: 세션 유무에 따라 Member flow와 Guest flow를 분기 처리합니다.
- **Data Integrity**: 로컬 스토리지의 레거시 데이터를 확인하여 DB로 마이그레이션하거나 초기 데이터를 생성합니다.

## 2. 설계 원칙
- **Pure Logic 분리**: 복잡한 데이터 변환 로직은 `utils.js`로 분리하여 테스트 가능성을 높입니다.
- **API 레이어 의존**: 직접적인 Supabase 호출 대신 `@/common/api/` 폴더의 모듈화된 기능을 사용합니다.
- **JSDoc 준수**: 로더 반환값의 구조가 복잡하므로 반드시 JSDoc으로 타입을 명시합니다.
- **난이도 코드 매핑 보장**: 회원(Member) 데이터 로딩 시 프론트엔드의 `"default"` 난이도는 `levelToNumber`를 통해 실제 Supabase DB의 초급 단어 레벨인 `700`으로 매핑되어 안전하게 쿼리됩니다.

## 3. 핵심 파일
- `index.js`: `loadUserData` 로더 본체. 전체 흐름을 제어합니다.
- `utils.js`: `processWordMap` 등 데이터 가공용 순수 함수를 포함합니다.
