import { useNavigate } from "react-router-dom";
import { QuizIcon, PlayIcon } from "@/assets/iconList";
import * as S from "./StatsDashboard.styles";

/**
 * StatsDashboard
 * - 학습 진행률, 일일 연속 학습일(continued), 당일 학습 여부 및 실시간 추천 학습 앵커 바로가기를 표출하는 홈 대시보드 컴포넌트입니다.
 */
export const StatsDashboard = ({ profile, voca, statsState }) => {
  const navigate = useNavigate();

  // 1. 당일 완료 여부 판별
  const isDone = statsState?.isTodayDone || false;

  // 2. 현재 레벨의 Voca 목록 추출
  const currentLevel = profile?.level || 700;
  const currentLevelVoca = Array.isArray(voca) ? voca : (voca?.[currentLevel] || []);

  // 3. 실시간 동적 권장 학습 청크 스캔 (현재 레벨 청크 배열 전달)
  const recommendedChunk = statsState?.getRecommendedChunk ? statsState.getRecommendedChunk(currentLevelVoca) : null;

  // 4. 괄호를 떼어낸 추천 카테고리 한글 명칭 도출
  const displayCategory = recommendedChunk
    ? recommendedChunk.category_kr.replace(/\(\d+\)$/, '')
    : "추천 학습 없음";

  // 5. 청크 단위 마스터 진행률 산출 (현재 레벨 기준)
  const totalChunks = currentLevelVoca.length || 0;
  const learnedChunks = profile?.learned || 0;
  const progressPercent = totalChunks > 0 ? Math.round((learnedChunks / totalChunks) * 100) : 0;

  const levelLabels = {
    "700": "초급 (700)",
    "800": "중급 (800)",
    "900": "고급 (900)"
  };
  const currentLevelLabel = levelLabels[profile?.level] || "초급 (700)";

  // 암기하기 / 퀴즈풀기 액션 핸들러 (현재 선택 앵커 selected 기준 이동)
  const handlePlay = () => {
    if (profile.selected) {
      navigate(`/play/${profile.selected}`);
    }
  };

  const handleQuiz = () => {
    if (profile.selected) {
      navigate(`/quiz/${profile.selected}`);
    }
  };

  // 추천 학습 바로가기 핸들러
  const handleRecommendedPlay = () => {
    if (recommendedChunk) {
      navigate(`/play/${recommendedChunk.voca_label}`);
    }
  };

  return (
    <S.DashboardWrapper>
      <S.HeaderContainer>
        <S.Title>학습 대시보드</S.Title>
        <S.LevelBadge>{currentLevelLabel}</S.LevelBadge>
      </S.HeaderContainer>
      
      <S.ProgressContainer>
        <S.ProgressLabel>
          <span>전체 마스터 진행률</span>
          <span>{progressPercent}%</span>
        </S.ProgressLabel>
        <S.ProgressBarBackground>
          <S.ProgressBarFill $progress={progressPercent} />
        </S.ProgressBarBackground>
        <S.ProgressLabel style={{ fontSize: '0.8rem', color: '#aaaaaa' }}>
          <span>{learnedChunks} 청크 완료</span>
          <span>{totalChunks} 청크</span>
        </S.ProgressLabel>
      </S.ProgressContainer>

      <S.StreakBadge>
        {profile.continued || 0}일 연속 학습 중!
      </S.StreakBadge>

      {/* 5. 당일 완료 여부에 따른 추천 학습 배너 분기 */}
      <S.RecommendationBanner $isDone={isDone}>
        <S.BannerHeader>
          <S.BannerBadge $isDone={isDone}>
            {isDone ? "일일 미션 완료" : "오늘의 권장 학습"}
          </S.BannerBadge>
          <S.BannerTitle>
            {isDone ? "오늘의 학습을 마쳤습니다!" : displayCategory}
          </S.BannerTitle>
        </S.BannerHeader>
        <S.BannerDesc>
          {isDone
            ? "오늘의 학습 목표를 성공적으로 완수하셨습니다.\n내일도 즐겁게 새로운 학습을 이어가세요."
            : `오늘 학습할 차례는 ${displayCategory} 카테고리입니다.\n지금 바로 추천 학습을 시작하여 당일 미션을 달성하세요.`}
        </S.BannerDesc>
        {!isDone && recommendedChunk && (
          <S.BannerButton $isDone={isDone} onClick={handleRecommendedPlay}>
            추천 학습 시작하기
          </S.BannerButton>
        )}
      </S.RecommendationBanner>

      <S.ActionContainer>
        <S.ActionButton onClick={handlePlay} disabled={!profile.selected}>
          <PlayIcon />
          <span>암기하기</span>
        </S.ActionButton>
        <S.ActionButton onClick={handleQuiz} disabled={!profile.selected}>
          <QuizIcon />
          <span>퀴즈풀기</span>
        </S.ActionButton>
      </S.ActionContainer>
    </S.DashboardWrapper>
  );
};
