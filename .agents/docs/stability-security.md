# 런타임 안정성 및 예외 관리 명세서 (Runtime Stability & Exception Management)

본 문서는 MyVoca 서비스의 런타임 안정성을 확보하기 위해 적용된 React 렌더링 최적화 기법, Supabase API 예외 처리 구조, 그리고 데이터 무결성을 보장하는 오프라인 예외 복구 사양을 명세합니다.

---

## 1. React 무한 렌더링 루프 원천 방지 기법 (Infinite Render Loop Prevention)

리액트 애플리케이션 가동 과정에서 종종 발생하는 `Maximum Update Depth Exceeded` 장애는 주로 커스텀 훅의 의존성 배열에 객체나 배열을 직접 바인딩하여 얕은 비교(Shallow Comparison)가 매 프레임 실패함으로써 무한 상태 갱신 루프가 촉발되는 데서 기인합니다. MyVoca는 이를 방어하기 위해 **문자열 딥 비교(Deep Comparison) 규칙**을 전면 수립했습니다.

### 1.1 `useVoca` 및 `useStats` 훅 내의 적용 사례

- **기존 문제 상황**:
  `useEffect` 내부에서 외부의 대규모 데이터 맵(`initialVoca`, `initialProfile` 등)을 전달받아 상태 초기화 및 구독을 진행할 때, 얕은 복사 참조값 불일치로 인해 렌더링 루프가 끊임없이 순환했습니다.
- **해결 정밀 기법**:
  ```javascript
  useEffect(() => {
    if (!vocaList || Object.keys(vocaList).length === 0) return;
    
    // 객체나 배열 데이터 자체를 의존 배열에 직접 넘기는 대신, 
    // JSON.stringify()를 통해 가볍고 확실한 문자열 직렬화 딥 비교를 수행합니다.
    const activeLabel = selectedLabel || getStorage(KEYS.PROFILE)?.selected || "";
    wordQueueManager.setVocaList(vocaList, activeLabel);

  }, [JSON.stringify(vocaList), selectedLabel]);
  ```
- **효과**: 값 자체의 변화(내부 문자열의 불일치)가 실질적으로 생성된 틱에만 정확하게 이펙트 블록이 실행되도록 제어하여, 불필요한 재렌더링 횟수를 대폭 감소시키고 런타임 무한 루프 장애를 영구적으로 제거했습니다.

---

## 2. Supabase API 통신 오류 복구 및 예외 처리 (API Error Resilience)

서버 단의 순시적인 다운, Bad Request 규격 위반, 네트워크 단절(순단) 상황에서도 클라이언트의 데이터 정합성을 무결하게 보호하기 위한 철저한 방어선입니다.

### 2.1 넌블로킹 동기화 예외 격리
- **넌블로킹 위임**: `index.js` 오케스트레이션 단계에서 Supabase 통신(Insert/Update/Delete)은 리턴 프라미스가 UI 스레드 바깥으로 격리된 채 실행됩니다.
- **Fail-Safe 로깅**: 서버 통신 실패 시 화면을 정지시키는 것이 아니라, 오류 로그를 콘솔에 기록한 뒤 `catch` 처리하여 후속 비즈니스 연산으로 안전히 이행시킵니다.

### 2.2 3단계 임시 음수 치환을 통한 Bad Request 예외 배제
- Supabase의 복합 유니크 키 충돌로 인해 API 요청이 차단되는 현상(예: `duplicate key value violates unique constraint` 에러)을 미연에 방지하기 위해, 모든 스케줄 변경과 레벨 변경 틱에서 **3단계 임시 음수 치환 트랜잭션**을 수동 모방하여 DB 레코드 꼬임 및 동기화 누수를 방지합니다.

---

## 3. 오프라인 로컬 커밋 및 데이터 무결성 보장 (Offline Commits)

사용자가 모바일 환경에서 갑자기 네트워크 음영 구역(지하철, 엘리베이터 등)으로 전이되는 경우에 대비하여, 기획상 규정된 학습 기록의 무결성을 영구 보존합니다.

| 시나리오 구분 | 인터넷 연결 상태 (Online) | 통신 단절 상태 (Offline) |
| :--- | :--- | :--- |
| **단어/청크 완료 반영** | 로컬 캐시를 선행 변경하고 즉각 LocalStorage에 즉시 쓰기 커밋(`setStorage`)을 수행한 뒤, 백그라운드 스레드로 Supabase 서버에 전송합니다. | 로컬 캐시 변경 및 LocalStorage 쓰기는 0ms 이내에 오프라인 상태에서도 동일하게 **100% 정상 완수**됩니다. 비동기 Supabase API 호출만 순시 실패 처리되어 격리됩니다. |
| **네트워크 복구 시** | 실시간 동기화 상태가 항시 정상 유지됩니다. | 사용자가 나중에 인터넷이 복구된 뒤 앱을 재기동하거나 페이지 새로고침을 수행할 시, `loadUserData` 로더에서 로컬의 선 완료 데이터와 서버 데이터의 정합성을 재검증하여 미처리 상태를 동적으로 오토 커밋(Auto-Commit) 동기화합니다. |

---

## 4. 보안 및 크레덴셜 자가 진단 지침 (Credential Security)

- **크레덴셜 노출 원천 차단**: 소스코드 및 문서 내에 Supabase의 민감한 마스터 API Key, 인증 비밀번호, 개인 식별용 메타데이터가 하드코딩되는 것을 원천 차단합니다.
- **환경 변수 격리**: 모든 외부 접속 크레덴셜 정보는 반드시 프로젝트 루트의 `.env` 및 `.env.production` 파일 내에 완전 격리 보관하고, 빌드 툴(Vite)의 로더 체인을 거쳐 정적으로 치환되도록 제어하여 소스 제어 관리 시스템(Git)에 민감 정보가 흘러 들어가는 보안 위협을 원천 봉쇄합니다.
