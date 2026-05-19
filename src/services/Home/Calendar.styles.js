import styled from "styled-components";

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const Title = styled.h2`
  display: none;
`;

export const Label = styled.p`
  font-weight: 600;

  & > span {
    color: ${({ theme }) => theme.brand};
  }
`;

export const TargetDate = styled.p`
  font-weight: 600;
  line-height: 1;
  padding-bottom: 0.2rem;
`;

export const Pannel = styled.div`
  display: flex;
  align-items: center;
`;

export const Week = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.1rem;
`;

export const DayContainer = styled.div`
  width: 2.5rem;
  height: 2.5rem;

  text-align: center;
  color: ${({ $isSunday, theme }) => ($isSunday ? theme.danger : theme.sub)};

  padding: 0.5rem;
`;

export const DayCircle = styled.div`
  width: 2.5rem;
  height: 2.5rem;

  visibility: ${({ $isEmpty }) => ($isEmpty ? "hidden" : "visible")};

  text-align: center;
  line-height: 1;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ $isToday, $isSunday, theme }) => ($isToday ? theme.main : $isSunday && theme.danger)};

  background-color: ${({ $isToday, $isLearned, theme }) =>
    $isToday ? theme.brand : $isLearned && theme.week};

  padding-top: 0.8rem;
  border-radius: 2.5rem;
`;
