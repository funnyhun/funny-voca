import * as S from "./WordSearch.styles";

import { Input } from "@/common/components";

import { SearchIcon } from "@/common/assets/iconList";

export const WordSearch = ({ keyword, setKeyword }) => {
  const changeValue = (e) => setKeyword(e.target.value);

  return (
    <S.Wrapper>
      <Input
        icon={SearchIcon}
        label=""
        value={keyword}
        onChange={changeValue}
        notice={""}
        placeholder={"단어 또는 뜻 검색"}
        $isBorder={false}
        $isOutline={false}
      />
    </S.Wrapper>
  );
};
