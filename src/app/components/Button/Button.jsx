import styled from "styled-components";
import { Wrapper, Label } from "./Button.styles";

const Button = ({ label, color, bg, onClick, className }) => {
  return (
    <Wrapper className={className} onClick={onClick} $bg={bg}>
      <Label $color={color}>{label}</Label>
    </Wrapper>
  );
};

const SmallButton = styled(Button)`
  padding: 0.5rem;

  & > span {
    font-size: 0.8rem;
  }
`;

const VerticalButton = styled(Button)`
  flex: none;
`;

export { Button, SmallButton, VerticalButton };
