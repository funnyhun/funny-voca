import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  animation: fadeIn 0.2s ease;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

export const Panel = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;

  max-width: 430px;
  margin: 0 auto;

  background-color: ${({ theme }) => theme.main};
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 1.5rem 1.5rem calc(1.5rem + env(safe-area-inset-bottom));

  display: flex;
  flex-direction: column;
  gap: 1.2rem;

  animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;

export const Handle = styled.div`
  width: 2.5rem;
  height: 4px;
  background-color: ${({ theme }) => theme.week};
  border-radius: 2px;
  margin: 0 auto -0.5rem;
`;

export const Word = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.font};
  letter-spacing: 0.15rem;
`;

export const DefList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
`;

export const DefItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

export const ClassBadge = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.brand};
  font-weight: 600;
  background-color: ${({ theme }) => theme.week};
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  align-self: flex-start;
`;

export const Meaning = styled.p`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.font};
`;

export const Pronounce = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.label};
`;

export const ExampleBlock = styled.div`
  margin-top: 0.2rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 0.5rem;
  border-left: 3px solid ${({ theme }) => theme.brand};
`;

export const ExampleEn = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.font};
  font-style: italic;
`;

export const ExampleKo = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.label};
  margin-top: 0.25rem;
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.week};
`;
