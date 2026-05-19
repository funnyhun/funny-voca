import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import { NotificationList } from "@/ui/common";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;

  max-width: ${({ theme }) => theme.max_width};
  min-width: ${({ theme }) => theme.min_width};
  width: 100%;
  height: calc(2.8rem + env(safe-area-inset-top));

  padding-top: calc(env(safe-area-inset-top) - 0.5rem);
  padding-left: 1rem;
  padding-right: 1rem;

  display: flex;
  justify-content: space-between;
  align-items: center;

  background-color: ${({ theme }) => theme.main};
  margin: 0 auto;
`;

const Title = styled.h1`
  line-height: 1;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1rem;

  cursor: pointer;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const NotificationBtn = styled.div`
  width: 1.2rem;
  height: 1.2rem;
  background-color: ${({ theme, $hasUnread }) => ($hasUnread ? theme.brand : theme.sub)};
  border-radius: 50%;
  cursor: pointer;
  position: relative;
`;

export const Header = ({ notifications }) => {
  const navigation = useNavigate();
  const [showNoti, setShowNoti] = useState(false);
  const navHome = () => navigation("/home");
  const toggleNoti = () => setShowNoti((prev) => !prev);

  return (
    <>
      <Wrapper>
        <Title onClick={navHome}>MyVoca</Title>
        <RightSection>
          <NotificationBtn $hasUnread={notifications?.length > 0} onClick={toggleNoti} />
        </RightSection>
      </Wrapper>
      {showNoti && (
        <NotificationList notifications={notifications} onClose={() => setShowNoti(false)} />
      )}
    </>
  );
};

