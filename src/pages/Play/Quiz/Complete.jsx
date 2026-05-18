import styled from "styled-components";
import { Button } from "../../../components/Button";
import { useNavigate } from "react-router-dom";
import { useSelected } from "../../../hooks/useMyParam";
import { useEffect, useContext } from "react";
import { StatsContext } from "../../../App";

const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  padding-bottom: 1rem;
`;

const Image = styled.div`
  width: 13rem;
  height: 15rem;

  background-color: ${({ theme }) => theme.brand};
  border-radius: 1rem;

  margin: 0rem 10rem;
`;

const Title = styled.h3`
  font-weight: 600;

  padding-top: 0.5rem;
`;

const Content = styled.div`
  color: ${({ theme }) => theme.label};
  text-align: center;
  line-height: 2;
  white-space: pre-wrap;
`;

const Pannel = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin-top: auto;
`;

export const Complete = () => {
  const navigate = useNavigate();
  const { selected } = useSelected();
  const { recordSession } = useContext(StatsContext);

  useEffect(() => {
    recordSession();
  }, [recordSession]);

  const navigateHome = () => navigate("/home");
  const navigateVoca = () => navigate(`/voca/${selected}`);

  return (
    <Wrapper>
      <Image />
      <Title>퀴즈 완료!</Title>
      <Content>{"모든 퀴즈를 정답으로 맞혔습니다.\n단어장으로 이동해 결과를 확인할까요?"}</Content>
      <Pannel>
        <Button label="단어장 확인하기" color="main" bg="brand" onClick={navigateVoca} />
        <Button label="홈으로 돌아가기" color="font" bg="main" onClick={navigateHome} />
      </Pannel>
    </Wrapper>
  );
};

