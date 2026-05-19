import styled from "styled-components";
import { BrandIcon } from "@/assets/iconList";

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background-color: ${({ theme }) => theme.background};
`;

export const ColorBrandIcon = styled(BrandIcon)`
  width: 5rem;
  height: 5rem;

  color: ${({ theme }) => theme.brand};
`;

export const Title = styled.h1`
  font-weight: 500;
  color: ${({ theme }) => theme.brand};

  letter-spacing: 0.3rem;
`;
