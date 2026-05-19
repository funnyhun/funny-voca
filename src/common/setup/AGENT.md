# Onboard Service Guide

Onboard 서비스는 신규 사용자(Guest)의 초기 설정 및 데이터 생성을 담당합니다.

## 1. 역할 및 특징
- **닉네임 설정**: 사용자의 기본 닉네임 입력 및 로컬 저장.
- **데이터 생성**: 마스터 단어 데이터를 기반으로 사용자의 개인 학습 세트(`wordMaps`)를 로컬에 생성.
- **초기 진입점**: 앱 설치 후 최초 실행 시 반드시 거쳐야 하는 단계.

## 2. 주요 구성 요소
- **Onboard.jsx**: 온보딩 레이아웃 및 단계별 컴포넌트 래핑.
- **StepToNick.jsx**: 닉네임 입력 단계. `utils.js`의 `saveLocalStorage` 사용.
- **StepToData.jsx**: 데이터 생성 단계. `initAppData.js`의 `initAppData`를 호출하여 실제 학습 맵을 구성.

## 3. 종속성 및 연관 관계
- **initAppData.js (`initAppData`)**: 데이터 생성의 핵심 로직.
- **utils.js (`saveLocalStorage`)**: 입력된 정보를 브라우저에 영구 저장.

## 4. 데이터 흐름
`StepToNick` (닉네임 저장) -> `StepToData` (단어 데이터 생성 시작) -> `initAppData` 실행 -> 완료 후 `/` (Home)으로 이동
