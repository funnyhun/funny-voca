import * as S from "./Item.styles";
import { ProgressBar } from "../ProgressBar";
import { useNavigate } from "react-router-dom";

/**
 * Voca Item Card
 * - 단어장 목록의 개별 항목 카드 컴포넌트입니다.
 * - DB 스키마 일치화를 위해 id 대신 voca_label을 그대로 식별자로 받아 라우팅합니다.
 */
export const Item = ({ item, isStudying }) => {
  const { voca_label, category_kr, word = [], done = [], status } = item;
  const navigate = useNavigate();

  const navItemDetail = () => {
    navigate(`/voca/${voca_label}`);
  };

  const wordCount = word.length;
  const doneCount = done.length;
  const progress = wordCount > 0 ? Math.floor((doneCount / wordCount) * 100) : 0;

  return (
    <S.Wrapper $isStudying={isStudying}>
      <S.Status $status={status}>{status ? <S.CompleteIcon /> : <S.IncompleteIcon />}</S.Status>
      <S.Content>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <S.Label>{category_kr}</S.Label>
          {isStudying && (
            <span style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "#ffffff",
              fontSize: "0.65rem",
              fontWeight: "600",
              padding: "0.15rem 0.4rem",
              borderRadius: "6px",
              whiteSpace: "nowrap"
            }}>학습 중</span>
          )}
        </div>
        <S.Length>{`단어 ${wordCount}개`}</S.Length>
      </S.Content>
      <ProgressBar status={progress} />
      <S.NextButton onClick={navItemDetail} />
    </S.Wrapper>
  );
};
