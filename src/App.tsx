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
  const color = active ? "var(--color-cream)" : "var(--color-brown)";
  const bg = active ? "var(--color-caramel)" : "var(--color-cream)";
  const shadow = active ? "none" : "2px 2px 0 var(--color-brown)";
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
         className="w-10 h-10 border-[2px] border-[var(--color-brown)] flex items-center justify-center rounded-[8px] transition-all">
      {type === "today" && <NoteIcon />}
      {type === "items" && <BoxIcon />}
      {type === "map" && <MapIcon />}
      {type === "pokedex" && <BookIcon />}
    </div>
  );
};

const PixelHeader = () => (
  <header className="pixel-header">
    <div className="logo-chip">♪</div>
    <div className="page-title-group">
      <h1>Melody Pet Map</h1>
      <p>音樂寵物地圖</p>
    </div>
    <div className="logo-chip">✦</div>
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
       {/* Pixel Header */}
       <PixelHeader />
       
       {/* Main Content Area */}
       <div className="flex-1 overflow-y-auto pb-24">
         {activeTab === "today" && <TodayView navigateTo={setActiveTab} />}
         {activeTab === "items" && <CollectionView navigateTo={setActiveTab} />}
         {activeTab === "map" && <MapView />}
       </div>

       {/* Bottom Navigation */}
       <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-[var(--color-sand)] border-t-[3px] border-[var(--color-brown)] rounded-t-xl z-50 flex items-center py-3">
          <button onClick={() => setActiveTab("today")} className="flex-1 flex flex-col items-center">
             <BottomNavIcon type="today" active={activeTab === "today"} />
             <span className="type-caption mt-1 text-[var(--color-brown)]">今日</span>
          </button>
          <button onClick={() => setActiveTab("items")} className="flex-1 flex flex-col items-center">
             <BottomNavIcon type="items" active={activeTab === "items"} />
             <span className="type-caption mt-1 text-[var(--color-brown)]">物品</span>
          </button>
          <button onClick={() => setActiveTab("map")} className="flex-1 flex flex-col items-center">
             <BottomNavIcon type="map" active={activeTab === "map"} />
             <span className="type-caption mt-1 text-[var(--color-brown)]">世界地圖</span>
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
