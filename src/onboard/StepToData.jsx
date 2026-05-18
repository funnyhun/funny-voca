import styled from "styled-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProgressBar } from "../components/ProgressBar";
import { useVoca } from "../hooks/useVoca";
import { VerticalButton } from "../components/Button";
import { getStorage, KEYS } from "../api/util/storage";

const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  padding-top: 2rem;
`;

const Image = styled.div`
  width: 10rem;
  height: 10rem;

  background-color: ${({ theme }) => theme.week};
  border-radius: 5rem;
`;

const Greet = styled.p`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.1rem;

  white-space: pre-line;
`;

const Content = styled.p`
  color: ${({ theme }) => theme.label};
  text-align: center;
  line-height: 1.7;

  white-space: pre-line;
`;

const LevelSelection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
`;

const ProgressUI = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;

  padding: 0rem 0.2rem;
`;

const ProgressTitle = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${({ theme }) => theme.brand};
`;

const ProgressStatus = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font};
`;

export const StepToData = () => {
  const navigate = useNavigate();
  const { initVoca } = useVoca();
  const nick = getStorage(KEYS.NICK);

  const [status, setStatus] = useState(-1);

  const handleSelectLevel = async (level) => {
    try {
      setStatus(20); // 초기 프로그레스 설정
      await initVoca(level);
      setStatus(100); // 로드 완료
    } catch (err) {
      console.error("[Onboard] 학습데이터 초기화 실패:", err);
      setStatus(-1);
    }
  };

  const startApp = () => {
    navigate("/home");
  };

  let greet = "나만의 단어장을\n만드는 중...";
  let content = `${nick} 님의 학습 데이터를 구성하고 있어요.\n잠시만 기다려주세요.`;
  
  if (status === -1) {
    greet = "학습할 난이도를\n선택해주세요";
    content = `${nick} 님에게 맞는 레벨을 선택해\n맞춤 단어장을 구성해보세요.`;
  } else if (status === 100) {
    greet = "나만의 단어장을\n완성했어요 !";
    content = `${nick} 님의 맞춤 단어장을 완성했어요.\nMyVoca를 시작할까요?`;
  }

  return (
    <Wrapper>
      <Header>
        <Image />
        <Greet>{greet}</Greet>
        <Content>{content}</Content>
      </Header>
      
      {status === -1 && (
        <LevelSelection>
          <VerticalButton label="초급 (Default)" color="main" bg="brand" onClick={() => handleSelectLevel('default')} />
          <VerticalButton label="중급 (800)" color="main" bg="brand" onClick={() => handleSelectLevel('800')} />
          <VerticalButton label="고급 (900)" color="main" bg="brand" onClick={() => handleSelectLevel('900')} />
        </LevelSelection>
      )}

      {status >= 0 && (
        <ProgressUI>
          <ProgressHeader>
            <ProgressTitle>학습데이터 생성 중</ProgressTitle>
            <ProgressStatus>{status}%</ProgressStatus>
          </ProgressHeader>
          <ProgressBar status={status} />
        </ProgressUI>
      )}

      {status === 100 && <VerticalButton label="다음으로" color="main" bg="brand" onClick={startApp} />}
    </Wrapper>
  );
};
