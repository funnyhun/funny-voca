import { Suspense, useMemo, createContext } from "react";
import { Outlet, useLoaderData, useNavigation } from "react-router-dom";
import * as S from "./App.styles";

import { Header, Navigation } from "@/ui/layout";
import { LoadingBar, AppFallback } from "@/ui/components";
import { useVoca, useProfile, useStats } from "@/ui/hooks";

// 도메인별 Context 정의 및 export
export const VocaContext = createContext(null);
export const ProfileContext = createContext(null);
export const StatsContext = createContext(null);
export const AppContext = createContext(null);

const AppContent = ({ initialNick, initialWordMap, initialStatusMap, initialUserData, wordData, notifications, now }) => {
  // 커스텀 훅 레이어에서 상태 인스턴스화
  const vocaState = useVoca(initialWordMap, initialStatusMap);
  const profileState = useProfile(initialNick);
  const statsState = useStats(initialUserData);

  const appContextValue = useMemo(() => ({
    wordData,
    notifications,
    now,
  }), [wordData, notifications, now]);

  return (
    <AppContext.Provider value={appContextValue}>
      <VocaContext.Provider value={vocaState}>
        <ProfileContext.Provider value={profileState}>
          <StatsContext.Provider value={statsState}>
            <Outlet />
          </StatsContext.Provider>
        </ProfileContext.Provider>
      </VocaContext.Provider>
    </AppContext.Provider>
  );
};

export const App = () => {
  const now = useMemo(() => new Date(), []);
  const { nick: initialNick, wordMap: initialWordMap, wordStatusMap: initialStatusMap, wordData, notifications, userData: initialUserData } = useLoaderData();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  // 데이터의 변경 여부를 식별할 수 있는 고유 키 조합
  const stateKey = `${initialNick}-${initialUserData?.level || "default"}`;

  return (
    <S.Layout>
      {isNavigating && <LoadingBar />}
      <Header notifications={notifications} />
      <S.Wrapper>
        <Suspense fallback={<AppFallback />}>
          <AppContent
            key={stateKey}
            initialNick={initialNick}
            initialWordMap={initialWordMap}
            initialStatusMap={initialStatusMap}
            initialUserData={initialUserData}
            wordData={wordData}
            notifications={notifications}
            now={now}
          />
        </Suspense>
      </S.Wrapper>
      <Navigation />
    </S.Layout>
  );
};

