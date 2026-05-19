import * as S from "./StepToData.styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { ProgressBar, VerticalButton } from "@/common/components";
import { useVoca } from "@/common/hooks/useVoca";
import { getStorage, KEYS } from "@/common/api/util/storage";

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
    <S.Wrapper>
      <S.Header>
        <S.Image />
        <S.Greet>{greet}</S.Greet>
        <S.Content>{content}</S.Content>
      </S.Header>
      
      {status === -1 && (
        <S.LevelSelection>
          <VerticalButton label="초급 (Default)" color="main" bg="brand" onClick={() => handleSelectLevel('default')} />
          <VerticalButton label="중급 (800)" color="main" bg="brand" onClick={() => handleSelectLevel('800')} />
          <VerticalButton label="고급 (900)" color="main" bg="brand" onClick={() => handleSelectLevel('900')} />
        </S.LevelSelection>
      )}

      {status >= 0 && (
        <S.ProgressUI>
          <S.ProgressHeader>
            <S.ProgressTitle>학습데이터 생성 중</S.ProgressTitle>
            <S.ProgressStatus>{status}%</S.ProgressStatus>
          </S.ProgressHeader>
          <ProgressBar status={status} />
        </S.ProgressUI>
      )}

      {status === 100 && <VerticalButton label="다음으로" color="main" bg="brand" onClick={startApp} />}
    </S.Wrapper>
  );
};
