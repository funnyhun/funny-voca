import styled from "styled-components";
import { HiIcon } from "@/assets/iconList";

export const Wrapper = styled.div`
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 1rem;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const Image = styled.div`
  width: 10rem;
  height: 10rem;

  background-color: ${({ theme }) => theme.week};
  border-radius: 5rem;
`;

export const Greet = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  & > p {
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: 0.1rem;
  }
`;

export const CustomHiIcon = styled(HiIcon)`
  width: 2rem;
  height: 2rem;

  color: ${({ theme }) => theme.brand};
`;

export const Content = styled.p`
  color: ${({ theme }) => theme.label};
  text-align: center;
  line-height: 1.7;
`;
