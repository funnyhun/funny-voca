import { Overlay, Container, Header, List, NotiItem, NotiTitle, NotiContent, EmptyMessage } from "./NotificationList.styles";
import { signInWithKakao } from "@/common/api/auth/actions";

export const NotificationList = ({ notifications = [], onClose }) => {
  const handleNotiClick = (noti) => {
    if (noti.type === "sync") {
      signInWithKakao();
    }
    onClose();
  };

  return (
    <>
      <Overlay onClick={onClose} />
      <Container>
        <Header>알림</Header>
        <List>
          {notifications.length > 0 ? (
            notifications.map((noti) => (
              <NotiItem key={noti.id} onClick={() => handleNotiClick(noti)}>
                <NotiTitle>{noti.title}</NotiTitle>
                <NotiContent>{noti.content}</NotiContent>
              </NotiItem>
            ))
          ) : (
            <EmptyMessage>새로운 알림이 없습니다.</EmptyMessage>
          )}
        </List>
      </Container>
    </>
  );
};
