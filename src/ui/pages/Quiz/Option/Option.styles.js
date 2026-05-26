import styled from "styled-components";
import { Button } from "@/ui/components";

export const OptionButton = styled(Button)`
  justify-content: flex-start;

  & svg {
    visibility: ${({ $isClicked }) => ($isClicked ? "visible" : "hidden")};
    margin-left: auto;
  }
`;
