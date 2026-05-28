import * as S from "./Voca.styles";
import { Outlet, useOutletContext } from "react-router-dom";

export const Voca = () => {
  const context = useOutletContext();

  return (
    <S.Wrapper>
      <Outlet context={context} />
    </S.Wrapper>
  );
};
