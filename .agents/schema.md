---
category: "core"
description: "데이터베이스 테이블 정의 및 로컬 스토리지 캐시 스키마 명세"
---

# 데이터베이스 및 저장소 스키마 명세서 (Database & Storage Schema Specification)

본 문서는 MyVoca 서비스의 Supabase 원격 데이터베이스 테이블 명세와 로컬 캐시(LocalStorage)의 데이터 구조, 그리고 여러 테이블이 조합되어 생성되는 클라이언트 가공 데이터셋 구조를 정의합니다. 본 문서는 모든 도메인 문서들의 단일 참조 원천(Single Source of Truth)으로 사용됩니다.

---

## 1. Supabase 원격 데이터베이스 테이블 명세

### 1.1 User (사용자 메인 테이블)
사용자의 전역 프로필과 최종 학습 진도 상태를 보관하는 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `user_id` | UUID | PK, FK (auth.users.id) | Supabase Auth 회원 계정 연동 고유 식별자 |
| `nick` | VARCHAR | NOT NULL | 사용자가 설정한 프로필 닉네임 |
| `level` | INTEGER | Default: 700 | 현재 지정된 활성 학습 레벨 (700, 800, 900) |
| `selected` | VARCHAR | - | 현재 암기해야 하는 청크 식별자 (예: '700-marketing_1') |
| `continued` | INTEGER | Default: 0 | 연속 학습 달성 일수 (Streak 일수) |
| `completed_date`| VARCHAR | - | 최근 퀴즈 학습을 최종 완수한 날짜 (YYYY-MM-DD) |
| `created_at` | TIMESTAMPTZ | Default: now() | 계정 최초 가입/생성 일시 |

### 1.2 Voca (사용자별 단어장 학습 상태 테이블)
사용자가 공부 중인 개별 청크의 세부 달성 현황 및 우선순위를 보관하는 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `voca_id` | UUID | PK, Default: uuid_generate_v4() | 학습 진도 레코드 고유 ID |
| `user_id` | UUID | FK (User.user_id), ON DELETE CASCADE | 학습 수행자 식별 ID |
| `voca_label` | VARCHAR | NOT NULL, UNIQUE(user_id, voca_label) | 청크 고유 식별 라벨 (예: '700-marketing_1') |
| `schedule` | INTEGER | NOT NULL, UNIQUE(user_id, schedule) | 사용자가 직접 조정 가능한 일차별 학습 순번 |
| `done` | JSONB | Default: '[]'::jsonb | 청크 내 완료 처리(체크)된 단어 ID 배열 |
| `status` | BOOLEAN | Default: false | 해당 청크 내부의 퀴즈를 모두 완수했는지 여부 |
| `completed_at` | VARCHAR | - | 퀴즈가 성공적으로 완수된 최종 날짜 (YYYY-MM-DD) |
| `created_at` | TIMESTAMPTZ | Default: now() | 레코드 데이터 배정 일시 |

### 1.3 Schedule (기본 카테고리 순서 권장 스케줄 테이블)
신규 난이도 진입이나 스케줄 초기화 시, 기본 스케줄 순서의 기준이 되는 마스터 카테고리 정렬 정보 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `schedule_id` | INTEGER | PK | 정렬 인덱스 ID |
| `category_en` | VARCHAR | NOT NULL | 영문 카테고리 슬러그 명칭 |
| `schedule` | INTEGER | NOT NULL | 추천 권장 스케줄 순번 |

### 1.4 Word (단어 마스터 정보 테이블)
서비스의 모든 영어 단어 기본 정보를 보관하는 마스터 테이블입니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `word_id` | INTEGER | PK | 단어 고유 식별 번호 (1637 ~ 5236) |
| `word` | VARCHAR | NOT NULL, UNIQUE | 단어의 영어 스펠링 |
| `level` | INTEGER | NOT NULL, Default: 700 | 학습 목표 난이도 구분 (700, 800, 900) |
| `day` | INTEGER | NOT NULL, Default: 1 | 학습 권장 차수 (Day) |
| `category` | VARCHAR | - | 단어의 한글 카테고리 테마 명칭 |

### 1.5 Definition (품사별 번역 뜻 및 예문/퀴즈 테이블)
단어의 실제 품사별 뜻과 예문, 퀴즈 문장을 포함하고 있는 상세 테이블이며, `Word` 테이블과 1:N 관계를 맺습니다.

| 컬럼명 | 데이터 타입 | 제약 조건 | 설명 |
| :--- | :--- | :--- | :--- |
| `definition_id` | UUID | PK, Default: uuid_generate_v4() | 뜻 정보 고유 식별자 |
| `word_id` | INTEGER | FK (Word.word_id), ON DELETE CASCADE | 부모 단어 식별 ID |
| `class` | VARCHAR | NOT NULL | 단어의 품사 약칭 (n, v, adj, adv 등) |
| `definition` | VARCHAR | NOT NULL | 단어의 한글 번역 뜻 |
| `pronounce` | VARCHAR | - | 국제 음표 발음 기호 |
| `example_en` | TEXT | - | 영문 예문 |
| `example_ko` | TEXT | - | 영문 예문에 대한 한글 번역 |
| `quiz_en` | TEXT | - | 퀴즈용 영문 예문 (키워드 빈칸 `___` 처리) |
| `quiz_ko` | TEXT | - | 퀴즈용 한글 번역 및 힌트 가이드 |

---

## 2. 클라이언트 가공 데이터셋 명세 (Master 사전 데이터)

프론트엔드 UI 및 백그라운드 다운로드 큐 매니저가 로컬 사전으로 활용하는 `Master` 데이터는 Supabase의 물리적인 단일 테이블이 아닙니다.
`Word` 테이블과 `Definition` 테이블을 조인(`select word_id, word, definitions:Definition(...)`)하여, 단어 ID를 Key로 하도록 포맷팅하고 가공한 **통합 클라이언트 단어 사전 데이터셋**입니다.

### Master 가공 사양 및 예시
```json
{
  "1637": {
    "word_id": 1637,
    "word": "resume",
    "definitions": [
      {
        "class": "n",
        "definition": "이력서",
        "pronounce": "rɪˈzuːm",
        "example_en": "Send your resume to our office.",
        "example_ko": "우리 사무실로 이력서를 보내주세요.",
        "quiz_en": "Send your ___ to our office.",
        "quiz_ko": "우리 사무실로 이력서를 보내주세요."
      }
    ]
  }
}
```

---

## 3. LocalStorage 로컬 캐시 스키마

### 3.1 KEYS.PROFILE (`profile`)
사용자 인증 및 학습 진행 요약 정보 캐시입니다.
```json
{
  "nick": "학습자",
  "level": 800,
  "selected": "800-marketing_1",
  "continued": 5,
  "completed_date": "2026-06-03",
  "learned": 14
}
```

### 3.2 KEYS.VOCA (`voca`)
각 레벨별로 빌드되어 정렬된 사용자의 청크 학습 목록 목록 캐시입니다.
```json
{
  "700": [
    {
      "voca_label": "700-marketing_1",
      "done": [1637, 1639],
      "status": false,
      "completed_at": null,
      "schedule": 1,
      "word": [1637, 1638, 1639, 1640],
      "category_kr": "마케팅"
    }
  ],
  "800": [],
  "900": []
}
```

### 3.3 KEYS.MASTER (`master`)
백그라운드에서 로드된 `Master` 단어 가공 데이터셋이 실시간 점진적으로 병합 및 영속화되는 로컬 단어 사전 캐시입니다.
구조는 **'2. 클라이언트 가공 데이터셋 명세'**의 JSON Map 형식과 100% 일치합니다.
