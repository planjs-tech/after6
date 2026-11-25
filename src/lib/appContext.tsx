"use client";

import React, { createContext, useContext, useState } from "react";
import {
  ChatRoom,
  CompanyStatus,
  GroupEvent,
  MOCK_CHATS,
  MOCK_EVENTS,
} from "./mockData";

interface UserProfileState {
  isLoggedIn: boolean;
  loginProvider: "KAKAO" | "NAVER" | "LOCAL";
  isPhoneVerified: boolean;
  isGpsVerified: boolean;
  nickname: string;
  companyName: string;
  companyStatus: CompanyStatus;
  daysUntilExpire: number;
  mannerTemp: number;
  blockSameCompany: boolean;
  blockedPhoneCount: number;
}

interface AppContextValue {
  user: UserProfileState;
  setUser: React.Dispatch<React.SetStateAction<UserProfileState>>;
  events: GroupEvent[];
  setEvents: React.Dispatch<React.SetStateAction<GroupEvent[]>>;
  joinedEventIds: string[];
  joinEvent: (eventId: string) => void;
  likedProfileIds: string[];
  likeProfile: (profileId: string) => void;
  chats: ChatRoom[];
  sendMessage: (roomId: string, text: string) => void;
  reports: { id: string; eventTitle: string; reason: string; createdAt: string }[];
  submitReport: (eventTitle: string, reason: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfileState>({
    isLoggedIn: true,
    loginProvider: "KAKAO",
    isPhoneVerified: true,
    isGpsVerified: true,
    nickname: "테드",
    companyName: "판교테크랩스",
    companyStatus: "VERIFIED",
    daysUntilExpire: 142,
    mannerTemp: 37.8,
    blockSameCompany: true,
    blockedPhoneCount: 48,
  });

  const [events, setEvents] = useState<GroupEvent[]>(MOCK_EVENTS);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>(["e3"]);
  const [likedProfileIds, setLikedProfileIds] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatRoom[]>(MOCK_CHATS);
  const [reports, setReports] = useState<
    { id: string; eventTitle: string; reason: string; createdAt: string }[]
  >([]);

  const joinEvent = (eventId: string) => {
    setJoinedEventIds((prev) =>
      prev.includes(eventId) ? prev : [...prev, eventId]
    );
  };

  const likeProfile = (profileId: string) => {
    setLikedProfileIds((prev) =>
      prev.includes(profileId) ? prev : [...prev, profileId]
    );
  };

  const sendMessage = (roomId: string, text: string) => {
    if (!text.trim()) return;
    setChats((prev) =>
      prev.map((room) =>
        room.id === roomId
          ? {
              ...room,
              lastMessage: text,
              lastTime: "방금 전",
              unread: 0,
              messages: [
                ...room.messages,
                {
                  id: `m-${Date.now()}`,
                  sender: "me",
                  text,
                  time: "방금 전",
                },
              ],
            }
          : room
      )
    );
  };

  const submitReport = (eventTitle: string, reason: string) => {
    setReports((prev) => [
      {
        id: `rep-${Date.now()}`,
        eventTitle,
        reason,
        createdAt: "방금 전",
      },
      ...prev,
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        events,
        setEvents,
        joinedEventIds,
        joinEvent,
        likedProfileIds,
        likeProfile,
        chats,
        sendMessage,
        reports,
        submitReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
