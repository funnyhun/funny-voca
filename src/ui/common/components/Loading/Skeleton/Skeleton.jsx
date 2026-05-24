import React from "react";
import * as S from "./Skeleton.styles";

export const Skeleton = ({ width, height, variant = "rect", className }) => {
  return (
    <S.Base
      $width={width}
      $height={height}
      $variant={variant}
      className={className}
    />
  );
};
