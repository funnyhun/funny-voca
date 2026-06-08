import styled from "styled-components";

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  padding-top: 1rem;
`;

export const Content = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  overflow-y: auto;

  & > :last-child {
    margin-bottom: 1rem;
  }
`;

export const BannerContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  background-image: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.1) 0%,
    rgba(147, 51, 234, 0.1) 100%
  );
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
`;

export const BannerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

export const BannerTitle = styled.h3`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-font, #111827);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const ActiveBadge = styled.span`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
`;

export const BannerDesc = styled.p`
  font-size: 0.77rem;
  color: var(--color-font-sub, #6b7280);
`;

export const BannerButton = styled.button`
  background: ${props => props.$active ? '#fff' : `linear-gradient(135deg, ${props.theme.brand} 0%, #7c3aed 100%)`};
  color: ${props => props.$active ? props.theme.brand : '#fff'};
  border: ${props => props.$active ? `1px solid ${props.theme.brand}40` : 'none'};
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px ${props => props.theme.brand}14;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px ${props => props.theme.brand}26;
    filter: brightness(1.05);
  }

  &:active {
    transform: translateY(0);
  }
`;
