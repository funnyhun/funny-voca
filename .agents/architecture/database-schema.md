# 데이터베이스 및 스토리지 스키마 명세서 (Database & Storage Schema Specification)

본 문서는 MyVoca 서비스의 핵심 데이터 모델 구조와 Supabase 원격 테이블 명세, 그리고 로컬 캐시(LocalStorage)의 데이터 구조를 상호 매핑하여 정의합니다.

---

## 1. Supabase 원격 데이터베이스 스키마

### 1.1 Word (단어 마스터 테이블)
서비스의 모든 영어 단어 기본 정보를 보관하는 마스터 데이터셋입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `word_id` | UUID | PK, Default: uuid_generate_v4() | 단어의 시스템 고유 식별자 |
| `word` | VARCHAR | NOT NULL, UNIQUE | 단어의 영어 스펠링 |
| `level` | INTEGER | NOT NULL, Default: 700 | 학습 목표 점수대 구분 (예: 700, 800, 900) |
| `day` | INTEGER | NOT NULL, Default: 1 | 학습 차수 (Day) 구분 |
| `category` | VARCHAR | - | 단어의 테마 및 카테고리 명칭 (한글) |
| `created_at` | TIMESTAMPTZ | Default: now() | 레코드 생성 일시 |

### 1.2 Definition (뜻 및 예문 상세 테이블)
단어의 품사별 뜻과 예문, 퀴즈 출제용 문장을 정의하며, `Word` 테이블과 1:N 관계를 맺습니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `definition_id` | UUID | PK, Default: uuid_generate_v4() | 뜻 정보 고유 식별자 |
| `word_id` | UUID | FK (Word.word_id), ON DELETE CASCADE | 부모 단어 레코드 식별 ID |
| `class` | VARCHAR | NOT NULL | 단어의 품사 (n, v, adj, adv 등) |
| `definition` | VARCHAR | NOT NULL | 단어의 한글 번역 뜻 |
| `pronounce` | VARCHAR | - | 국제음표 발음 기호 |
| `example_en` | TEXT | - | 영문 예문 |
| `example_ko` | TEXT | - | 영문 예문에 대한 한글 번역 |
| `quiz_en` | TEXT | - | 퀴즈용 영문 예문 (키워드 빈칸 `___` 처리) |
| `quiz_ko` | TEXT | - | 퀴즈용 번역 및 가이드 텍스트 |
| `created_at` | TIMESTAMPTZ | Default: now() | 레코드 생성 일시 |

### 1.3 User (사용자 메인 테이블)
서비스 사용자의 전역 프로필 및 최종 진행 상태를 보관합니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | PK, FK (auth.users.id) | Supabase Auth와 연동된 고유 계정 ID |
| `nick` | VARCHAR | NOT NULL | 사용자가 설정한 닉네임 |
| `level` | INTEGER | Default: 700 | 현재 지정된 활성 학습 레벨 (700, 800, 900) |
| `selected` | VARCHAR | - | 현재 암기해야 하는 청크 식별자 (예: '700-marketing_1') |
| `continued` | INTEGER | Default: 0 | 연속 학습 달성 일수 (Streak) |
| `completed_date`| VARCHAR | - | 최근 퀴즈 학습을 최종 완수한 날짜 (YYYY-MM-DD) |
| `created_at` | TIMESTAMPTZ | Default: now() | 가입/등록 일시 |

### 1.4 Voca (사용자별 단어장 학습 진도 테이블)
사용자가 공부 중인 개별 청크별 세부 달성 현황을 보관합니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `voca_id` | UUID | PK, Default: uuid_generate_v4() | 학습 진도 기록 고유 식별자 |
| `user_id` | UUID | FK (User.user_id), ON DELETE CASCADE | 학습 수행자 식별 ID |
| `voca_label` | VARCHAR | NOT NULL | 청크 식별 라벨 (예: '700-marketing_1') |
| `schedule` | INTEGER | NOT NULL | 사용자가 직접 조정 가능한 일차별 학습 우선순위 번호 |
| `done` | JSONB | Default: '[]'::jsonb | 해당 청크 내부에서 완료 토글 처리된 단어 ID 배열 |
| `status` | BOOLEAN | Default: false | 해당 청크 내부의 퀴즈를 모두 완수했는지 여부 |
| `completed_at` | VARCHAR | - | 퀴즈가 성공적으로 완수된 최종 날짜 (YYYY-MM-DD) |
| `created_at` | TIMESTAMPTZ | Default: now() | 데이터 배정 일시 |

