# Voca Service Guide

Voca 서비스는 전체 단어 목록을 조회하고, 특정 Day의 상세 단어 리스트를 확인하거나 학습 상태를 수동으로 변경하는 기능을 제공합니다.

## 1. 역할 및 특징
- **리스트 조회**: Day별 학습 진행도 및 단어 개수 요약.
- **상세 조회**: 특정 Day에 포함된 모든 단어와 뜻 확인.
- **수동 업데이트**: 사용자가 체크박스를 통해 단어 암기 여부를 직접 업데이트 가능.

## 2. 주요 구성 요소
- **Voca.jsx**: 최상위 래퍼. `VocaList`를 렌더링함.
- **VocaList.jsx**: Day별 리스트 표시 및 진행률(`VocaProgressBar`) 렌더링.
- **Word (Directory)**: 특정 Day의 상세 단어 목록 표시 모듈 (`WordList.jsx`, `WordItem.jsx`).

## 3. 종속성 및 연관 관계
- **useVoca Hook (`@/ui/common/hooks/useVoca`)**: UI 컴포넌트(`WordItem.jsx`)가 직접 백엔드 API를 부르는 대신 이 훅의 `updateWordStatus`를 사용하여 암기 상태를 낙관적 업데이트합니다.
- **useWord Hook (`@/ui/common/hooks/useWord`)**: 전체 단어 맵과 진행도 데이터를 가져오기 위해 필수적으로 사용됨.

## 4. 데이터 흐름
`useWord` -> `wordMap` 로드 -> `VocaList` (Day별 맵핑) -> 상세 진입 시 `Word` 목록 표시 -> 체크 시 `useVoca.updateWordStatus` 반영
