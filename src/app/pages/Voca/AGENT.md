# Agent Context Anchor - src/app/services/Voca

본 문서는 `src/app/services/Voca` 도메인의 컴포넌트 및 스타일 코드에 대한 에이전트 전용 컨텍스트 앵커입니다. 에이전트는 이 디렉토리 내의 파일들을 생성, 수정, 리팩토링할 때 아래의 규칙을 반드시 준수해야 합니다.

---

## 1. 디렉토리 구조 및 핵심 역할

```text
Voca/
├── AGENT.md                 # 본 문서 (에이전트 제어용)
├── index.js                 # Voca 도메인 배럴 파일 (외부 노출 제어)
├── [Component]/             # Day 리스트 관련 격리 폴더
│   ├── index.js             # 배럴 파일
│   ├── [Component].jsx      # 리액트 비즈니스 로직 및 마크업
│   └── [Component].styles.js # 격리된 styled-components 선언
└── Word/                    # 단어 상세 정보 도메인 폴더
    ├── index.js             # Word 도메인 루트 배럴 파일
    ├── utils/               # Word 유틸리티 폴더
    │   └── filter.js        # 정렬/필터링 로직
    └── [WordComponent]/     # 단어 세부 컴포넌트별 격리 폴더
        ├── index.js         # 배럴 파일
        ├── [WordComponent].jsx
        └── [WordComponent].styles.js
```

### 각 컴포넌트의 역할
- **Voca**: 단어장 리스트의 최상단 레이아웃 뷰어. 라우터 Outlet 관리를 담당합니다.
- **VocaList**: 전체 단어 데이터맵(`wordMap`)을 돌며 Day별 덩어리로 묶인 리스트를 렌더링하고, 하위로 `VocaItem`들을 나열합니다.
- **VocaItem**: 각 Day 카드 아이템으로, 전체 단어 수 대비 암기 완료된 비중을 `VocaProgressBar`를 동적으로 바인딩하여 백분율 시각화를 담당합니다.
- **VocaProgressBar**: 깔끔하고 트렌디하게 디자인된 수평 학습율 막대 바 컴포넌트입니다.
- **WordList**: 특정 Day 상세 단어들의 조회 오케스트레이터. 검색(`WordSearch`), 상태 필터링(`WordFilter`), 비어있음(`WordEmpty`, `WordNoResult`), 그리고 단어들의 카드 나열(`WordItem`)을 총망라합니다.
- **WordItem**: 개별 단어 요약 정보 카드. 사용자가 체크박스 클릭을 통해 간편하게 수동 암기 완료 상태(`done`)를 토글할 수 있습니다.
- **WordDetail**: 단어 클릭 시 하단 또는 팝업 레이어로 등장하는 단어 전체 뜻, 품사, 예문 및 상세 설명 제공판입니다.

---

## 2. 참조 및 의존성 불변 규칙 (Crucial Rules)

1. **상대 참조 금지 (상위 디렉토리 참조 시 절대 경로 사용)**
   - 공용 컴포넌트나 레이아웃, 외부 도메인을 참조할 때는 어떠한 경우에도 `../../common/...` 과 같은 복잡한 상대 경로를 사용할 수 없습니다.
   - 반드시 **절대 경로 별칭 (`@/app/common/...`, `@/common/api/...`, `@/app/services/Voca/...`)**을 사용하여 모듈 참조 오류를 차단하십시오.
2. **스타일 파일의 단방향 의존성**
   - `*.styles.js` 파일은 컴포넌트 로직(`*.jsx`) 내에 선언된 훅이나 일반 자바스크립트 변수를 절대 임포트할 수 없습니다.
   - 스타일링에 필요한 가변 속성은 오직 리액트 프롭스(`props`) 및 스타일 전용 임시 프롭(`$prefix` 형식)을 통해서만 전달받아야 합니다.
3. **진입점 최소화 (배럴 패턴)**
   - 도메인 최상위 `index.js`에 명시적으로 노출된 컴포넌트만 외부에서 사용할 수 있습니다. 외부 폴더에서 이 도메인의 서브컴포넌트를 임포트할 때는 반드시 `import { Voca, WordList } from "@/app/services/Voca"` 형태로만 임포트해야 합니다.
