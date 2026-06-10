---
category: "etc"
description: "글래스모피즘 테마 HEX 코드 및 opacity 사양, 애니메이션 규칙 및 컬러 팔레트 가이드라인"
---

# 디자인 가이드라인 명세서 (Design System & Interface Guidelines)

본 문서는 MyVoca 서비스의 UI/UX 일관성을 위해 적용되는 글래스모피즘 테마 HEX 코드 및 opacity 규격, 표준 애니메이션 속성 정의, 그리고 공용 아이콘 모듈 및 3단계 컬러 팔레트의 세부 기술 규칙을 명세합니다.

---

## 1. 글래스모피즘 테마 규격 (Glassmorphism Specifications)

글래스모피즘 효과가 적용되는 영역은 다음의 스타일 규칙을 준수하여 구현합니다.

### 1.1 배경색 및 블러 규칙
- **배경색 지정**: 투명 영역 배경색은 순수한 6자리 **HEX 코드**인 `#FFFFFF` 또는 테마 변수(`bg_main`)로 선언합니다.
- **투명도 분리**: 불투명도(Alpha) 처리는 CSS의 `opacity: 0.08` ~ `opacity: 0.15` 속성을 별도로 결합하여 구현합니다.
- **배경 필터 효과**: `backdrop-filter: blur(12px) saturate(180%)` 속성을 필수로 결합하여 선언합니다.

### 1.2 테두리 및 라운드 규칙
- **테두리 선**: `border: 1px solid #FFFFFF`와 같이 6자리 HEX 코드를 결합하며, 필요한 경우 투명도 속성을 결합합니다.
- **모서리 둥글기 (Border Radius)**: `0.75rem` (12px) ~ `1.25rem` (20px) 사이의 rem 단위를 활용해 구현합니다.

---

## 2. 애니메이션 표준 규칙 (Animation Rules)

웹 UI에 적용되는 트랜지션 모션은 팝업, 슬라이드, 호버의 3가지 유형으로 분류하고 각각의 transition 및 cubic-bezier 속성값을 고정하여 적용합니다.

### 2.1 팝업 애니메이션 (Popup Transition)
- **적용 대상**: 단어 카드 뒤집기, 청크 토글 단추 및 완료 버튼 입력 탭 효과
- **스타일 규칙**: 액티브 상태 시 `scale(0.96)`로 축소 후 탄성 복원 효과를 부여합니다.
- **예제 코드**:
```css
transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease;

&:active {
  transform: scale(0.96);
}
```

### 2.2 슬라이드 애니메이션 (Slide Transition)
- **적용 대상**: 리스트 아이템 정렬 전환, 아코디언 컴포넌트, 드롭다운 목록
- **스타일 규칙**: 상하/좌우 슬라이딩 및 위치 전환 시 적용합니다.
- **예제 코드**:
```css
transition: all 0.3s cubic-bezier(0.25, 1, 0.5, 1);
```

### 2.3 호버 애니메이션 (Hover Transition)
- **적용 대상**: 클릭 가능한 일반 버튼, 카드 아이템, 텍스트 링크
- **스타일 규칙**: 포인터 진입 시 미세한 상단 이동 효과를 부여합니다.
- **예제 코드**:
```css
transition: transform 0.2s ease;

&:hover {
  transform: translateY(-0.125rem); /* -2px 상당 */
}
```

---

## 3. 공용 아이콘 모듈 바인딩 규칙 (Icon Binding Rules)

- **아이콘 사용**: 컴포넌트 내부에 인라인 SVG 마크업을 직접 삽입하는 것을 금지합니다.
- **아이콘 참조**: `src/assets/icons/index.js`에 매핑된 `iconList` 객체 데이터를 임포트하여 화면에 호출합니다.

---

## 4. 테마 및 3단계 표준 컬러 팔레트 규칙 (Color Palette Rules)

런타임 다크 모드 및 라이트 모드 전환 정합성을 위해 단일 컬러 팔레트 규격을 6자리 HEX 코드로 고정하여 선언합니다.

### 4.1 HSL 명도 기준 3단계 표준 HEX 코드 규격
- **Lite**: 밝고 연한 배경 톤 (명도 87% ~ 97% 환산 레벨)
- **Base (1.0)**: 브랜드 코어 및 핵심 상태 피드백 톤 (명도 49% ~ 60% 환산 레벨)
- **Hard**: 텍스트 가독성 및 다크모드 대비용 어두운 톤 (명도 10% ~ 13% 환산 레벨)

### 4.2 컬러 팔레트 HEX 코드 상수 정의
- **Gray**: lite `#F5F6F8`, base `#8E8E93`, hard `#1C1C1E`
- **Blue**: lite `#C5DDF6`, base `#137FEC`, hard `#051C33`
- **Green**: lite `#D3F4DB`, base `#34C759`, hard `#0B2A13`
- **Red**: lite `#FFE5E3`, base `#FF3B30`, hard `#3B0A07`
- **공통**: 흰색 `#FFFFFF`, 검은색 `#000000`

### 4.3 테마 변수 매핑 테이블
컴포넌트는 styled-components의 `theme` 객체 프로퍼티로 변환되어 전달되는 의미론적 테마 변수만을 호출하여 스타일을 처리합니다.
- `bg_main`: 메인 영역 배경색
- `bg_inverse`: 반전 영역 배경색
- `bg_app`: 앱 전역 바디 배경색
- `text_main`: 메인 가독 텍스트 색상
- `text_sub`: 서브 보조 텍스트 색상
- `text_muted`: 비활성 텍스트 및 기본 아이콘 색상
- `brand`: 브랜드 대표 색상
- `brand_lite`: 브랜드 보조/연한 색상
- `success`: 완료/성공 상태 색상
- `success_lite`: 완료/성공 보조/연한 색상
- `danger`: 실패/에러 상태 색상

---

## 5. 스타일 시스템 및 반응형 표준 규격 (Style System & Responsive Spec)

### 5.1 rem 환산 표준 규격
모든 스타일은 `1rem = 16px` 절대 비율을 기준으로 환산한 rem 단위를 적용합니다.
- **환산 대조 가이드**:
  - 12px = 0.75rem
  - 14px = 0.875rem
  - 16px = 1rem
  - 20px = 1.25rem
  - 24px = 1.5rem
  - 32px = 2rem
  - 40px = 2.5rem
  - 50px = 3.125rem
  - 60px = 3.75rem

### 5.2 반응형 중단점 (Responsive Breakpoints)
글로벌 레이아웃 폰트 스케일 조절을 위해 다음 3단계 브레이크포인트를 적용합니다.
- **375px 미만**: 소형 모바일 디바이스 대응 (루트 font-size 14px)
- **375px 이상**: 일반 모바일 디바이스 대응 (루트 font-size 16px)
- **768px 이상**: 태블릿 디바이스 대응 (루트 font-size 18px)
- **1024px 이상**: 데스크톱 디바이스 대응 (루트 font-size 20px)
