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
  const color = "var(--color-black)";
  const bg = active ? "var(--color-green)" : "var(--color-card)";
  const shadow = active ? "2px 2px 0 var(--color-black)" : "4px 4px 0 rgba(17,17,17,0.18)";
  const transform = active ? "translateY(2px)" : "none";

  const NoteIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="5" y="11" width="5" height="4" />
      <rect x="8" y="4" width="2" height="7" />
      <rect x="8" y="3" width="7" height="2" />
      <rect x="14" y="4" width="2" height="3" />
    </svg>
  );

  const BoxIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2" stroke={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="6" y="5" width="8" height="3" fill="transparent" />
      <rect x="4" y="8" width="12" height="7" fill="transparent" />
      <rect x="9" y="8" width="2" height="3" fill={color} />
    </svg>
  );

  const MapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2" stroke={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="3" y="4" width="14" height="12" fill="transparent" />
      <line x1="8" y1="4" x2="8" y2="16" strokeDasharray="2 2" />
      <line x1="13" y1="4" x2="13" y2="16" strokeDasharray="2 2" />
      <rect x="5" y="8" width="2" height="2" fill={color} stroke="none" />
    </svg>
  );

  const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" strokeWidth="2" stroke={color} xmlns="http://www.w3.org/2000/svg" style={{ shapeRendering: "crispEdges" }}>
      <rect x="4" y="3" width="12" height="14" fill="transparent" />
      <rect x="5" y="3" width="2" height="14" fill={color} stroke="none" />
      <rect x="10" y="6" width="3" height="2" fill={color} stroke="none" />
    </svg>
  );

  return (
    <div style={{ backgroundColor: bg, boxShadow: shadow, transform: transform }}
         className="w-11 h-11 border-[3px] border-[var(--color-black)] flex items-center justify-center rounded-[14px] transition-all">
      {type === "today" && <NoteIcon />}
      {type === "items" && <BoxIcon />}
      {type === "map" && <MapIcon />}
      {type === "pokedex" && <BookIcon />}
    </div>
  );
};

const PixelHeader = () => (
  <header className="pixel-header">
    <div className="logo-chip">♫</div>
    <div className="page-title-group">
      <h1>PLAYLIST PET</h1>
      <p>連接你的音樂，孵化風格寵物</p>
    </div>
    <div className="logo-chip" style={{ background: "var(--color-yellow)" }}>✦</div>
  </header>
);

const AppContent: React.FC = () => {
  const { userProfile } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>(getInitialActiveTab);

  useEffect(() => {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

  if (!userProfile) {
    return <LoginView />;
  }

  return (
    <div className="page-wrapper w-full max-w-[430px] mx-auto min-h-[100dvh] relative flex flex-col shadow-2xl overflow-x-hidden">
       <PixelHeader />
       
       <div className="flex-1 overflow-y-auto pb-24">
         {activeTab === "today" && <TodayView navigateTo={setActiveTab} />}
         {activeTab === "items" && <CollectionView navigateTo={setActiveTab} />}
         {activeTab === "map" && <MapView />}
       </div>

       <nav className="pixel-nav-shell fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex items-center py-3 px-2">
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
