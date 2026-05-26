import * as S from "./Setup.styles";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";

export const Setup = () => {
  return (
    <S.Wrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </S.Wrapper>
  );
};
