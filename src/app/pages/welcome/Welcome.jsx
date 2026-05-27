import * as S from "./Welcome.styles";
import { Outlet, useOutletContext } from "react-router-dom";
import { Suspense } from "react";

export const Welcome = () => {
  const context = useOutletContext();
  return (
    <S.Wrapper>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet context={context} />
      </Suspense>
    </S.Wrapper>
  );
};
