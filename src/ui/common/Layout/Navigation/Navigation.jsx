import { useLocation, useNavigate } from "react-router-dom";
import * as S from "./Navigation.styles";
import { pages } from "@/ui/app/router/router";

export const Navigation = () => {
  const navigate = useNavigate();
  const located = useLocation().pathname.split("/")[1];
  const items = pages.slice(1);

  const isLocated = (path) => path.split("/")[1] === located;

  const navigatePath = (path) => {
    if (isLocated(path)) return;
    navigate(path);
  };

  return (
    <S.Wrapper>
      {items.map((item) => {
        return (
          <S.Item key={item.path} onClick={() => navigatePath(item.path)} $located={isLocated(item.path)}>
            {item.icon}
            <p>{item.name}</p>
          </S.Item>
        );
      })}
    </S.Wrapper>
  );
};
