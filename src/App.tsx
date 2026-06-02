/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useState } from "react";
import { AppProvider, useApp } from "./AppContext";
import { LoginView } from "./views/LoginView";
import { TodayView } from "./views/TodayView";
import { CollectionView } from "./views/CollectionView";
import { MapView } from "./views/MapView";
import { ErrorBoundary } from "./components/ErrorBoundary";

const ACTIVE_TAB_STORAGE_KEY = "melody_active_tab";
const VALID_TABS = ["today", "items", "map"] as const;
type ActiveTab = typeof VALID_TABS[number];

const getInitialActiveTab = (): ActiveTab => {
  try {
    const savedTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    const legacyTabMap: Record<string, ActiveTab> = {
      Today: "today",
      today: "today",
      Items: "items",
      items: "items",
      Map: "map",
      map: "map",
      pokedex: "today",
    };
    const safeTab = savedTab ? legacyTabMap[savedTab] || (savedTab as ActiveTab) : "today";
    return VALID_TABS.includes(safeTab) ? safeTab : "today";
  } catch (error) {
    console.error("Failed to load activeTab", error);
    return "today";
  }
};

const BottomNavIcon = ({ type, active }: { type: string, active: boolean }) => {
  const color = active ? "var(--color-text)" : "rgba(17,17,17,0.62)";

  const NoteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M13.5 3.5v8.2a2.8 2.8 0 1 1-1.4-2.44V6.3L7.9 7.4v5.3a2.8 2.8 0 1 1-1.4-2.44V5.7a1 1 0 0 1 .75-.97l5.2-1.3a1 1 0 0 1 1.05.07Z" />
    </svg>
  );

  const BoxIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M4.8 6.3 10 3.8l5.2 2.5v7.4L10 16.2l-5.2-2.5V6.3Z" />
      <path d="M4.8 6.3 10 8.8l5.2-2.5" />
      <path d="M10 8.8v7.4" />
    </svg>
  );

  const MapIcon = () => (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" strokeWidth="1.8" stroke={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M3.6 5.4 8 3.8l4 2 4.4-2v10.8L12 16.2l-4-2-4.4 1.6V5.4Z" />
      <path d="M8 3.8v10.4" />
      <path d="M12 5.8v10.4" />
    </svg>
  );

  return (
    <div className="modern-tab-icon">
      {type === "today" && <NoteIcon />}
      {type === "items" && <BoxIcon />}
      {type === "map" && <MapIcon />}
    </div>
  );
};

const PixelHeader = () => (
  <header className="pixel-header">
    <div className="logo-chip">♪</div>
    <div className="page-title-group">
      <h1>Playlist Pet</h1>
      <p>把你的聽歌紀錄孵化成音樂寵物</p>
    </div>
    <div className="logo-chip" style={{ background: "linear-gradient(180deg, #fff6fb 0%, #ffe4f2 100%)" }}>♡</div>
  </header>
);

const AppContent: React.FC = () => {
  const { userProfile } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialActiveTab);

  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  return (
    <div className="webapp-outer">
      <div className="webapp-shell">
        <main className="relative flex min-h-[100dvh] flex-col">
          <PixelHeader />

          <div className="webapp-content">
            {!userProfile ? (
              <LoginView />
            ) : (
              <>
                {activeTab === "today" && <TodayView navigateTo={setActiveTab} />}
                {activeTab === "items" && <CollectionView navigateTo={setActiveTab} />}
                {activeTab === "map" && <MapView />}
              </>
            )}
          </div>

          {userProfile && (
            <nav className="pixel-nav-shell fixed bottom-0 left-1/2 z-50 flex -translate-x-1/2 items-center px-2 py-2">
              <button onClick={() => setActiveTab("today")} className={`pixel-nav-tab flex-1 flex flex-col items-center ${activeTab === "today" ? "pixel-nav-tab-active" : ""}`}>
                <BottomNavIcon type="today" active={activeTab === "today"} />
                <span className="pixel-nav-tab-label mt-1">今日</span>
              </button>
              <button onClick={() => setActiveTab("items")} className={`pixel-nav-tab flex-1 flex flex-col items-center ${activeTab === "items" ? "pixel-nav-tab-active" : ""}`}>
                <BottomNavIcon type="items" active={activeTab === "items"} />
                <span className="pixel-nav-tab-label mt-1">物品</span>
              </button>
              <button onClick={() => setActiveTab("map")} className={`pixel-nav-tab flex-1 flex flex-col items-center ${activeTab === "map" ? "pixel-nav-tab-active" : ""}`}>
                <BottomNavIcon type="map" active={activeTab === "map"} />
                <span className="pixel-nav-tab-label mt-1">世界地圖</span>
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
