import styled, { keyframes } from "styled-components";

const scaleUp = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const ModalWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
  animation: ${fadeIn} 0.25s ease-out forwards;
`;

export const ModalCard = styled.div`
  background: ${({ theme }) => theme.bg_main || "#ffffff"};
  border: 1px solid ${({ theme }) => theme.border || "rgba(229, 231, 235, 0.5)"};
  border-radius: 20px;
  width: 100%;
  max-width: 380px;
  padding: 28px 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  gap: 20px;
  animation: ${scaleUp} 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
`;

export const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
`;

export const AlertBadge = styled.div`
  background: hsla(243, 75%, 59%, 0.1);
  color: hsl(243, 75%, 59%);
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

export const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.text_main || "#111827"};
  margin: 0;
`;

export const BodySection = styled.div`
  font-size: 0.95rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.text_sub || "#4b5563"};
  text-align: center;
`;

export const HighlightText = styled.span`
  color: hsl(243, 75%, 59%);
  font-weight: 700;
  background: hsla(243, 75%, 59%, 0.05);
  padding: 2px 6px;
  border-radius: 6px;
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;
