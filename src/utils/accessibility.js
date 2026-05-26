/**
 * 비버튼 요소를 웹 접근성(WAI-ARIA)에 대응하는 안전한 클릭 가능 요소로 변환해 주는 Props 헬퍼입니다.
 * @param {Function} onClick 클릭 이벤트 핸들러
 * @returns {Object} 컴포넌트에 주입할 Props 객체 (role, tabIndex, onClick, onKeyDown)
 */
export const clickableProps = (onClick) => {
  if (!onClick) return {};

  return {
    role: "button",
    tabIndex: 0,
    onClick,
    onKeyDown: (e) => {
      // Enter 키 또는 Space 키 입력 시 onClick 실행
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // 스페이스바의 기본 스크롤 다운 기능 방지
        onClick(e);
      }
    },
  };
};
