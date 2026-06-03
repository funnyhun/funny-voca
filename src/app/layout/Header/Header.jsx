import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as S from "./Header.styles";

import { NotificationList } from "@/app/layout";

export const Header = ({ notifications, progress = 100 }) => {
  const navigation = useNavigate();
  const [showNoti, setShowNoti] = useState(false);
  const navHome = () => navigation("/home");
  const toggleNoti = () => setShowNoti((prev) => !prev);

  // 유튜브 스타일 프로그레스바 상태 관리
  const [visible, setVisible] = useState(false);
  const [internalProgress, setInternalProgress] = useState(100);

  useEffect(() => {
    if (progress < 100) {
      setVisible(true);
      setInternalProgress(progress);
    } else {
      setInternalProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <>
      <S.Wrapper>
        <S.Title onClick={navHome}>funny-voca</S.Title>
        <S.RightSection>
          <S.NotificationBtn $hasUnread={notifications?.length > 0} onClick={toggleNoti} />
        </S.RightSection>
        <S.ProgressBar $width={internalProgress} $visible={visible} />
      </S.Wrapper>
      {showNoti && (
        <NotificationList notifications={notifications} onClose={() => setShowNoti(false)} />
      )}
    </>
  );
};
