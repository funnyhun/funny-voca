import * as S from "./Search.styles";

import { Input } from "@/ui/components";
import { SearchIcon } from "@/assets/iconList";

export const Search = ({ keyword, setKeyword }) => {
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
