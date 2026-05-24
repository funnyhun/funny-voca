import { Suspense, useMemo, createContext } from "react";
import { Outlet, useLoaderData, useNavigation } from "react-router-dom";
import * as S from "./App.styles";

import { Header, Navigation, LoadingBar, Spinner, Loading, AppFallback } from "@/ui/common";
import { useVoca } from "@/ui/common/hooks/useVoca";
import { useProfile } from "@/ui/common/hooks/useProfile";
import { useStats } from "@/ui/common/hooks/useStats";

// 도메인별 Context 정의 및 export
export const VocaContext = createContext(null);
export const ProfileContext = createContext(null);
export const StatsContext = createContext(null);
export const AppContext = createContext(null);

export const App = () => {
  const now = useMemo(() => new Date(), []);
  const { nick: initialNick, wordMap: initialWordMap, wordStatusMap: initialStatusMap, wordData, notifications, userData: initialUserData } = useLoaderData();
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

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
    <S.Layout>
      {isNavigating && <LoadingBar />}
      <Header notifications={notifications} />
      <S.Wrapper>
        <Suspense fallback={<AppFallback />}>
          <AppContext.Provider value={appContextValue}>
            <VocaContext.Provider value={vocaState}>
              <ProfileContext.Provider value={profileState}>
                <StatsContext.Provider value={statsState}>
                  <Outlet />
                </StatsContext.Provider>
              </ProfileContext.Provider>
            </VocaContext.Provider>
          </AppContext.Provider>
        </Suspense>
      </S.Wrapper>
      <Navigation />
    </S.Layout>
  );
};
