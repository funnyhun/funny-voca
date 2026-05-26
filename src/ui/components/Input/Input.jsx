import { useId } from "react";
import { Wrapper, Label, CustomInput, Notice, IconWrapper } from "./Input.styles";

export const Input = ({
  icon: Icon,
  label,
  value,
  onChange,
  notice,
  placeholder,
  className,
  $isBorder = true,
  $isOutline = true,
}) => {
  const id = useId();

  return (
    <Wrapper className={className}>
      {Icon && (
        <IconWrapper>
          <Icon />
        </IconWrapper>
      )}
      {label && <Label htmlFor={id}>{label}</Label>}
      <CustomInput
        autoComplete="off"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        $hasIcon={!!Icon}
        $isBorder={$isBorder}
        $isOutline={$isOutline}
      />
      {notice && <Notice>{notice}</Notice>}
    </Wrapper>
  );
};
