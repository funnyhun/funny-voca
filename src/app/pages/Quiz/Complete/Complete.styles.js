import styled, { css } from "styled-components";

export const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;

  padding-bottom: 1rem;
`;

export const Image = styled.div`
  width: 13rem;
  height: 15rem;

  background: linear-gradient(135deg, ${({ theme }) => theme.brand || "#4f46e5"} 0%, #818cf8 100%);
  border-radius: 1.5rem;

  margin: 0rem 10rem;
  box-shadow: 0 10px 30px rgba(31, 38, 135, 0.25);
`;

export const Title = styled.h2`
  font-weight: 700;
  color: ${({ theme }) => theme.font || "#ffffff"};
  margin: 0;
`;

export const Content = styled.div`
  color: ${({ theme }) => theme.label || "#aaaaaa"};
  text-align: center;
  line-height: 2;
  white-space: pre-wrap;
`;

// 프리미엄 글래스모피즘 성취 카드 컨테이너
export const CardContainer = styled.div`
  width: 100%;
  padding: 1.75rem 1.5rem;
  border-radius: 1.5rem;
  text-align: center;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  box-sizing: border-box;

  ${({ $type }) =>
    $type === "perfect" &&
    css`
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%);
      border: 1px solid rgba(245, 158, 11, 0.25);
    `}

  ${({ $type }) =>
    $type === "additional" &&
    css`
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      border: 1px solid rgba(139, 92, 246, 0.25);
    `}

  ${({ $type }) =>
    $type === "normal" &&
    css`
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
    `}
`;

export const StreakTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
`;

export const StreakDesc = styled.p`
  font-size: 0.9rem;
  color: #bbbbbb;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
`;

export const StreakBadge = styled.div`
  font-size: 1.15rem;
  font-weight: 800;
  padding: 0.6rem 1.5rem;
  border-radius: 2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  margin: 0.5rem 0;

  ${({ $type }) =>
    $type === "perfect" &&
    css`
      background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
      color: #ffffff;
    `}

  ${({ $type }) =>
    $type === "additional" &&
    css`
      background: linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%);
      color: #ffffff;
    `}
`;

export const MistakeScore = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ $isWrong }) => ($isWrong ? "#f87171" : "#34d399")};
  margin-top: 0.25rem;
`;

export const WarningText = styled.div`
  font-size: 0.8rem;
  color: #999999;
  margin-top: 0.5rem;
  line-height: 1.4;
`;

export const Pannel = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  margin-top: auto;
`;
