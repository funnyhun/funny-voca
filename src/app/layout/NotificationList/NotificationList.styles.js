import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 1000;
`;

export const Container = styled.div`
  position: fixed;
  top: 3.5rem;
  right: 1rem;
  width: calc(100vw - 2rem);
  max-width: 320px;
  background-color: ${({ theme }) => theme.bg_main};
  border-radius: 1rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid ${({ theme }) => theme.brand_lite};
  z-index: 1001;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const Header = styled.div`
  padding: 1rem;
  font-weight: 700;
  border-bottom: 1px solid ${({ theme }) => theme.brand_lite};
  color: ${({ theme }) => theme.text_main};
`;

export const List = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

export const NotiItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.brand_lite};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.bg_app};
  }

  &:last-child {
    border-bottom: none;
  }
`;

export const NotiTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: ${({ theme }) => theme.text_main};
`;

export const NotiContent = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.text_sub};
  line-height: 1.4;
`;

export const EmptyMessage = styled.div`
  padding: 2rem 1rem;
  text-align: center;
  color: ${({ theme }) => theme.text_sub};
  font-size: 0.9rem;
`;

export const LogoutArea = styled.div`
  padding: 1rem;
  border-top: 1px solid ${({ theme }) => theme.brand_lite};
  display: flex;
  justify-content: center;
`;

export const LogoutBtn = styled.button`
  width: 100%;
  padding: 0.7rem;
  background-color: ${({ theme }) => theme.brand_lite};
  color: ${({ theme }) => theme.text_sub};
  border: none;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;