---

## 2. LocalStorage 로컬 캐시 스키마

클라이언트의 오프라인 동작 및 초고속 렌더링을 보장하기 위해 LocalStorage의 키 벨류 시스템을 정의합니다.

### 2.1 KEYS.PROFILE (`profile`)
사용자 인증 및 학습 진행에 대한 요약 정보를 보관합니다.
```json
{
  "user_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
  "nick": "학습자",
  "level": 700,
  "selected": "700-marketing_1",
  "continued": 5,
  "completed_date": "2026-05-29",
  "learned": 3
}
```

### 2.2 KEYS.VOCA (`voca`)
각 레벨별로 정렬된 사용자 단어장 학습 목록을 다차원 객체 구조로 보관합니다.
```json
{
  "700": [
    {
      "voca_label": "700-marketing_1",
      "done": ["word-uuid-1", "word-uuid-3"],
      "status": false,
      "completed_at": null,
      "schedule": 1,
      "word": ["word-uuid-1", "word-uuid-2", "word-uuid-3"],
      "category_kr": "마케팅"
    }
  ],
  "800": [],
  "900": []
}
```

### 2.3 KEYS.MASTER (`master`)
백그라운드에서 청크 단위로 점진적으로 다운로드받아 로컬에 완벽히 구축한 사전 데이터 캐시입니다.
```json
{
  "word-uuid-1": {
    "word_id": "word-uuid-1",
    "word": "promote",
    "level": 700,
    "day": 1,
    "category": "마케팅",
    "definitions": [
      {
        "definition_id": "def-uuid-1",
        "class": "v",
        "definition": "홍보하다",
        "pronounce": "prəˈmoʊt",
        "example_en": "We need to promote our new product.",
        "example_ko": "우리는 신제품을 홍보해야 합니다.",
        "quiz_en": "We need to ___ our new product.",
        "quiz_ko": "우리는 신제품을 홍보해야 합니다."
      }
    ]
  }
}
```

---

## 3. 데이터 상호 매핑 규칙

### 3.1 난이도 명칭 매핑 브릿지 (Level Mapping Bridge)
프론트엔드 UI 및 로컬 스토리지 데이터 설계에서 기본으로 사용되는 난이도 문자열과 데이터베이스 필드의 실 정수값 간의 관계는 다음과 같습니다.
- UI의 `"default"` 난이도 또는 설정 템플릿 키는 API 및 로더 바인딩 단계에서 데이터베이스의 실 정수 구분 번호인 **`700`** 레벨과 1:1 결합 및 변환되어 내부 쿼리에 매핑됩니다.
- UI 및 API 레이어 전체에서 난이도 매핑 브릿지 객체(`{ "default": 700 }`)가 정밀 작동하여 불일치에 따른 빈 단어장 배열 리턴 버그를 방지합니다.

### 3.2 고유 식별자 문자열(Voca Label) 규격
각 단어장 청크의 독립성과 고유 데이터 조회를 보장하기 위해 다음과 같은 규칙의 영문 고유 ID 규격(Slug)을 구성합니다.
- **포맷**: `${레벨점수}-${영문_소문자_카테고리_슬러그}`
- **예시**: `700-marketing_1`, `800-general_office_2`
- **목적**: 한글 카테고리 명칭의 인코딩 문제 및 스페이스 등으로 인한 쿼리 가독성 문제를 해소하고, 데이터 결합 무결성을 100% 확보하기 위해 도입되었습니다.
