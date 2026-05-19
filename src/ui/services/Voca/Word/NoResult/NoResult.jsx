import * as S from "./NoResult.styles";

export const NoResult = () => (
  <S.Wrapper>
    <S.Emoji>🔍</S.Emoji>
    <S.Message>{"검색 결과가 없습니다.\n다른 검색어나 필터를 시도해보세요."}</S.Message>
  </S.Wrapper>
);
