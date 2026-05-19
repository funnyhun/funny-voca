# Home Service Guide

Home 서비스는 앱의 메인 대시보드로, 사용자의 학습 현황과 캘린더 정보를 제공합니다.

## 1. 역할 및 특징
- **시각화**: 연속 학습일(Streak), 오늘 학습량, 전체 학습 진행도 표시.
- **정보 제공**: 캘린더를 통한 일자별 학습 기록 시각화.

## 2. 주요 컴포넌트 및 종속성
- **Home.jsx**: 엔트리 포인트. `StatsDashboard`와 `Calendar`를 렌더링함.
- **StatsDashboard.jsx**: `userData` Context 또는 LocalStorage를 참조하여 학습 통계 표시.
- **Calendar.jsx**: `wordMaps` 데이터를 분석하여 날짜별 학습 완료 여부 표시.
- **util.js**: 캘린더 렌더링에 필요한 날짜 계산 로직 포함. `src/utils/utils.js`의 `calculateDate`에 의존함.

## 3. 연관 서비스
- **WordDataContext**: 마스터 단어 데이터 조회를 위해 사용.
- **useWord Hook**: 현재 선택된 레벨의 학습 데이터를 가져오기 위해 사용.

## 4. 데이터 흐름
`userData` (학습 통계) -> `StatsDashboard`
`wordMaps` (학습 결과) -> `Calendar`
