"use client";

import React, { useState } from "react";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { AppShell, CompanyBadge } from "@/components/AppShell";
import { useApp } from "@/lib/appContext";

export default function ChatPage() {
  const { chats, sendMessage } = useApp();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const activeRoom = chats.find((c) => c.id === selectedRoomId) ?? null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoom || !draft.trim()) return;
    sendMessage(activeRoom.id, draft);
    setDraft("");
  };

  if (activeRoom) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-slate-50 shadow-2xl border-x border-slate-200">
        {/* Chat Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <button
            onClick={() => setSelectedRoomId(null)}
            className="rounded-full p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-xl">
            {activeRoom.partnerEmoji}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900">
                {activeRoom.partnerName}
              </span>
              <CompanyBadge
                companyName={activeRoom.partnerCompany}
                status={activeRoom.partnerStatus}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              {activeRoom.sourceLabel}
            </p>
          </div>
        </header>

        {/* Safety Notice */}
        <div className="bg-emerald-50/70 px-4 py-2 text-[11px] text-emerald-800 flex items-center gap-1.5 border-b border-emerald-100">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          외부 금전 요구·영업·비매너 행위는 상단 신고 버튼으로 즉시 제보해
          주세요.
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {activeRoom.messages.map((m) => {
            if (m.sender === "system") {
              return (
                <div
                  key={m.id}
                  className="mx-auto max-w-xs rounded-xl bg-slate-200/70 px-3 py-1.5 text-center text-[11px] text-slate-600"
                >
                  {m.text}
                </div>
              );
            }
            const isMe = m.sender === "me";
            return (
              <div
                key={m.id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug ${
                    isMe
                      ? "bg-rose-500 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-200 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="mt-1 text-[10px] text-slate-400">
                  {m.time}
                </span>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="sticky bottom-0 flex items-center gap-2 border-t border-slate-200 bg-white p-3"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:bg-white"
          />
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm hover:bg-rose-600"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <AppShell title="채팅">
      <div className="divide-y divide-slate-200/80 bg-white">
        {chats.map((room) => (
          <button
            key={room.id}
            onClick={() => setSelectedRoomId(room.id)}
            className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-2xl">
              {room.partnerEmoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-sm font-bold text-slate-900">
                    {room.partnerName}
                  </span>
                  <CompanyBadge
                    companyName={room.partnerCompany}
                    status={room.partnerStatus}
                  />
                </div>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {room.lastTime}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] font-medium text-rose-500">
                {room.sourceLabel}
              </p>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <p className="truncate text-xs text-slate-600">
                  {room.lastMessage}
                </p>
                {room.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                    {room.unread}
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </AppShell>
  );
}
