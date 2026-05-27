import { Suspense, useMemo, useEffect, useState } from "react";
import { Outlet, useLoaderData, useNavigation, useLocation } from "react-router-dom";
import { useTheme } from "styled-components";
import * as S from "./App.styles";

import { Header, Navigation, Overlay } from "@/app/layout";
import { LoadingBar, AppFallback } from "@/app/components";
import { useVoca, useProfile, useStats } from "@/app/hooks";
import { OverlayProvider } from "@/app/context/OverlayContext";
import { getMaster } from "@/api/word";

export const App = () => {
  const location = useLocation();
  const theme = useTheme();

  const { nick: initialNick, wordMap: initialWordMap, wordStatusMap: initialStatusMap, wordData: initialWordData, notifications, userData: initialUserData } = useLoaderData();
  const [wordData, setWordData] = useState(initialWordData);
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  // 데이터의 변경 여부를 식별할 수 있는 고유 키 조합
  const stateKey = `${initialNick}-${initialUserData?.level || "default"}`;

  // 동적 상태 인스턴스화
  const vocaState = useVoca(initialWordMap, initialStatusMap);
  const profileState = useProfile(initialNick);
  const statsState = useStats(initialUserData);

  const isWelcome = location.pathname.startsWith("/welcome");

  // 백그라운드 스트리밍 단어 로딩 엔진
  useEffect(() => {
    let isMounted = true;
    const BULK_SIZE = 120;

    const loadRemainingWords = async () => {
      let currentOffset = BULK_SIZE;

      while (isMounted) {
        try {
          const nextChunk = await getMaster(BULK_SIZE, currentOffset);
          const nextKeys = Object.keys(nextChunk);

          if (nextKeys.length === 0) break;
          if (!isMounted) break;

          setWordData(prev => ({
            ...prev,
            ...nextChunk
          }));

          currentOffset += BULK_SIZE;
        } catch (error) {
          console.error("[Background Loader] Error loading remaining words:", error);
          break;
        }
      }
    };

    loadRemainingWords();

    return () => {
      isMounted = false;
    };
  }, []);

  // 실제 body의 백그라운드 컬러 동적 변수 제어
  // welcome/일반 화면 전환 시의 기준 배경 색상만 세팅한다.
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
            <Outlet key={stateKey} context={{ vocaState, profileState, statsState, wordData, notifications }} />
          </Suspense>
        </S.Wrapper>

        {/* /welcome/* 경로일 때는 바텀 네비게이션을 가림 */}
        {!isWelcome && <Navigation />}
      </S.Layout>
    </OverlayProvider>
  );
};

