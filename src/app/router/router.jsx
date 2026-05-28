import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import { loadUserData } from "@/app/router/user";
import { loadPlay } from "@/app/router/play";
import { loadQuiz } from "@/app/router/quiz";

import { App } from "@/app/App";

import { Welcome, Profile, WelcomeVoca, Home, Play, Card, Quiz, Voca, VocaList, WordList, Settings } from "@app/pages";
import { Splash } from "@/app/layout";

import { HomeIcon, PlayIcon, QuizIcon, WordIcon, AccountIcon } from "@/assets/iconList";

const wordContents = [
  { index: true, element: <VocaList /> },
  { path: ":vocaId", element: <WordList /> },
];

export const pages = [
  {
    path: "/welcome",
    element: <Welcome />,
    name: "Welcome",
    children: [
      { index: true, element: <Navigate to="/welcome/profile" replace /> },
      { path: "profile", element: <Profile />, name: "닉네임 설정" },
      { path: "voca", element: <WelcomeVoca />, name: "학습데이터 생성" },
    ],
  },
  { index: true, element: <Navigate to="/home" replace /> },
  { path: "/home", element: <Home />, name: "홈", icon: <HomeIcon /> },
  {
    path: "/play",
    element: <Play />,
    loader: loadPlay,
    name: "시작하기",
    icon: <PlayIcon />,
  },
  {
    path: "/quiz",
    element: <Quiz />,
    loader: loadQuiz,
    name: "퀴즈",
    icon: <QuizIcon />,
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

const routes = [
  {
    path: "/",
    element: <App />,
    hydrateFallbackElement: <Splash />,
    loader: loadUserData,
    name: "App",
    children: pages,
  },
  {
    path: "*",
    element: <Navigate to="/home" replace />,
  },
];

const rawBasePath = import.meta.env.VITE_BASE_PATH || "/";
const basename = rawBasePath.endsWith("/") && rawBasePath !== "/" ? rawBasePath.slice(0, -1) : rawBasePath;

export const AppRouter = () => {
  const router = createBrowserRouter(routes, { basename });
  return <RouterProvider router={router} />;
};
