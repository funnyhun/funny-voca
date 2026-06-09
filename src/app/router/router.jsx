import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router-dom";

import { loadUserData } from "@/app/router/loader/AppLoader";
import { WelcomeLoader } from "@/app/router/loader/WelcomeLoader";

import { App } from "@/app/App";

import { Welcome, welcomeChildren, Home, Play, Quiz, Voca, vocaChildren, Settings } from "@app/pages";
import { Splash } from "@/app/layout";

import { HomeIcon, PlayIcon, QuizIcon, WordIcon, AccountIcon } from "@/assets/iconList";

export const pages = [
  {
    path: "/welcome",
    element: <Welcome />,
    name: "Welcome",
    children: welcomeChildren,
  },
  {
    element: <Outlet />,
    loader: WelcomeLoader,
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "/home", element: <Home />, name: "홈", icon: <HomeIcon /> },
      {
        path: "/play",
        element: <Play />,
        name: "시작하기",
        icon: <PlayIcon />,
      },
      {
        path: "/quiz",
        element: <Quiz />,
        name: "퀴즈",
        icon: <QuizIcon />,
      },
      {
        path: "/voca",
        element: <Voca />,
        name: "단어장",
        icon: <WordIcon />,
        children: vocaChildren,
      },
      {
        path: "/settings",
        element: <Settings />,
        name: "설정",
        icon: <AccountIcon />,
      },
    ],
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
