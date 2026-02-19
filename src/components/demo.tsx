"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { SessionSidebar } from "@/components/ui/session-sidebar";
import { SessionChat } from "@/components/ui/session-chat";
import { chatAPI, ChatSession } from "@/lib/api";
import { LandingMenu } from "@/components/LandingMenu";
import { IndexForm } from "@/components/IndexForm";
import SessionIndexInfo from "@/components/SessionIndexInfo";
import IndexPicker from "@/components/IndexPicker";
import { QuickChat } from "@/components/ui/quick-chat";
import chatBg from "../../bg.png";

export function Demo() {
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>();
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "error">("checking");
  const [sidebarRef, setSidebarRef] = useState<{ refreshSessions: () => Promise<void> } | null>(null);
  const [homeMode, setHomeMode] = useState<"HOME" | "INDEX" | "CHAT_EXISTING" | "QUICK_CHAT">("HOME");
  const [showIndexInfo, setShowIndexInfo] = useState(false);
  const [showIndexPicker, setShowIndexPicker] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      await chatAPI.checkHealth();
      setBackendStatus("connected");
    } catch (error) {
      console.error("Backend health check failed:", error);
      setBackendStatus("error");
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowConversation(true);
    setHomeMode("CHAT_EXISTING");
  };

  const handleNewSession = () => {
    setCurrentSessionId(undefined);
    setCurrentSession(null);
    setShowConversation(false);
    setHomeMode("HOME");
  };

  const handleSessionChange = async (session: ChatSession) => {
    setCurrentSession(session);
    if (session.id !== currentSessionId) {
      setCurrentSessionId(session.id);
    }
    if (sidebarRef) {
      await sidebarRef.refreshSessions();
    }
  };

  const handleSessionDelete = (deletedSessionId: string) => {
    if (currentSessionId === deletedSessionId) {
      setCurrentSessionId(undefined);
      setCurrentSession(null);
    }
  };

  return (
    <div
      className="flex h-full w-full flex-col bg-emerald-950"
      style={{
        backgroundImage: `url(${chatBg.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="h-16 px-4 relative flex items-center justify-center border-b border-emerald-300/45 bg-emerald-900/70 backdrop-blur-sm flex-shrink-0">
        {homeMode !== "HOME" && (
          <div className="flex items-center gap-4">
            <div className="bg-white/95 p-1.5 rounded-lg shadow-lg ring-1 ring-emerald-200">
              <Image src="/logo.png" alt="شعار إمارة حدود الشمال" width={36} height={36} className="rounded-md" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-50">إمارة حدود الشمال</h1>
          </div>
        )}
      </header>

      <div className="flex flex-1 flex-row min-h-0">
        {sidebarOpen && showConversation && (homeMode === "CHAT_EXISTING" || homeMode === "QUICK_CHAT") && (
          <SessionSidebar
            currentSessionId={currentSessionId}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
            onSessionDelete={handleSessionDelete}
            onSessionCreated={setSidebarRef}
          />
        )}

        <main className="flex flex-1 flex-col transition-all duration-200 bg-emerald-950/40 min-h-0 overflow-hidden">
          {homeMode === "HOME" ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="w-full max-w-5xl space-y-10 py-10">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white/95 p-3 rounded-2xl shadow-2xl ring-2 ring-emerald-200/80">
                      <Image src="/logo.png" alt="شعار إمارة حدود الشمال" width={124} height={124} className="rounded-xl" />
                    </div>
                  </div>
                  <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-emerald-50">إمارة حدود الشمال</h1>
                  <p className="text-xl md:text-2xl text-emerald-100">المساعد الافتراضي الذكي</p>
                </div>

                <div className="flex justify-center">
                  <LandingMenu
                    onSelect={(m) => {
                      if (m === "CHAT_EXISTING") {
                        setShowIndexPicker(true);
                        return;
                      }
                      if (m === "QUICK_CHAT") {
                        setHomeMode("QUICK_CHAT");
                        setShowConversation(true);
                        return;
                      }
                      setHomeMode("INDEX");
                    }}
                  />
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    {backendStatus === "checking" && (
                      <div className="flex items-center gap-2 text-emerald-100">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        جارٍ الاتصال بالخادم...
                      </div>
                    )}
                    {backendStatus === "connected" && (
                      <div className="flex items-center gap-2 text-emerald-200">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        تم الاتصال بالخادم • المحادثة جاهزة
                      </div>
                    )}
                    {backendStatus === "error" && (
                      <div className="flex items-center gap-2 text-red-200">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        الخادم غير متاح • شغّل الخادم لتفعيل المحادثة
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : homeMode === "CHAT_EXISTING" ? (
            <SessionChat sessionId={currentSessionId} onSessionChange={handleSessionChange} className="flex-1" />
          ) : homeMode === "QUICK_CHAT" ? (
            <QuickChat sessionId={currentSessionId} onSessionChange={handleSessionChange} className="flex-1" />
          ) : null}
        </main>

        {homeMode === "INDEX" && (
          <div className="fixed inset-0 flex items-center justify-center bg-emerald-950/60 backdrop-blur-sm z-50">
            <IndexForm
              onClose={() => setHomeMode("HOME")}
              onIndexed={(s) => {
                setHomeMode("CHAT_EXISTING");
                handleSessionSelect(s.id);
              }}
            />
          </div>
        )}

        {showIndexInfo && currentSessionId && (
          <SessionIndexInfo sessionId={currentSessionId} onClose={() => setShowIndexInfo(false)} />
        )}

        {showIndexPicker && (
          <IndexPicker
            onClose={() => setShowIndexPicker(false)}
            onSelect={async (idxId) => {
              const session = await chatAPI.createSession();
              await chatAPI.linkIndexToSession(session.id, idxId);
              setShowIndexPicker(false);
              setHomeMode("CHAT_EXISTING");
              handleSessionSelect(session.id);
            }}
          />
        )}
      </div>
    </div>
  );
}
