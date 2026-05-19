import styled from "styled-components";
import { BorderBox } from "@/common/components";
import { SpeakIcon } from "@/common/assets/iconList";

export const AudioButton = styled(SpeakIcon)`
  width: 2.5rem;
  height: 2.5rem;
  align-self: flex-end;
  cursor: pointer;

  margin-bottom: 0.5rem;
`;

export const CustomBorderBox = styled(BorderBox)`
  flex-direction: column;
  justify-content: center;
  gap: 1rem;

  padding: 1rem;
`;

export const Title = styled.h3`
  text-align: center;
  font-size: ${({ $length }) => `clamp(1rem, ${3.5 - $length / 8}rem, 3.5rem)`};
  font-weight: 600;
  letter-spacing: 0.2rem;
`;
