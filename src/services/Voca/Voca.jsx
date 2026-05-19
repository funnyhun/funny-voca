import * as S from "./Voca.styles";
import { Outlet } from "react-router-dom";

export const Voca = () => {
  return (
    <S.Wrapper>
      <Outlet />
    </S.Wrapper>
  );
};

