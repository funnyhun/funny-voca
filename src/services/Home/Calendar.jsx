import { useState, useMemo } from "react";

import { BorderBox } from "@/common/components";
import { calculateCalendarData } from "@/common/utils/utils";
import { LeftIcon, RightIcon } from "@/common/assets/iconList";
import {
  Header,
  Title,
  Label,
  TargetDate,
  Pannel,
  Week,
  DayContainer,
  DayCircle,
} from "./Calendar.styles";

export const Calendar = ({ mode, userData, now, wordMap }) => {
  const DateObj = useMemo(() => new Date(now), [now]);

  const currentYear = DateObj.getFullYear();
  const currentMonth = DateObj.getMonth();
  const currentDay = DateObj.getDate();

  const [year, setYear] = useState(DateObj.getFullYear());
  const [month, setMonth] = useState(DateObj.getMonth());

  const data = useMemo(
    () => calculateCalendarData(year, month, userData.startedTime, wordMap),
    [year, month]
  );

  const prevMonth = () => {
    if (month === 0) {
      setYear((prev) => prev - 1);
      setMonth(11);
    } else setMonth((prev) => prev - 1);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear((prev) => prev + 1);
      setMonth(0);
    } else setMonth((prev) => prev + 1);
  };

  return (
    <BorderBox>
      <Header>
        <Title>학습기록</Title>
        <Label>
          연속 학습 <span>{`${userData.continued ?? 0}일 째`}</span>
        </Label>
        <Pannel>
          <LeftIcon onClick={prevMonth} />
          <TargetDate>{`${year}년 ${month + 1}월`}</TargetDate>
          <RightIcon onClick={nextMonth} />
        </Pannel>
      </Header>
      <Week>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <DayContainer key={day} $isSunday={day === "일"}>
            {day}
          </DayContainer>
        ))}
      </Week>
      {data.map((week, i) => {
        return (
          <Week key={i}>
            {week.map((day, j) => {
              const isValidYearMonth = year === currentYear && month === currentMonth;
              const isToday = day && day.value === currentDay;

              return (
                <DayCircle
                  key={`${i}${j}`}
                  $isSunday={j === 0}
                  $isToday={isValidYearMonth && isToday}
                  $isLearned={day && day.status === true}
                  $isEmpty={!day}
                >
                  {day ? day.value : day}
                </DayCircle>
              );
            })}
          </Week>
        );
      })}
    </BorderBox>
  );
};

