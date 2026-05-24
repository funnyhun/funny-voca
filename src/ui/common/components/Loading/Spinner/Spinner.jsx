import React from "react";
import * as S from "./Spinner.styles";

export const Spinner = ({ fullScreen = false, size = "48px", message }) => {
  return (
    <S.Overlay $fullScreen={fullScreen}>
      <S.Circle $size={size} />
      {message && <S.Message>{message}</S.Message>}
    </S.Overlay>
  );
};
