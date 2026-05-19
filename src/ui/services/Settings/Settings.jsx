import * as S from "./Settings.styles";
import { Button } from "@/ui/common";
import { signOut } from "@/common/api/auth/actions";
import { useContext, useState } from "react";
import { ProfileContext, StatsContext, VocaContext } from "@/ui/app/App";
import { checkIsGuest } from "@/common/api/auth/session";
import { 
  getStorage, 
  setStorage, 
  removeStorage, 
  clearStorage, 
  KEYS 
} from "@/common/api/util/storage";

export const Settings = () => {
  const { nick } = useContext(ProfileContext);
  const { userData } = useContext(StatsContext);
  const [resetting, setResetting] = useState(false);
  const [resetProgress, setResetProgress] = useState(0);
  const { resetVoca } = useContext(VocaContext);

  const isGuest = checkIsGuest();


  const handleLogout = async () => {
    const confirmed = window.confirm(
      isGuest
        ? "게스트 데이터를 삭제하고 나가시겠어요?\n저장된 모든 학습 기록이 사라집니다."
        : "로그아웃 하시겠어요?\n데이터는 서버에 안전하게 보관됩니다."
    );
    if (!confirmed) return;

    if (isGuest) {
      clearStorage();
    } else {
      await signOut();
      removeStorage(KEYS.NICK);
    }
    window.location.href = "/";
  };

  const handleLevelChange = (newLevel) => {
    if (userData?.level === newLevel) return;
    const confirmed = window.confirm(
      "학습 난이도를 변경하시겠습니까?\n이전 난이도의 학습 상태는 유지됩니다."
    );
    if (!confirmed) return;

    const currentLocal = getStorage(KEYS.USER_DATA) || {};
    currentLocal.level = newLevel;
    setStorage(KEYS.USER_DATA, currentLocal);
    
    // 새로고침하여 데이터 리로드
    window.location.href = "/";
  };

  const handleReset = async () => {
    const confirmed = window.confirm(
      "⚠️ 학습 데이터를 완전히 초기화할까요?\n\n진행률, 단어 배정이 모두 삭제되고\n새로운 단어 배정이 시작됩니다.\n\n이 작업은 되돌릴 수 없습니다."
    );
    if (!confirmed) return;

    const doubleConfirmed = window.confirm(
      "정말로 초기화하시겠어요? 마지막 확인입니다."
    );
    if (!doubleConfirmed) return;

    setResetting(true);
    setResetProgress(30);

    try {
      await resetVoca(userData?.level || "default");
      setResetProgress(100);
      window.location.href = "/";
    } catch (err) {
      console.error("초기화 실패:", err);
      alert("초기화 중 오류가 발생했습니다. 다시 시도해주세요.");
      setResetting(false);
    }
  };


  return (
    <>
      {resetting && (
        <S.LoadingOverlay>
          <span>학습 데이터 초기화 중...</span>
          <S.ProgressBar>
            <S.ProgressFill $value={resetProgress} />
          </S.ProgressBar>
          <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>{resetProgress}%</span>
        </S.LoadingOverlay>
      )}
      <S.Wrapper>
        <S.Section>
          <S.SectionTitle>계정 설정</S.SectionTitle>
          <S.UserInfo>
            <S.Label>닉네임</S.Label>
            <S.Value>{nick || "Guest"}</S.Value>
            <S.Label>상태</S.Label>
            <S.Value>{isGuest ? "게스트 모드" : "로그인 완료"}</S.Value>
            {userData?.startedTime && (
              <>
                <S.Label>학습 시작일</S.Label>
                <S.Value>
                  {new Date(userData.startedTime).toLocaleDateString("ko-KR")}
                </S.Value>
              </>
            )}
          </S.UserInfo>
        </S.Section>

        <S.Section>
          <S.SectionTitle>학습 난이도</S.SectionTitle>
          <S.LevelButtons>
            <S.LevelButton 
              $active={userData?.level === "default"} 
              onClick={() => handleLevelChange("default")}
            >
              초급 (Default)
            </S.LevelButton>
            <S.LevelButton 
              $active={userData?.level === "800"} 
              onClick={() => handleLevelChange("800")}
            >
              중급 (800)
            </S.LevelButton>
            <S.LevelButton 
              $active={userData?.level === "900"} 
              onClick={() => handleLevelChange("900")}
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

        <S.Section style={{ marginTop: "auto" }}>
          <Button
            label={isGuest ? "데이터 삭제 및 나가기" : "로그아웃"}
            color="main"
            bg="brand"
            onClick={handleLogout}
          />
        </S.Section>
      </S.Wrapper>
    </>
  );
};
