import * as S from "./Settings.styles";
import { Button, Spinner } from "@app/components";
import { updateLevel, reschedule, logout } from "@/api/voca";
import { useState } from "react";
import { useNavigate, useRevalidator, useOutletContext } from "react-router-dom";

/**
 * Settings
 * - 학습 레벨 변경, 데이터 초기화 및 로그아웃 등 설정을 제어하는 설정 화면 컴포넌트입니다.
 * - 레벨 하향(다운그레이드) 변경 시 강력한 경고 컨펌 다이얼로그를 추가 노출합니다.
 */
export const Settings = () => {
  const { profileState, statsState, vocaState } = useOutletContext();
  const { nick } = profileState;
  const { profile } = statsState;
  const [resetting, setResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);

  const navigate = useNavigate();
  const revalidator = useRevalidator();

  // 게스트 여부 판별 (startedTime 속성이 없거나 닉네임 유무, 또는 로컬스토리지에 세션 유무로 판단)
  const isGuest = profile.user_id === "guest" || !profile?.startedTime;

  // 1. 로그아웃 처리 (회원 로그인 상태에서만 호출 가능)
  const handleLogout = async () => {
    const confirmed = window.confirm(
      "로그아웃 하시겠어요?\n데이터는 서버에 안전하게 보관됩니다."
    );
    if (!confirmed) return;

    setResetting(true);
    setResetProgress(30);

    try {
      await logout();
      setResetProgress(100);
      navigate("/welcome");
    } catch (err) {
      console.error("로그아웃 실패:", err);
      alert("로그아웃 처리 중 오류가 발생했습니다.");
      setResetting(false);
    }
  };

  // 2. 학습 레벨 변경 처리 (실시간 진행률 연동)
  const handleLevelChange = async (targetLevel) => {
    const currentLevel = profile?.level || 700;
    
    // 타겟 레벨 및 현재 레벨을 숫자로 정규화
    const currentNum = currentLevel === "default" ? 700 : parseInt(currentLevel) || 700;
    const targetNum = targetLevel === "default" ? 700 : parseInt(targetLevel) || 700;

    if (currentNum === targetNum) return;

    // 기본 경고 컨펌
    const confirmed = window.confirm(
      "학습 난이도를 변경하시겠습니까?\n\n이전 난이도의 학습 진행 상황은 모두 삭제되고\n선택한 난이도를 기준으로 학습 데이터가 재설정됩니다.\n\n이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    // 레벨 하향(다운그레이드) 시 강력한 경고 다이얼로그 추가 노출
    if (targetNum < currentNum) {
      const doubleConfirmed = window.confirm(
        "경고: 난이도를 낮추면 상위 레벨의 성취 및 학습 정보가 영구적으로 삭제됩니다!\n\n정말로 난이도를 하향하시겠습니까?"
      );
      if (!doubleConfirmed) return;
    }

    setResetting(true);
    setResetProgress(10);

    try {
      // API 호출 시 실시간 진행율 콜백 연동
      const success = await updateLevel(targetNum, (progress) => {
        setResetProgress(progress);
      });
      if (!success) throw new Error("API 리턴 실패");

      setResetProgress(100);
      revalidator.revalidate();
      navigate("/home");
    } catch (err) {
      console.error("난이도 변경 실패:", err);
      alert("난이도 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
      setResetting(false);
    }
  };

  // 3. 학습 데이터 초기화 처리 (공장 초기화 연동)
  const handleReset = async () => {
    const confirmed = window.confirm(
      "학습 데이터를 완전히 초기화할까요?\n\n진행률, 단어 배정이 모두 삭제되고\n최초 화면으로 돌아가 완전히 새롭게 시작됩니다.\n\n이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      "정말로 초기화하시겠어요? 마지막 확인입니다."
    );
    if (!doubleConfirmed) return;

    setResetting(true);
    setResetProgress(50);

    try {
      // 훅 내부의 공장 초기화 비즈니스 시나리오 호출
      await vocaState.resetVoca();
      setResetProgress(100);
    } catch (err) {
      console.error("초기화 실패:", err);
      alert("초기화 중 오류가 발생했습니다. 다시 시도해주세요.");
      setResetting(false);
    }
  };

  const isLevelActive = (lvl) => {
    const activeLevel = profile?.level || 700;
    if (lvl === 700) {
      return activeLevel === "default" || activeLevel === 700 || activeLevel === "700";
    }
    return activeLevel === lvl || activeLevel === String(lvl);
  };

  return (
    <>
      {resetting && (
        <Spinner
          fullScreen
          message="학습 데이터 초기화 중..."
          status={resetProgress}
        />
      )}
      <S.Wrapper>
        <S.Section>
          <S.SectionTitle>계정 설정</S.SectionTitle>
          <S.UserInfo>
            <S.Label>닉네임</S.Label>
            <S.Value>{nick || "Guest"}</S.Value>
            <S.Label>상태</S.Label>
            <S.Value>{isGuest ? "게스트 모드" : "로그인 완료"}</S.Value>
            {profile?.startedTime && (
              <>
                <S.Label>학습 시작일</S.Label>
                <S.Value>
                  {new Date(profile.startedTime).toLocaleDateString("ko-KR")}
                </S.Value>
              </>
            )}
          </S.UserInfo>
        </S.Section>

        <S.Section>
          <S.SectionTitle>학습 난이도</S.SectionTitle>
          <S.LevelButtons>
            <S.LevelButton 
              $active={isLevelActive(700)} 
              onClick={() => handleLevelChange(700)}
            >
              초급 (700)
            </S.LevelButton>
            <S.LevelButton 
              $active={isLevelActive(800)} 
              onClick={() => handleLevelChange(800)}
            >
              중급 (800)
            </S.LevelButton>
            <S.LevelButton 
              $active={isLevelActive(900)} 
              onClick={() => handleLevelChange(900)}
            >
              고급 (900)
            </S.LevelButton>
          </S.LevelButtons>
        </S.Section>

        <S.Section>
          <S.SectionTitle>데이터 관리</S.SectionTitle>
          <Button
            label="학습 데이터 초기화"
            color="font"
            bg="main"
            onClick={handleReset}
          />
        </S.Section>

        {!isGuest && (
          <S.Section style={{ marginTop: "auto" }}>
            <Button
              label="로그아웃"
              color="main"
              bg="brand"
              onClick={handleLogout}
            />
          </S.Section>
        )}
      </S.Wrapper>
    </>
  );
};
