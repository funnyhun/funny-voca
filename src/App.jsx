import { Suspense, useMemo, createContext } from "react";
import { Outlet, useLoaderData } from "react-router-dom";
import styled from "styled-components";

import { Header, Navigation } from "./layout";
import { useVoca } from "./hooks/useVoca";
import { useProfile } from "./hooks/useProfile";
import { useStats } from "./hooks/useStats";

const Layout = styled.div`
  min-width: ${({ theme }) => theme.min_width};
  max-width: ${({ theme }) => theme.max_width};
  margin: 0 auto;
`;

const Wrapper = styled.div`
  // Navigation + ios-bottom-area
  height: calc(100vh - 3.5rem - env(safe-area-inset-bottom));

  background-color: ${({ theme }) => theme.background};

  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  padding-top: calc(2.8rem + env(safe-area-inset-top));
  margin: 0 auto;

  overflow-y: auto;
`;

// 도메인별 Context 정의 및 export
export const VocaContext = createContext(null);
export const ProfileContext = createContext(null);
export const StatsContext = createContext(null);
export const AppContext = createContext(null);

export const App = () => {
  const now = useMemo(() => new Date(), []);
  const { nick: initialNick, wordMap: initialWordMap, wordStatusMap: initialStatusMap, wordData, notifications, userData: initialUserData } = useLoaderData();

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
    <Layout>
      <Header notifications={notifications} />
      <Wrapper>
        <Suspense fallback={<div>Loading...</div>}>
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
      </Wrapper>
      <Navigation />
    </Layout>
  );
};
