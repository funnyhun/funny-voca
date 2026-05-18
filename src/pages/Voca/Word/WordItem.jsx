import styled from "styled-components";
import { useState, useContext } from "react";

import { VocaContext } from "../../../App";
import { CheckCircleIcon, WordIcon, MoreVIcon } from "../../../assets/iconList";
import { WordDetail } from "./WordDetail";

const Wrapper = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  background-color: ${({ theme }) => theme.main};

  padding: 1rem;
  border-radius: 0.5rem;
`;

const CompleteIcon = styled(CheckCircleIcon)`
  color: ${({ theme }) => theme.main};
`;

const InCompleteIcon = styled(WordIcon)`
  color: ${({ theme }) => theme.brand};
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.week};
  padding: 0.75rem 0.7rem;
  border-radius: 3rem;

  & > svg {
    fill: ${({ $status, theme }) => ($status ? theme.success : theme.brand)};
  }
`;

const Label = styled.h3`
  font-size: 1rem;
  font-weight: 600;
`;

const Explain = styled.span`
  color: ${({ theme }) => theme.label};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.3rem;

  margin-left: 0.5rem;
`;

const MoreButton = styled(MoreVIcon)`
  margin-left: auto;
  cursor: pointer;
  flex-shrink: 0;
`;

export const WordItem = ({ word }) => {
  const { word: label, definitions, done, id } = word;
  const [showDetail, setShowDetail] = useState(false);
  const { updateStatus } = useContext(VocaContext);

  const handleToggle = () => {
    updateStatus(id, !done);
  };

  return (
    <>
      <Wrapper>
        <Status $status={done} onClick={handleToggle} style={{ cursor: "pointer" }}>
          {done ? <CompleteIcon /> : <InCompleteIcon />}
        </Status>
        <Content>
          <Label>{label}</Label>
          <Explain>{`${definitions[0].class}.${definitions[0].value}`}</Explain>
        </Content>
        <MoreButton onClick={() => setShowDetail(true)} />
      </Wrapper>
      {showDetail && <WordDetail word={word} onClose={() => setShowDetail(false)} />}
    </>
  );
};
