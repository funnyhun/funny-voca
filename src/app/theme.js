const colors = {
  // 무채색 기본 (Base)
  white: "#ffffff",
  black: "#000000",

  // Gray 계열 (명도: 97% -> 56% -> 11% 대칭 스케일)
  gray_lite: "#F5F6F8",
  gray: "#8E8E93",
  gray_hard: "#1C1C1E",

  // Blue 계열 (명도: 87% -> 50% -> 11% 대칭 스케일)
  blue_lite: "#C5DDF6",
  blue: "#137FEC",
  blue_hard: "#051C33",

  // Green 계열 (명도: 89% -> 49% -> 10% 대칭 스케일)
  green_lite: "#D3F4DB",
  green: "#34C759",
  green_hard: "#0B2A13",

  // Red 계열 (명도: 94% -> 60% -> 13% 대칭 스케일)
  red_lite: "#FFE5E3",
  red: "#FF3B30",
  red_hard: "#3B0A07",
};

const AppSetting = {
  min_width: "320px",
  max_width: "768px",
};

export const getTheme = (mode) => {
  const isLight = mode === "light";
  return {
    ...AppSetting,
    bg_main: isLight ? colors.white : colors.black,
    bg_inverse: isLight ? colors.black : colors.white,
    bg_app: isLight ? colors.gray_lite : colors.gray_hard,
    text_main: isLight ? colors.gray_hard : colors.gray_lite,
    text_sub: colors.gray,
    text_muted: isLight ? colors.gray_lite : colors.gray,
    brand: colors.blue,
    brand_lite: isLight ? colors.blue_lite : colors.blue_hard,
    success: colors.green,
    success_lite: colors.green_lite,
    danger: colors.red,
  };
};

