import { useMemo } from "react";
import * as S from "./QuizSelection.styles";
import { Option } from "./Option";

export const QuizSelection = ({ onClick, wrongs, answer, disabled }) => {
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
          onClick={label === answer ? onClick : undefined}
          disabled={disabled}
        />
      ))}
    </S.Wrapper>
  );
};
