import { useMemo } from "react";
import * as S from "./QuizSelection.styles";
import { Option } from "./Option";

export const QuizSelection = ({ onClick, onWrong, wrongs, answer, disabled }) => {
  const options = useMemo(() => {
    return [...wrongs, answer].sort(() => 0.5 - Math.random());
  }, [wrongs, answer]);

  return (
    <S.Wrapper>
      {options.map((label, idx) => (
        <Option
          key={`${label}-${idx}`}
          label={label}
          corrected={label === answer}
          onClick={onClick}
          onWrong={onWrong}
          disabled={disabled}
        />
      ))}
    </S.Wrapper>
  );
};
