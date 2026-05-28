import { Suspense, useMemo, useEffect, useState } from "react";
import { Outlet, useLoaderData, useNavigation, useLocation } from "react-router-dom";
import { useTheme } from "styled-components";
import * as S from "./App.styles";

import { Header, Navigation, Overlay } from "@/app/layout";
import { LoadingBar, AppFallback } from "@/app/components";
import { useVoca, useProfile, useStats, useMaster } from "@/app/hooks";
import { OverlayProvider } from "@/app/context/OverlayContext";

export const App = () => {
  const location = useLocation();
  const theme = useTheme();

  const { nick: initialNick, voca: initialVoca, wordStatusMap: initialStatusMap, master, notifications, profile: initialProfile, isCacheValid } = useLoaderData();

  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  // 데이터의 변경 여부를 식별할 수 있는 고유 키 조합
  const stateKey = `${initialNick}-${initialProfile?.level || 700}`;

  // 동적 상태 인스턴스화
  const vocaState = useVoca(initialVoca, initialStatusMap);
  const profileState = useProfile(initialNick);
  const statsState = useStats(initialProfile);

  // 백그라운드 스트리밍 로드, 동적 캐싱 및 상태 병합을 도맡는 커스텀 훅
  const masterData = useMaster(master, isCacheValid, vocaState.voca, statsState?.profile?.selected);

  const isWelcome = location.pathname.startsWith("/welcome");

  useEffect(() => {
    const targetColor = isWelcome ? theme.background : theme.main;
    document.documentElement.style.setProperty("--header-bottom-bg", targetColor);
  }, [isWelcome, theme]);

  return (
    <OverlayProvider>
      <S.Layout>
        {isNavigating && <LoadingBar />}

        <Overlay />

        {/* /welcome/* 경로일 때는 헤더를 가림 */}
        {!isWelcome && <Header notifications={notifications} />}

        <S.Wrapper>
          <Suspense fallback={<AppFallback />}>
            {/* Context Provider 중첩을 완전히 날려버리고 Outlet context로 동적 상태를 다이렉트 주입 */}
            <Outlet key={stateKey} context={{ vocaState, profileState, statsState, master: masterData, notifications }} />
          </Suspense>
        </S.Wrapper>

        {/* /welcome/* 경로일 때는 바텀 네비게이션을 가림 */}
        {!isWelcome && <Navigation />}
      </S.Layout>
    </OverlayProvider>
  );
};

