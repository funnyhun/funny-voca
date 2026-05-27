import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./Header.styles";

import { NotificationList } from "@/app/layout";

export const Header = ({ notifications }) => {
  const navigation = useNavigate();
  const [showNoti, setShowNoti] = useState(false);
  const navHome = () => navigation("/home");
  const toggleNoti = () => setShowNoti((prev) => !prev);

  return (
    <>
      <S.Wrapper>
        <S.Title onClick={navHome}>funny-voca</S.Title>
        <S.RightSection>
          <S.NotificationBtn $hasUnread={notifications?.length > 0} onClick={toggleNoti} />
        </S.RightSection>
      </S.Wrapper>
      {showNoti && (
        <NotificationList notifications={notifications} onClose={() => setShowNoti(false)} />
      )}
    </>
  );
};
