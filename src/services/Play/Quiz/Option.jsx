import { useState } from "react";
import * as S from "./Option.styles";
import { CheckIcon, CloseIcon } from "@/common/assets/iconList";

export const Option = ({ label, corrected, onClick, disabled }) => {
  const [isClicked, setIsClicked] = useState(false);

  const clickedOption = () => {
    if (disabled) return;
    setIsClicked(true);
    if (corrected) onClick();
  };

  const buttonProperty = {
    label: (
      <>
        {label}
        {corrected ? <CheckIcon /> : <CloseIcon />}
      </>
    ),
    color: isClicked ? "main" : "font",
    bg: isClicked ? (corrected ? "success" : "danger") : "main",
  };

  return (
    <S.OptionButton
      label={buttonProperty.label}
      bg={buttonProperty.bg}
      color={buttonProperty.color}
      onClick={clickedOption}
      $isClicked={isClicked}
      disabled={disabled}
    />
  );
};
