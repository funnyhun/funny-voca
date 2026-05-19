import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { loadUserData } from "@/app/router/user";
import { loadPlay } from "@/app/router/play";

import { App } from "@/app/App";

import { Setup as Onboard } from "@/common/setup/Setup";
import { StepToNick } from "@/common/setup/StepToNick";
import { StepToData } from "@/common/setup/StepToData";

import { Home } from "@/services/Home/Home";
import { Play, Card, Quiz } from "@/services/Play";

import { Voca } from "@/services/Voca/Voca";
import { VocaList } from "@/services/Voca/VocaList";
import { WordList } from "@/services/Voca/Word/WordList";
import { Settings } from "@/services/Settings/Settings";

import { HomeIcon, PlayIcon, WordIcon, AccountIcon } from "@/common/assets/iconList";

const wordContents = [
  { index: true, element: <VocaList /> },
  { path: ":selected", element: <WordList /> },
];

const playContents = [
  { index: true, loader: loadPlay },
  {
    path: ":selected",
    children: [
      { index: true, element: <Navigate to="card/0" replace /> },
      { path: "card", element: <Navigate to="0" replace /> },
      { path: "quiz", element: <Navigate to="0" replace /> },
      { path: "card/:step", element: <Card />, name: "카드" },
      { path: "quiz/:step", element: <Quiz />, name: "퀴즈" },
    ],
  },
];

export const pages = [
  { index: true, element: <Navigate to="/home" replace /> },
  { path: "/home", element: <Home />, name: "홈", icon: <HomeIcon /> },
  {
    path: "/play",
    element: <Play />,
    name: "시작하기",
    icon: <PlayIcon />,
    children: playContents,
  },
  {
    path: "/voca",
    element: <Voca />,
    name: "단어장",
    icon: <WordIcon />,
    children: wordContents,
  },
  {
    path: "/settings",
    element: <Settings />,
    name: "설정",
    icon: <AccountIcon />,
  },
];

const onboardStep = [
  { index: true, element: <Navigate to="/onboard/nickname" replace /> },
  { path: "/onboard/nickname", element: <StepToNick />, name: "닉네임 설정" },
  {
    path: "/onboard/generate-data",
    element: <StepToData />,
    name: "학습데이터 생성",
  },
];

const routes = [
  {
    path: "/",
    element: <App />,
    hydrateFallbackElement: <></>,
    loader: loadUserData,
    name: "App",
    children: pages,
  },
  {
    path: "/onboard",
    element: <Onboard />,
    name: "Onboard",
    children: onboardStep,
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
];

const currentMode = import.meta.env.MODE;
const isProd = currentMode === "production";

const basename = isProd ? "/MyVoca" : "/";

export const AppRouter = () => {
  const router = createBrowserRouter(routes, { basename });
  return <RouterProvider router={router} />;
};
