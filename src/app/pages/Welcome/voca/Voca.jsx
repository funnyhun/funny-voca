import * as S from "./Voca.styles";
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import { ProgressBar, VerticalButton, Spinner } from "@app/components";
import { getStorage, KEYS, setStorage } from "@/api/common";

export const Voca = () => {
  const navigate = useNavigate();
  const { vocaState, statsState } = useOutletContext();
  const { initVoca } = vocaState;
  
  const profile = getStorage(KEYS.PROFILE);
  const nick = profile?.nick || "게스트";

  const [status, setStatus] = useState(-1);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSelectLevel = async (level) => {
    try {
      setStatus(20); // 초기 프로그레스 설정

      // 1. 단어 데이터 생성 및 획득 (가짜 상태 useVoca 대신 Context API와 동기화)
      const res = await initVoca(level);
      
      const activeLevel = Number(level) || 700;
      const latestVoca = res || getStorage(KEYS.VOCA) || {};
      const levelVocaList = latestVoca[activeLevel] || [];
      const firstLabel = levelVocaList[0]?.voca_label || "";

      // 2. 로컬 프로필 및 웰컴 진행 앵커 완성
      const updatedProfile = {
        nick: nick,
        level: activeLevel,
        startedTime: profile?.startedTime || new Date().getTime(),
        continued: profile?.continued || 0,
        today: profile?.today || 0,
        learned: 0,
        selected: firstLabel,
        completed_date: null
      };
      setStorage(KEYS.PROFILE, updatedProfile);

      // 3. statsState에도 반영하여 최신 상태 동기화
      if (statsState?.updateSelectedLabel) {
        statsState.updateSelectedLabel(firstLabel);
      }

      setStatus(100); // 로드 완료
    } catch (err) {
      console.error("[Onboard] 학습데이터 초기화 실패:", err);
      setStatus(-1);
    }
  };

  const startApp = () => {
    setIsNavigating(true);
    navigate("/", { state: { fromOnboarding: true } });
  };

  let greet = "나만의 단어장을\n만드는 중...";
  let content = `${nick} 님의 학습 데이터를 구성하고 있어요.\n잠시만 기다려주세요.`;
  
  if (status === -1) {
    greet = "학습할 난이도를\n선택해주세요";
    content = `${nick} 님에게 맞는 레벨을 선택해\n맞춤 단어장을 구성해보세요.`;
  } else if (status === 100) {
    greet = "나만의 단어장을\n완성했어요 !";
    content = `${nick} 님의 맞춤 단어장을 완성했어요.\nfunny-voca를 시작할까요?`;
  }

  return (
    <>
      {isNavigating && <Spinner fullScreen message="데이터를 구성하고 있습니다..." />}
      <S.Wrapper>
      <S.Header>
        <S.Image />
        <S.Greet>{greet}</S.Greet>
        <S.Content>{content}</S.Content>
      </S.Header>
      
      {status === -1 && (
        <S.LevelSelection>
          <VerticalButton label="초급 (700)" color="main" bg="brand" onClick={() => handleSelectLevel('700')} />
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
    </>
  );
};
