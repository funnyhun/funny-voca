import styled from "styled-components";
import { BorderBox } from "@app/components";

export const DashboardWrapper = styled(BorderBox)`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background: ${({ theme }) => theme.main};
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Title = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.font};
`;

export const LevelBadge = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  background-color: ${({ theme }) => theme.week};
  color: ${({ theme }) => theme.brand};
  border-radius: 1rem;
`;

export const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.label};
  font-weight: 600;
`;

export const ProgressBarBackground = styled.div`
  width: 100%;
  height: 12px;
  background-color: ${({ theme }) => theme.background};
  border-radius: 10px;
  overflow: hidden;
`;

export const ProgressBarFill = styled.div`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background: linear-gradient(90deg, ${({ theme }) => theme.brand}, ${({ theme }) => theme.week_success});
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const StreakBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background-color: ${({ theme }) => theme.week};
  color: ${({ theme }) => theme.brand};
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.95rem;
  align-self: flex-start;
`;

export const ActionContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  width: 100%;
`;

export const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  border: none;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.font};
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  & > svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: ${({ theme }) => theme.brand};
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`;

export const RecommendationBanner = styled.div`
  background: ${({ $isDone }) => $isDone
    ? "linear-gradient(135deg, hsla(142, 72%, 29%, 0.08) 0%, hsla(142, 72%, 29%, 0.02) 100%)"
    : "linear-gradient(135deg, hsla(243, 75%, 59%, 0.08) 0%, hsla(243, 75%, 59%, 0.02) 100%)"};
  border: 1px dashed ${({ $isDone }) => $isDone ? "hsla(142, 72%, 29%, 0.3)" : "hsla(243, 75%, 59%, 0.3)"};
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: flex-start;
  transition: all 0.3s ease;

  &:hover {
    border-style: solid;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
  }
`;

export const BannerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const BannerBadge = styled.span`
  background: ${({ $isDone }) => $isDone ? "hsl(142, 72%, 29%)" : "hsl(243, 75%, 59%)"};
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  letter-spacing: 0.03em;
`;

export const BannerTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.font};
  margin: 0;
`;

export const BannerDesc = styled.p`
  font-size: 0.85rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.label};
  margin: 0;
  white-space: pre-line;
`;

export const BannerButton = styled.button`
  background: ${({ $isDone }) => $isDone ? "hsl(142, 72%, 29%)" : "hsl(243, 75%, 59%)"};
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
