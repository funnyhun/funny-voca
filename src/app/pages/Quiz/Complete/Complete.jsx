import * as S from "./Complete.styles";
import { Button } from "@app/components";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useEffect } from "react";

export const Complete = () => {
  const navigate = useNavigate();
  const { statsState } = useOutletContext();
  const { profile, recordSession } = statsState;

  useEffect(() => {
    recordSession();
  }, [recordSession]);

  const navigateHome = () => navigate("/home");
  const navigateVoca = () => navigate(`/voca/${profile.selected}`);

  return (
    <S.Wrapper>
      <S.Image />
      <S.Title>퀴즈 완료!</S.Title>
      <S.Content>{"모든 퀴즈를 정답으로 맞혔습니다.\n단어장으로 이동해 결과를 확인할까요?"}</S.Content>
      <S.Pannel>
        <Button label="단어장 확인하기" color="main" bg="brand" onClick={navigateVoca} />
        <Button label="홈으로 돌아가기" color="font" bg="main" onClick={navigateHome} />
      </S.Pannel>
    </S.Wrapper>
  );
};

