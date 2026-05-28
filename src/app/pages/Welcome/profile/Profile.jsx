import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./Profile.styles";

import { VerticalButton, Input } from "@app/components";

import { setStorage, KEYS } from "@/utils/storage";

export const Profile = () => {
  const navigate = useNavigate();
  const [nick, setNick] = useState("");

  const submitNick = () => {
    if (nick.length < 2) return;

    // Guest 유저: Guest Storage에 닉네임 저장
    setStorage(KEYS.PROFILE, {
      nick: nick,
      level: "default",
      startedTime: new Date().getTime(),
      continued: 0,
      today: 0,
      learned: 0,
      selected: 0
    });
    navigate("/welcome/voca");
  };

  const changeNick = (e) => setNick(e.target.value);

  return (
    <S.Wrapper>
      <S.Header>
        <S.Image />
        <S.Greet>
          <p>반가워요!</p>
          <S.CustomHiIcon />
        </S.Greet>
        <S.Content>
          나만의 단어장 funny-voca를 시작하기전,
          <br />
          멋진 닉네임을 정해주세요.
        </S.Content>
      </S.Header>
      <Input
        label="닉네임"
        value={nick}
        onChange={changeNick}
        placeholder="닉네임 입력(2~10글자)"
        notice="한글, 영문, 숫자 포함 2~10 자로 입력해주세요."
      />
      <VerticalButton label="다음으로" color="main" bg="brand" onClick={submitNick} />
    </S.Wrapper>
  );
};
