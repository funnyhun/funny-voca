import { Navigate } from "react-router-dom";
import { Welcome } from "./Welcome";
import { Profile } from "./profile/Profile";
import { Voca as WelcomeVoca } from "./voca/Voca";

const welcomeChildren = [
  { index: true, element: <Navigate to="/welcome/profile" replace /> },
  { path: "profile", element: <Profile />, name: "닉네임 설정" },
  { path: "voca", element: <WelcomeVoca />, name: "학습데이터 생성" },
];

export { Welcome, welcomeChildren };
