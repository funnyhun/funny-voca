import * as S from "./Detail.styles";

export const Detail = ({ word, onClose }) => {
  const { word: label, definitions = [] } = word;

  return (
    <>
      <S.Overlay onClick={onClose} />
      <S.Panel>
        <S.Handle />
        <S.Word>{label}</S.Word>
        <S.DefList>
          {definitions.map((def, i) => (
            <S.DefItem key={i}>
              {i > 0 && <S.Divider />}
              {def.class && <S.ClassBadge>{def.class}</S.ClassBadge>}
              <S.Meaning>{def.value}</S.Meaning>
              {def.pronounce && <S.Pronounce>[{def.pronounce}]</S.Pronounce>}
              {(def.example_en || def.example_ko) && (
                <S.ExampleBlock>
                  {def.example_en && <S.ExampleEn>{def.example_en}</S.ExampleEn>}
                  {def.example_ko && <S.ExampleKo>{def.example_ko}</S.ExampleKo>}
                </S.ExampleBlock>
              )}
            </S.DefItem>
          ))}
        </S.DefList>
      </S.Panel>
    </>
  );
};
