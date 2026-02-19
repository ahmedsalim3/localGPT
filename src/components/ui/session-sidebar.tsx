"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Plus, MessageSquare, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSession, chatAPI } from "@/lib/api";

interface SessionSidebarRef {
  refreshSessions: () => Promise<void>;
}

interface SessionSidebarProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  onSessionDelete?: (sessionId: string) => void;
  onSessionCreated?: (ref: SessionSidebarRef) => void;
  className?: string;
}

export function SessionSidebar({
  currentSessionId,
  onSessionSelect,
  onNewSession,
  onSessionDelete,
  onSessionCreated,
  className = "",
}: SessionSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = React.useCallback(async () => {
    try {
      setError(null);
      const response = await chatAPI.getSessions();
      setSessions(response.sessions);
    } catch (error) {
      console.error("Failed to load sessions:", error);
      setError("تعذّر تحميل المحادثات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSessions = React.useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  React.useEffect(() => {
    if (onSessionCreated) {
      onSessionCreated({ refreshSessions });
    }
  }, [onSessionCreated, refreshSessions]);

  const handleDeleteSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();

    if (!confirm("هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }

    try {
      await chatAPI.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (currentSessionId === sessionId && onSessionDelete) {
        onSessionDelete(sessionId);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
      setError("تعذّر حذف المحادثة");
    }
  };

  const handleRenameSession = async (sessionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const current = sessions.find((s) => s.id === sessionId);
    const newTitle = prompt("أدخل عنوانًا جديدًا", current?.title || "");
    if (!newTitle || newTitle.trim() === "" || newTitle === current?.title) {
      return;
    }
    try {
      const result = await chatAPI.renameSession(sessionId, newTitle.trim());
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? result.session : s)));
      onSessionSelect(sessionId);
      setMenuOpenId(null);
    } catch (error) {
      console.error("Failed to rename session:", error);
      setError("تعذّر إعادة تسمية المحادثة");
    }
  };

  const truncateTitle = (title: string, maxLength: number = 25) =>
    title.length > maxLength ? title.substring(0, maxLength) + "..." : title;

  return (
    <div className={`w-64 h-full min-h-0 bg-emerald-900/75 border-l border-emerald-300/45 backdrop-blur-sm flex flex-col ${className}`}>
      <div className="p-4 border-b border-emerald-300/45">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-emerald-50">المحادثات</h2>
          <Button
            onClick={onNewSession}
            size="sm"
            className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-500 text-white"
            title="محادثة جديدة"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-2">
          {error && (
            <div className="mb-4 p-3 bg-red-900/70 text-red-100 text-sm rounded-lg">
              {error}
              <Button onClick={loadSessions} size="sm" className="ml-2 h-6 px-2 text-xs bg-red-800 hover:bg-red-700">
                إعادة المحاولة
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-emerald-800/70 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-emerald-100/85">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-60" />
              <p className="text-sm">لا توجد محادثات بعد</p>
              <p className="text-xs mt-1">ابدأ محادثة جديدة للمتابعة</p>
            </div>
          ) : (
            <div className="space-y-px">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`relative group pl-1 rounded transition-colors ${
                    currentSessionId === session.id
                      ? "bg-emerald-600/75 text-white border-l-2 border-emerald-100"
                      : "hover:bg-emerald-800/70 text-emerald-100"
                  }`}
                >
                  <button onClick={() => onSessionSelect(session.id)} className="w-full pr-3 pl-8 py-2 text-right text-sm">
                    <p className="truncate">{truncateTitle(session.title)}</p>
                  </button>

                  <div className="absolute right-2 top-2 index-row-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === session.id ? null : session.id);
                      }}
                      className="p-1 text-emerald-100/80 hover:text-white opacity-0 group-hover:opacity-100 transition"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {menuOpenId === session.id && (
                      <div className="absolute right-0 top-full mt-1 bg-emerald-950/95 backdrop-blur border border-emerald-300/40 rounded shadow-lg py-1 w-32 text-sm z-50 text-emerald-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionSelect(session.id);
                            setMenuOpenId(null);
                          }}
                          className="block w-full text-right px-4 py-2 hover:bg-emerald-800/80"
                        >
                          فتح
                        </button>
                        <button onClick={(e) => handleRenameSession(session.id, e)} className="block w-full text-right px-4 py-2 hover:bg-emerald-800/80">
                          إعادة تسمية
                        </button>
                        <button
                          onClick={(e) => handleDeleteSession(session.id, e)}
                          className="block w-full text-right px-4 py-2 hover:bg-emerald-800/80 text-red-300 hover:text-red-200"
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {sessions.length > 0 && (
        <div className="p-4 border-t border-emerald-300/45 text-xs text-emerald-100 bg-emerald-900/85">
          <div className="flex justify-between">
            <span>{sessions.length} محادثة</span>
            <span>{sessions.reduce((sum, s) => sum + s.message_count, 0)} رسالة</span>
          </div>
        </div>
      )}
    </div>
  );
}
