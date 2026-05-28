import { useNavigate } from "react-router-dom";
import { QuizIcon, PlayIcon } from "@/assets/iconList";
import {
  DashboardWrapper,
  HeaderContainer,
  Title,
  LevelBadge,
  ProgressContainer,
  ProgressLabel,
  ProgressBarBackground,
  ProgressBarFill,
  StreakBadge,
  ActionContainer,
  ActionButton,
} from "./StatsDashboard.styles";

export const StatsDashboard = ({ profile, voca }) => {
  const navigate = useNavigate();
  const currentDayIndex = profile?.selected ?? 0;

  const totalWords = (voca || [])
    .filter(Boolean)
    .reduce((acc, curr) => acc + (curr.length || 0), 0);
  const learnedWords = profile.learned || 0;
  const progressPercent = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

  const levelLabels = {
    "default": "초급 (Default)",
    "800": "중급 (800)",
    "900": "고급 (900)"
  };
  const currentLevelLabel = levelLabels[profile?.level] || "알 수 없음";

  return (
    <DashboardWrapper>
      <HeaderContainer>
        <Title>학습 대시보드</Title>
        <LevelBadge>{currentLevelLabel}</LevelBadge>
      </HeaderContainer>
      
      <ProgressContainer>
        <ProgressLabel>
          <span>전체 마스터 진행률</span>
          <span>{progressPercent}%</span>
        </ProgressLabel>
        <ProgressBarBackground>
          <ProgressBarFill $progress={progressPercent} />
        </ProgressBarBackground>
        <ProgressLabel style={{ fontSize: '0.8rem', color: '#aaaaaa' }}>
          <span>{learnedWords} 단어 완료</span>
          <span>{totalWords} 단어</span>
        </ProgressLabel>
      </ProgressContainer>

      <StreakBadge>
        🔥 {profile.continued}일 연속 학습 중!
      </StreakBadge>

      <ActionContainer>
        <ActionButton onClick={() => navigate(`/play/${currentDayIndex}`)}>
          <PlayIcon />
          <span>암기하기</span>
        </ActionButton>
        <ActionButton onClick={() => navigate(`/quiz/${currentDayIndex}`)}>
          <QuizIcon />
          <span>퀴즈풀기</span>
        </ActionButton>
      </ActionContainer>
    </DashboardWrapper>
  );
};

