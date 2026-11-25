"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Heart,
  X,
  MapPin,
  Shield,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Ban,
} from "lucide-react";
import {
  AppShell,
  CompanyBadge,
  MannerTempBadge,
} from "@/components/AppShell";
import { MOCK_PROFILES } from "@/lib/mockData";
import { useApp } from "@/lib/appContext";

export default function MatchingHomePage() {
  const { user, likedProfileIds, likeProfile } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterCurrentOnly, setFilterCurrentOnly] = useState(false);
  const [matchPopupName, setMatchPopupName] = useState<string | null>(null);

  const filteredProfiles = MOCK_PROFILES.filter((p) =>
    filterCurrentOnly ? p.companyStatus === "VERIFIED" : true
  );

  const safeIndex =
    filteredProfiles.length > 0 ? currentIndex % filteredProfiles.length : 0;
  const profile = filteredProfiles[safeIndex];

  const handlePass = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleLike = () => {
    if (!profile) return;
    likeProfile(profile.id);
    setMatchPopupName(profile.nickname);
  };

  return (
    <AppShell
      title="판교밋 1:1"
      rightAction={
        <button
          onClick={() => {
            setFilterCurrentOnly((prev) => !prev);
            setCurrentIndex(0);
          }}
          className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
            filterCurrentOnly
              ? "border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          {filterCurrentOnly ? "✓ 현직만 보기" : "전체(전직 포함)"}
        </button>
      }
    >
      <div className="space-y-4 p-4">
        {/* 지인 차단 & 생활권 안내 바 */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs shadow-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              지인{" "}
              <strong className="text-slate-900">
                {user.blockedPhoneCount}명
              </strong>
              {user.blockSameCompany ? " · 동일 회사" : ""} 자동 차단 중
            </span>
          </div>
          <Link
            href="/profile"
            className="font-semibold text-rose-600 hover:underline"
          >
            설정
          </Link>
        </div>

        {/* 단체 소개팅 시너지 배너 */}
        <Link
          href="/events"
          className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-3.5 text-white shadow-sm"
        >
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              퇴근 후 10분 거리 오프라인 만남
            </div>
            <p className="text-sm font-bold">
              이번 주 판교 6:6 와인 로테이션 모임 보기
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300 shrink-0" />
        </Link>

        {/* 추천 프로필 카드 */}
        {profile ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
            {/* Avatar Hero */}
            <div
              className={`relative flex h-64 flex-col justify-between bg-gradient-to-br ${profile.avatarColor} p-5 text-white`}
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  판교 · {profile.distanceKm}km
                </span>
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                  {profile.companyType}
                </span>
              </div>

              <div className="flex items-center justify-center text-7xl drop-shadow-md">
                {profile.avatarEmoji}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-extrabold">
                    {profile.nickname}, {profile.age}
                  </h2>
                </div>
                <p className="text-sm font-medium text-white/90">
                  {profile.jobRole}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <CompanyBadge
                  companyName={profile.companyName}
                  status={profile.companyStatus}
                />
                <MannerTempBadge temp={profile.mannerTemp} />
              </div>

              <p className="text-sm leading-relaxed text-slate-700">
                {profile.bio}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handlePass}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-100 active:scale-[0.98]"
                >
                  <X className="h-5 w-5" />
                  다음 분 보기
                </button>
                <button
                  onClick={handleLike}
                  disabled={likedProfileIds.includes(profile.id)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-500 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
                >
                  <Heart className="h-5 w-5 fill-white" />
                  {likedProfileIds.includes(profile.id)
                    ? "호감 보냄"
                    : "호감 보내기"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <Ban className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-semibold text-slate-700">
              조건에 맞는 추천 프로필이 없습니다.
            </p>
          </div>
        )}
      </div>

      {/* 호감 전송 / 매칭 성사 시뮬레이션 모달 */}
      {matchPopupName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-slate-900">
              {matchPopupName}님에게 호감을 보냈어요!
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">
              상대방이 수락하면 판교밋 1:1 채팅방이 열립니다. (프로토타입에서는
              채팅 탭에서 바로 대화를 체험할 수 있어요!)
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                onClick={() => {
                  setMatchPopupName(null);
                  setCurrentIndex((prev) => prev + 1);
                }}
                className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700"
              >
                계속 탐색
              </button>
              <Link
                href="/chat"
                onClick={() => setMatchPopupName(null)}
                className="rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white"
              >
                채팅으로 이동
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
