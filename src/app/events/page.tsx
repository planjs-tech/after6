"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Crown,
  EyeOff,
  Flame,
  Lock,
  MapPin,
  Plus,
  Ruler,
  ShieldAlert,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Utensils,
  X,
  Zap,
} from "lucide-react";
import { AppShell, MannerTempBadge } from "@/components/AppShell";
import {
  ApplicantPreview,
  ApprovalMode,
  calculateRefund,
  GroupEvent,
  MOCK_APPLICANTS,
  MOCK_CATERINGS,
  MOCK_VENUES,
  REFUND_TIERS,
} from "@/lib/mockData";
import { useApp } from "@/lib/appContext";

export default function EventsPage() {
  const {
    user,
    events,
    setEvents,
    joinedEventStatuses,
    joinEvent,
    cancelEventJoin,
    dissolveEvent,
    reports,
    submitReport,
  } = useApp();

  const [themeFilter, setThemeFilter] = useState<string>("전체");
  const [photoFilter, setPhotoFilter] = useState<
    "ALL" | "BLIND" | "PHOTO_REVIEW"
  >("ALL");
  const [selectedEvent, setSelectedEvent] = useState<GroupEvent | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRotationModal, setShowRotationModal] =
    useState<GroupEvent | null>(null);
  const [hostReviewEvent, setHostReviewEvent] = useState<GroupEvent | null>(
    null
  );
  const [applicants, setApplicants] =
    useState<ApplicantPreview[]>(MOCK_APPLICANTS);
  const [cancelTargetEvent, setCancelTargetEvent] =
    useState<GroupEvent | null>(null);
  const [reportTargetEvent, setReportTargetEvent] =
    useState<GroupEvent | null>(null);
  const [reportReason, setReportReason] = useState(
    "현장에서 개인 계좌이체/현금 추가 비용을 요구함"
  );
  const [paymentToast, setPaymentToast] = useState<string | null>(null);

  // Rotation demo states
  const [round, setRound] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [hostRatingSubmitted, setHostRatingSubmitted] = useState(false);

  // Host Create Form states
  const [newTitle, setNewTitle] = useState("");
  const [newTheme, setNewTheme] =
    useState<GroupEvent["theme"]>("로테이션 소개팅");
  const [newDateValue, setNewDateValue] = useState("2026-12-05");
  const [newTimeSlot, setNewTimeSlot] =
    useState<GroupEvent["timeSlot"]>("19:30 ~ 21:30");
  const [newAreaFilter, setNewAreaFilter] = useState<string>("전체");
  const [newVenueId, setNewVenueId] = useState<string>("v1");
  const [newCateringId, setNewCateringId] = useState<string>(
    MOCK_CATERINGS[0].id
  );
  const [newCapacityPerGender, setNewCapacityPerGender] = useState(5);
  const [newHostFee, setNewHostFee] = useState(9000);
  const [newRequireCurrent, setNewRequireCurrent] = useState(true);
  const [newMinAge, setNewMinAge] = useState(26);
  const [newMaxAge, setNewMaxAge] = useState(35);
  const [newMinHeightMale, setNewMinHeightMale] = useState(173);
  const [newMinHeightFemale, setNewMinHeightFemale] = useState(158);
  const [newMinTemp, setNewMinTemp] = useState(36.5);
  const [newRequirePhotoReview, setNewRequirePhotoReview] = useState(false);
  const [newApprovalMode, setNewApprovalMode] =
    useState<ApprovalMode>("INSTANT");

  const themes = ["전체", "와인 미팅", "보드게임", "로테이션 소개팅"];
  const visibleEvents = events.filter((e) => {
    if (e.status === "DISSOLVED") return false;
    if (themeFilter !== "전체" && e.theme !== themeFilter) return false;
    if (photoFilter === "BLIND" && e.conditions.requirePhotoReview)
      return false;
    if (photoFilter === "PHOTO_REVIEW" && !e.conditions.requirePhotoReview)
      return false;
    return true;
  });

  // 실시간 날짜/시간/장소 기반 파티룸 가용성 필터링
  const slotKey = `${newDateValue}|${newTimeSlot}`;
  const areaFilteredVenues = MOCK_VENUES.filter((v) =>
    newAreaFilter === "전체" ? true : v.area === newAreaFilter
  ).sort((a, b) => {
    const aAvail = a.availableSlots.includes(slotKey) ? 1 : 0;
    const bAvail = b.availableSlots.includes(slotKey) ? 1 : 0;
    if (aAvail !== bAvail) return bAvail - aAvail;
    return Number(b.isAdBoosted) - Number(a.isAdBoosted);
  });

  const pickedVenue =
    MOCK_VENUES.find((v) => v.id === newVenueId) ?? MOCK_VENUES[0];
  const isPickedVenueAvailable = pickedVenue.availableSlots.includes(slotKey);
  const pickedCatering =
    MOCK_CATERINGS.find((c) => c.id === newCateringId) ?? null;

  const totalPeople = newCapacityPerGender * 2;
  const venuePerPerson = Math.round(pickedVenue.eventPrice / totalPeople);
  const cateringPerPerson = pickedCatering ? pickedCatering.pricePerPerson : 0;
  const platformFee = Math.round(
    (venuePerPerson + cateringPerPerson + newHostFee) * 0.12
  );
  const calculatedTicketPrice =
    venuePerPerson + cateringPerPerson + newHostFee + platformFee;

  // 조건 충족 여부 검사 (나이, 키, 매너온도, 현직인증)
  const checkEligibility = (ev: GroupEvent) => {
    const reasons: string[] = [];
    if (
      ev.conditions.requireCurrentEmployee &&
      user.companyStatus !== "VERIFIED"
    ) {
      reasons.push("현직 회사 메일 인증이 필요합니다.");
    }
    if (user.age < ev.conditions.minAge || user.age > ev.conditions.maxAge) {
      reasons.push(
        `나이 조건(${ev.conditions.minAge}~${ev.conditions.maxAge}세)에 맞지 않습니다.`
      );
    }
    const minH =
      user.gender === "M"
        ? ev.conditions.minHeightMale
        : ev.conditions.minHeightFemale;
    if (user.heightCm < minH) {
      reasons.push(`키 조건(${minH}cm 이상)에 맞지 않습니다.`);
    }
    if (user.mannerTemp < ev.conditions.minMannerTemp) {
      reasons.push(
        `매너온도 ${ev.conditions.minMannerTemp}°C 이상만 신청 가능합니다.`
      );
    }
    return { eligible: reasons.length === 0, reasons };
  };

  const handleApplyEvent = (ev: GroupEvent) => {
    const { eligible, reasons } = checkEligibility(ev);
    if (!eligible) {
      alert(`참가 조건 미충족:\n- ${reasons.join("\n- ")}`);
      return;
    }

    if (ev.conditions.approvalMode === "INSTANT") {
      joinEvent(ev.id, "CONFIRMED");
      setSelectedEvent(null);
      setPaymentToast(
        `[${ev.title}] 선착순 즉시 예약 확정! 에스크로 결제가 완료되었습니다.`
      );
    } else {
      joinEvent(ev.id, "PENDING_APPROVAL");
      setSelectedEvent(null);
      setPaymentToast(
        `[${ev.title}] 신청 완료! 주선자 확인(OK) 후 최종 확정됩니다. (미승인 시 100% 자동 환불)`
      );
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPickedVenueAvailable) {
      alert("선택하신 날짜·시간에 예약 가능한 파티룸을 골라주세요.");
      return;
    }
    const dateLabels: Record<string, string> = {
      "2026-12-04": "12월 4일 (금)",
      "2026-12-05": "12월 5일 (토)",
      "2026-12-06": "12월 6일 (일)",
    };
    const created: GroupEvent = {
      id: `e-${Date.now()}`,
      title:
        newTitle.trim() ||
        `판교 ${newCapacityPerGender}:${newCapacityPerGender} ${newTheme}`,
      theme: newTheme,
      dateValue: newDateValue,
      dateText: dateLabels[newDateValue] ?? newDateValue,
      timeSlot: newTimeSlot,
      daysLeft: 9,
      venue: pickedVenue,
      catering: pickedCatering,
      hostName: `호스트 ${user.nickname}`,
      hostCompany: user.companyName,
      hostGrade: "일반 호스트",
      hostTemp: user.mannerTemp,
      isMyHosted: true,
      maleCount: 1,
      maleCapacity: newCapacityPerGender,
      femaleCount: 0,
      femaleCapacity: newCapacityPerGender,
      conditions: {
        requireCurrentEmployee: newRequireCurrent,
        minAge: newMinAge,
        maxAge: newMaxAge,
        minHeightMale: newMinHeightMale,
        minHeightFemale: newMinHeightFemale,
        minMannerTemp: newMinTemp,
        requirePhotoReview: newRequirePhotoReview,
        approvalMode: newApprovalMode,
      },
      ticketPrice: calculatedTicketPrice,
      breakdown: {
        venuePerPerson,
        cateringPerPerson,
        hostFee: newHostFee,
        platformFee,
      },
      participantCompanies: [user.companyName],
      avgMannerTemp: user.mannerTemp,
      status: "RECRUITING",
    };
    setEvents((prev) => [created, ...prev]);
    setShowCreateModal(false);
    setNewTitle("");
    setPaymentToast(
      `[${created.title}] 모임이 개설되고 '${pickedVenue.name}' 슬롯이 예약 홀드되었습니다.`
    );
  };

  return (
    <AppShell
      title="판교 단체 모임"
      rightAction={
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800"
        >
          <Plus className="h-3.5 w-3.5" />
          주선하기
        </button>
      }
    >
      <div className="space-y-3.5 p-4">
        {/* 추가 비용 요구 금지 상단 안내 배너 */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div>
            <strong className="font-bold">안전 결제 원칙:</strong> 플랫폼 결제
            외 현장에서 주선자가 개인 계좌이체·현금 추가 비용을 요구하는 행위는
            100% 금지됩니다. 요구 시 즉시 신고해 주세요.
          </div>
        </div>

        {/* 신고 접수 알림 */}
        {reports.length > 0 && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <strong>신고 접수됨 ({reports.length}건):</strong>{" "}
            {reports[0].eventTitle} — 해당 모임 주선자 정산이 자동{" "}
            <span className="font-bold underline">보류(HOLD)</span> 되었습니다.
          </div>
        )}

        {/* 토스트 알림 */}
        {paymentToast && (
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{paymentToast}</span>
            </div>
            <button
              onClick={() => setPaymentToast(null)}
              className="text-emerald-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 신청자 선택 필터: 사진 확인 여부 */}
        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 text-xs">
          {[
            { id: "ALL", label: "전체 모임" },
            { id: "BLIND", label: "🙈 사진 비공개" },
            { id: "PHOTO_REVIEW", label: "📷 주선자 사진확인" },
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() =>
                setPhotoFilter(opt.id as "ALL" | "BLIND" | "PHOTO_REVIEW")
              }
              className={`flex-1 rounded-xl py-1.5 font-semibold transition ${
                photoFilter === opt.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 테마 필터 */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {themes.map((t) => (
            <button
              key={t}
              onClick={() => setThemeFilter(t)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                themeFilter === t
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 모임 카드 리스트 */}
        <div className="space-y-3.5">
          {visibleEvents.map((ev) => {
            const joinStatus = joinedEventStatuses[ev.id];
            const { eligible } = checkEligibility(ev);

            return (
              <div
                key={ev.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-rose-200"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">
                      {ev.theme}
                    </span>
                    {ev.conditions.approvalMode === "INSTANT" ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                        <Zap className="h-3 w-3" />
                        즉시 예약
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                        <UserCheck className="h-3 w-3" />
                        주선자 승인
                      </span>
                    )}
                    {ev.conditions.requirePhotoReview ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        <Camera className="h-3 w-3" />
                        주선자만 사진확인
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        <EyeOff className="h-3 w-3" />
                        사진 비공개
                      </span>
                    )}
                    {ev.status === "IN_PROGRESS" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white">
                        <Flame className="h-3 w-3" />
                        진행 중
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-extrabold text-slate-900 shrink-0">
                    {ev.ticketPrice.toLocaleString()}원
                  </span>
                </div>

                <h3 className="mt-2.5 text-base font-bold leading-snug text-slate-900">
                  {ev.title}
                </h3>

                {/* 조건 요약 라인 */}
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                  <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                    <Lock className="h-2.5 w-2.5" />
                    {ev.conditions.minAge}~{ev.conditions.maxAge}세
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                    <Ruler className="h-2.5 w-2.5" />
                    남 {ev.conditions.minHeightMale}↑ / 여{" "}
                    {ev.conditions.minHeightFemale}↑
                  </span>
                  {ev.conditions.requireCurrentEmployee && (
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">
                      현직 필수
                    </span>
                  )}
                </div>

                <div className="mt-2.5 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {ev.dateText} · {ev.timeSlot} (D-{ev.daysLeft})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {ev.venue.name} ({ev.venue.location})
                    </span>
                  </div>
                  {ev.catering && (
                    <div className="flex items-center gap-1.5">
                      <Utensils className="h-3.5 w-3.5 text-slate-400" />
                      <span>{ev.catering.name}</span>
                    </div>
                  )}
                </div>

                {/* 주선자 & 성비 현황 */}
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-semibold text-slate-800">
                      {ev.hostName}
                    </span>
                    <MannerTempBadge temp={ev.hostTemp} />
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    남 {ev.maleCount}/{ev.maleCapacity} · 여 {ev.femaleCount}/
                    {ev.femaleCapacity}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="mt-3.5 flex gap-2">
                  <button
                    onClick={() => setSelectedEvent(ev)}
                    className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    상세 · 환불 · 조건
                  </button>

                  {joinStatus === "CONFIRMED" ? (
                    <button
                      onClick={() => setShowRotationModal(ev)}
                      className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
                      확정됨 · 로테이션 입장
                    </button>
                  ) : joinStatus === "PENDING_APPROVAL" ? (
                    <button
                      onClick={() => setHostReviewEvent(ev)}
                      className="flex-1 rounded-xl bg-violet-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-violet-700"
                    >
                      승인 대기 · 주선자 심사함(데모)
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedEvent(ev)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs ${
                        eligible
                          ? "bg-rose-500 hover:bg-rose-600"
                          : "bg-slate-400"
                      }`}
                    >
                      {eligible
                        ? ev.conditions.approvalMode === "INSTANT"
                          ? "바로 예약하기"
                          : "참가 신청하기"
                        : "참가 조건 미충족"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 모임 상세 & 고정 조건 & 아고다식 차등 환불 & 해산/취소 모달 */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                {selectedEvent.theme}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="mt-2 text-lg font-extrabold text-slate-900">
              {selectedEvent.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {selectedEvent.dateText} · {selectedEvent.timeSlot} ·{" "}
              {selectedEvent.venue.name}
            </p>

            {/* 고정 참가 조건 */}
            <div className="mt-4 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-bold text-indigo-900">
                  <Lock className="h-3.5 w-3.5" />
                  모임 참가 조건 (개설 후 수정 불가)
                </span>
                {checkEligibility(selectedEvent).eligible ? (
                  <span className="font-bold text-emerald-700">✓ 내 조건 충족</span>
                ) : (
                  <span className="font-bold text-rose-600">✕ 조건 미달</span>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-indigo-950">
                <li>
                  • 나이: {selectedEvent.conditions.minAge}세 ~{" "}
                  {selectedEvent.conditions.maxAge}세 (내 나이 {user.age}세)
                </li>
                <li>
                  • 키: 남성 {selectedEvent.conditions.minHeightMale}cm↑ / 여성{" "}
                  {selectedEvent.conditions.minHeightFemale}cm↑ (내 키{" "}
                  {user.heightCm}cm)
                </li>
                <li>
                  • 매너온도: {selectedEvent.conditions.minMannerTemp}°C 이상
                  (내 온도 {user.mannerTemp.toFixed(1)}°C)
                </li>
                <li>
                  • 프로필 사진:{" "}
                  {selectedEvent.conditions.requirePhotoReview
                    ? "주선자만 승인 심사 시 미리 확인 (타 참가자 비공개)"
                    : "사진 확인 없음 (모두에게 블라인드)"}
                </li>
                <li>
                  • 확정 방식:{" "}
                  {selectedEvent.conditions.approvalMode === "INSTANT"
                    ? "선착순 즉시 예약 확정"
                    : "주선자 확인(OK) 후 확정"}
                </li>
              </ul>

              <div className="mt-2.5 border-t border-indigo-200 pt-2.5 flex items-center justify-between gap-2">
                {selectedEvent.conditions.approvalMode === "HOST_APPROVAL" && (
                  <button
                    onClick={() => {
                      const target = selectedEvent;
                      setSelectedEvent(null);
                      setHostReviewEvent(target);
                    }}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white"
                  >
                    주선자 심사함 미리보기
                  </button>
                )}
                {selectedEvent.isMyHosted && (
                  <button
                    onClick={() => {
                      dissolveEvent(selectedEvent.id);
                      setSelectedEvent(null);
                      setPaymentToast(
                        "모임이 해산되었습니다. 기존 신청자에게 100% 자동 환불 처리됩니다."
                      );
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                    모임 해산
                  </button>
                )}
              </div>
            </div>

            {/* 투명한 참가비 내역 */}
            <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-xs font-bold text-slate-800">
                투명한 참가비 구성 (1인{" "}
                {selectedEvent.ticketPrice.toLocaleString()}원)
              </h4>
              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>장소 대여 실비</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEvent.breakdown.venuePerPerson.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>케이터링 / 음료</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEvent.breakdown.cateringPerPerson.toLocaleString()}
                    원
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>주선자 기획·진행비</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEvent.breakdown.hostFee.toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span>플랫폼 수수료 (에스크로/PG 포함)</span>
                  <span className="font-semibold text-slate-800">
                    {selectedEvent.breakdown.platformFee.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 아고다/호텔식 날짜별 차등 취소·환불 규정 */}
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-[11px] text-amber-950">
              <p className="font-bold mb-1.5">
                날짜별 차등 취소·환불 규정 (현재 D-{selectedEvent.daysLeft})
              </p>
              <div className="space-y-1">
                {REFUND_TIERS.map((tier) => (
                  <div key={tier.label} className="flex justify-between">
                    <span>{tier.label}</span>
                    <span className="font-bold">{tier.rate}% 환불</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 border-t border-amber-200 pt-1.5">
                <strong>추가 비용 금지:</strong> 현장에서 현금·개인 계좌이체
                요구 시 즉시 신고해 주세요.
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const target = selectedEvent;
                  setSelectedEvent(null);
                  setReportTargetEvent(target);
                }}
                className="inline-flex items-center justify-center gap-1 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs font-bold text-rose-600"
              >
                <AlertTriangle className="h-4 w-4" />
                신고
              </button>

              {joinedEventStatuses[selectedEvent.id] ? (
                <button
                  onClick={() => {
                    const target = selectedEvent;
                    setSelectedEvent(null);
                    setCancelTargetEvent(target);
                  }}
                  className="flex-1 rounded-2xl border border-slate-300 bg-slate-100 py-3 text-sm font-bold text-slate-800 hover:bg-slate-200"
                >
                  신청 취소 (환불금 확인)
                </button>
              ) : (
                <button
                  onClick={() => handleApplyEvent(selectedEvent)}
                  disabled={!checkEligibility(selectedEvent).eligible}
                  className="flex-1 rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-600 disabled:bg-slate-300"
                >
                  {!checkEligibility(selectedEvent).eligible
                    ? "참가 조건 미충족"
                    : selectedEvent.conditions.approvalMode === "INSTANT"
                    ? `${selectedEvent.ticketPrice.toLocaleString()}원 바로 예약 확정`
                    : `${selectedEvent.ticketPrice.toLocaleString()}원 신청 (주선자 승인 후 확정)`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 주선자 승인 심사함 모달 (주선자만 조건에 따라 사진 미리 확인 후 OK/거절) */}
      {hostReviewEvent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                주선자 신청자 심사함 (데모)
              </h3>
              <button
                onClick={() => setHostReviewEvent(null)}
                className="rounded-full p-1 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {hostReviewEvent.conditions.requirePhotoReview
                ? "이 모임은 [주선자만 프로필 사진 사전 확인] 설정이 켜져 있습니다. (다른 참가자는 볼 수 없습니다.)"
                : "이 모임은 [사진 비공개] 모임이므로 주선자에게도 사진이 노출되지 않습니다."}
            </p>

            {/* 내가 신청한 경우 내 건도 상단에 표시 */}
            {joinedEventStatuses[hostReviewEvent.id] === "PENDING_APPROVAL" && (
              <div className="mt-3 rounded-2xl border-2 border-violet-300 bg-violet-50 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-900">
                    내 신청 건 ({user.nickname} · {user.age}세 · {user.heightCm}
                    cm)
                  </span>
                  <span className="rounded-full bg-violet-200 px-2 py-0.5 text-[10px] font-bold text-violet-900">
                    승인 대기
                  </span>
                </div>
                <div className="mt-2.5 flex gap-2">
                  <button
                    onClick={() => {
                      joinEvent(hostReviewEvent.id, "CONFIRMED");
                      setHostReviewEvent(null);
                      setPaymentToast(
                        `주선자가 [${user.nickname}]님의 참가를 OK 승인하여 예약이 최종 확정되었습니다!`
                      );
                    }}
                    className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white"
                  >
                    ✓ 주선자 OK 승인하기
                  </button>
                  <button
                    onClick={() => {
                      cancelEventJoin(hostReviewEvent.id);
                      setHostReviewEvent(null);
                      setPaymentToast(
                        "주선자가 거절하여 에스크로 결제 금액이 100% 자동 환불되었습니다."
                      );
                    }}
                    className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold text-rose-600"
                  >
                    거절(전액환불)
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2.5">
              {applicants.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {hostReviewEvent.conditions.requirePhotoReview
                          ? a.avatarEmoji
                          : "🙈"}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">
                          {a.nickname} ({a.gender === "M" ? "남" : "여"} ·{" "}
                          {a.age}세 · {a.heightCm}cm)
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {a.companyName} · 🌡️ {a.mannerTemp}°C
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {a.status === "APPROVED"
                        ? "승인됨"
                        : a.status === "REJECTED"
                        ? "거절(환불)"
                        : "대기 중"}
                    </span>
                  </div>

                  {hostReviewEvent.conditions.requirePhotoReview ? (
                    <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
                      📷 <strong>주선자 전용 사진 미리보기:</strong>{" "}
                      {a.photoSummary}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                      🙈 사진 비공개 모임 — 프로필 사진이 가려져 있습니다.
                    </div>
                  )}

                  {a.status === "PENDING" && (
                    <div className="mt-2.5 flex gap-2">
                      <button
                        onClick={() =>
                          setApplicants((prev) =>
                            prev.map((item) =>
                              item.id === a.id
                                ? { ...item, status: "APPROVED" }
                                : item
                            )
                          )
                        }
                        className="flex-1 rounded-xl bg-emerald-600 py-1.5 font-bold text-white"
                      >
                        OK 승인
                      </button>
                      <button
                        onClick={() =>
                          setApplicants((prev) =>
                            prev.map((item) =>
                              item.id === a.id
                                ? { ...item, status: "REJECTED" }
                                : item
                            )
                          )
                        }
                        className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 font-bold text-rose-600"
                      >
                        거절
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 아고다식 차등 환불 계산기 & 신청 취소 확인 모달 */}
      {cancelTargetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              신청 취소 및 환불 금액 확인
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {cancelTargetEvent.title} (모임까지 D-{cancelTargetEvent.daysLeft})
            </p>

            {(() => {
              const res = calculateRefund(
                cancelTargetEvent.ticketPrice,
                cancelTargetEvent.daysLeft
              );
              const fee = cancelTargetEvent.ticketPrice - res.amount;
              return (
                <div className="mt-3 rounded-2xl bg-slate-50 p-3.5 text-xs space-y-1.5 border border-slate-200">
                  <div className="flex justify-between">
                    <span>결제 원금</span>
                    <span className="font-semibold">
                      {cancelTargetEvent.ticketPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>적용 환불율 (D-{cancelTargetEvent.daysLeft})</span>
                    <span className="font-bold text-indigo-600">
                      {res.rate}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>취소 위약금</span>
                    <span className="text-rose-600">
                      -{fee.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-extrabold">
                    <span>예상 환불 금액</span>
                    <span className="text-emerald-600">
                      {res.amount.toLocaleString()}원
                    </span>
                  </div>
                  {res.penaltyTemp < 0 && (
                    <p className="pt-1 text-[11px] font-bold text-rose-600">
                      ⚠️ 당일 취소/노쇼 규정으로 매너온도 {res.penaltyTemp}°C
                      차감이 적용됩니다.
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setCancelTargetEvent(null)}
                className="rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600"
              >
                유지하기
              </button>
              <button
                onClick={() => {
                  const res = calculateRefund(
                    cancelTargetEvent.ticketPrice,
                    cancelTargetEvent.daysLeft
                  );
                  cancelEventJoin(cancelTargetEvent.id);
                  setCancelTargetEvent(null);
                  setPaymentToast(
                    `참가 취소가 완료되었습니다. ${res.amount.toLocaleString()}원이 환불 예정입니다.`
                  );
                }}
                className="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white"
              >
                취소 확정
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 현장 로테이션 타이머 & 종료 후 호감 선택/매너온도 평가 모달 */}
      {showRotationModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                <Clock className="h-3.5 w-3.5" />
                현장 로테이션 안내
              </span>
              <button
                onClick={() => setShowRotationModal(null)}
                className="rounded-full p-1 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] font-medium text-amber-900">
              플랫폼 결제 외 현장 추가금 요구 시 상단 신고로 제보해 주세요.
            </div>

            <div className="mt-4 rounded-2xl bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  현재 {round} / 5 라운드
                </span>
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-xs font-bold">
                  남은 시간 12:40
                </span>
              </div>
              <p className="mt-2 text-lg font-extrabold">
                Table B · 상대: 지우 (네이버 · 디자이너)
              </p>
              <p className="mt-1 text-xs text-slate-300">
                추천 대화 주제: &ldquo;요즘 판교에서 제일 자주 가는 맛집이나
                카페가 있나요?&rdquo;
              </p>
              <button
                onClick={() => setRound((r) => (r >= 5 ? 1 : r + 1))}
                className="mt-3 w-full rounded-xl bg-white/15 py-2 text-xs font-semibold hover:bg-white/25"
              >
                다음 라운드로 넘기기 (데모)
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-800">
                모임 종료 후 호감 상대 선택 (최대 3명 · 상호 선택 시 채팅 오픈)
              </h4>
              {["지우 (네이버)", "하은 (전 토스)", "수빈 (라인)"].map(
                (person) => {
                  const checked = selectedChoices.includes(person);
                  return (
                    <button
                      key={person}
                      onClick={() =>
                        setSelectedChoices((prev) =>
                          checked
                            ? prev.filter((x) => x !== person)
                            : prev.length < 3
                            ? [...prev, person]
                            : prev
                        )
                      }
                      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                        checked
                          ? "border-rose-400 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <span>{person}</span>
                      <span>{checked ? "❤️ 선택됨" : "선택"}</span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 p-3.5">
              <h4 className="text-xs font-bold text-slate-800">
                주선자({showRotationModal.hostName}) 매너온도 평가
              </h4>
              {hostRatingSubmitted ? (
                <p className="mt-2 text-xs font-semibold text-emerald-600">
                  ✓ 주선자 평가가 완료되었습니다! (+0.3°C 반영)
                </p>
              ) : (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setHostRatingSubmitted(true)}
                    className="flex-1 rounded-xl bg-emerald-50 py-2 text-xs font-bold text-emerald-700"
                  >
                    👍 진행 매끄러움 (+0.3°C)
                  </button>
                  <button
                    onClick={() => {
                      const target = showRotationModal;
                      setShowRotationModal(null);
                      setReportTargetEvent(target);
                    }}
                    className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600"
                  >
                    추가금/불만 신고
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 주선자 모임 개설 위저드 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <form
            onSubmit={handleCreateEvent}
            className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                단체 소개팅 주선하기
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-full p-1 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700">모임 제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="예: 금요일 저녁 판교 5:5 와인 로테이션"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-rose-400"
                />
              </div>

              {/* 1단계: 날짜 · 시간 · 판교 권역 선택 → 실시간 예약 가능 파티룸 조회 */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                <p className="font-bold text-slate-800">
                  1. 날짜 · 시간 · 지역 선택 (실시간 예약 가능 파티룸 조회)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newDateValue}
                    onChange={(e) => setNewDateValue(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="2026-12-04">12월 4일 (금)</option>
                    <option value="2026-12-05">12월 5일 (토)</option>
                    <option value="2026-12-06">12월 6일 (일)</option>
                  </select>
                  <select
                    value={newTimeSlot}
                    onChange={(e) =>
                      setNewTimeSlot(e.target.value as GroupEvent["timeSlot"])
                    }
                    className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="19:30 ~ 21:30">19:30 ~ 21:30</option>
                    <option value="15:00 ~ 17:00">15:00 ~ 17:00</option>
                    <option value="18:30 ~ 20:30">18:30 ~ 20:30</option>
                  </select>
                </div>

                <div className="flex gap-1.5">
                  {["전체", "판교역", "삼평동", "백현동"].map((area) => (
                    <button
                      type="button"
                      key={area}
                      onClick={() => setNewAreaFilter(area)}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        newAreaFilter === area
                          ? "bg-slate-900 text-white"
                          : "bg-white border border-slate-200 text-slate-600"
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                <div className="space-y-2 pt-1">
                  {areaFilteredVenues.map((v) => {
                    const available = v.availableSlots.includes(slotKey);
                    return (
                      <button
                        type="button"
                        key={v.id}
                        disabled={!available}
                        onClick={() => setNewVenueId(v.id)}
                        className={`w-full rounded-xl border p-3 text-left transition ${
                          !available
                            ? "border-slate-200 bg-slate-100 opacity-55 cursor-not-allowed"
                            : newVenueId === v.id
                            ? "border-rose-400 bg-white ring-2 ring-rose-200"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {v.isAdBoosted && available && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                <Sparkles className="h-2.5 w-2.5" />
                                {v.isNewBoost ? "NEW 추천" : "AD 추천"}
                              </span>
                            )}
                            <span className="font-bold text-slate-900">
                              {v.name}
                            </span>
                          </div>
                          {available ? (
                            <span className="font-bold text-emerald-700">
                              예약 가능 · {v.eventPrice.toLocaleString()}원
                            </span>
                          ) : (
                            <span className="font-bold text-slate-500">
                              해당 시간 예약 마감
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          [{v.area}] {v.location} · 최대 {v.capacity}명 · ★{" "}
                          {v.rating}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2단계: 참가 조건 및 승인 방식 세팅 (개설 후 변경 불가) */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-3 space-y-2.5">
                <span className="inline-flex items-center gap-1 font-bold text-indigo-900">
                  <Lock className="h-3.5 w-3.5" />
                  2. 참가 조건 & 승인 방식 (개설 후 수정 불가)
                </span>
                <p className="text-[11px] text-indigo-800">
                  생성 후에는 조건을 수정할 수 없으며, 변경 시 모임을 해산해야
                  합니다.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      최소 나이
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={45}
                      value={newMinAge}
                      onChange={(e) => setNewMinAge(Number(e.target.value) || 25)}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      최대 나이
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={50}
                      value={newMaxAge}
                      onChange={(e) => setNewMaxAge(Number(e.target.value) || 35)}
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      남성 최소 키 (cm)
                    </label>
                    <input
                      type="number"
                      min={155}
                      max={195}
                      value={newMinHeightMale}
                      onChange={(e) =>
                        setNewMinHeightMale(Number(e.target.value) || 170)
                      }
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">
                      여성 최소 키 (cm)
                    </label>
                    <input
                      type="number"
                      min={145}
                      max={180}
                      value={newMinHeightFemale}
                      onChange={(e) =>
                        setNewMinHeightFemale(Number(e.target.value) || 155)
                      }
                      className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700">
                    최소 매너온도 (°C)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={30}
                    max={45}
                    value={newMinTemp}
                    onChange={(e) =>
                      setNewMinTemp(Number(e.target.value) || 36.5)
                    }
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs"
                  />
                </div>

                <label className="flex items-center gap-2 pt-0.5 font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newRequireCurrent}
                    onChange={(e) => setNewRequireCurrent(e.target.checked)}
                    className="h-4 w-4 accent-rose-500"
                  />
                  현직 회사 메일 인증자만 참여 허용
                </label>

                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newRequirePhotoReview}
                    onChange={(e) =>
                      setNewRequirePhotoReview(e.target.checked)
                    }
                    className="h-4 w-4 accent-rose-500"
                  />
                  주선자만 신청자 프로필 사진 미리 확인하기
                </label>

                {/* 확정 방식 선택 */}
                <div className="pt-1">
                  <label className="text-[11px] font-bold text-indigo-900">
                    예약 확정 방식
                  </label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewApprovalMode("INSTANT")}
                      className={`rounded-xl border py-2 px-2 text-center font-bold ${
                        newApprovalMode === "INSTANT"
                          ? "border-sky-500 bg-sky-50 text-sky-800"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      ⚡ 즉시 예약 확정
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewApprovalMode("HOST_APPROVAL")}
                      className={`rounded-xl border py-2 px-2 text-center font-bold ${
                        newApprovalMode === "HOST_APPROVAL"
                          ? "border-violet-500 bg-violet-50 text-violet-800"
                          : "border-slate-200 bg-white text-slate-600"
                      }`}
                    >
                      🙋 주선자 확인 후 OK
                    </button>
                  </div>
                </div>
              </div>

              {/* 테마 & 케이터링 & 정원 */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700">모임 테마</label>
                  <select
                    value={newTheme}
                    onChange={(e) =>
                      setNewTheme(e.target.value as GroupEvent["theme"])
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs"
                  >
                    <option value="로테이션 소개팅">로테이션 소개팅</option>
                    <option value="와인 미팅">와인 미팅</option>
                    <option value="보드게임">보드게임</option>
                    <option value="IT 네트워킹">IT 네트워킹</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700">케이터링</label>
                  <select
                    value={newCateringId}
                    onChange={(e) => setNewCateringId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs"
                  >
                    <option value="">선택 안 함 (0원)</option>
                    {MOCK_CATERINGS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (+{c.pricePerPerson.toLocaleString()}원)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700">
                    성별 정원 (N:N)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={newCapacityPerGender}
                    onChange={(e) =>
                      setNewCapacityPerGender(Number(e.target.value) || 4)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700">
                    주선자 진행비(1인당)
                  </label>
                  <input
                    type="number"
                    step={1000}
                    min={0}
                    max={20000}
                    value={newHostFee}
                    onChange={(e) => setNewHostFee(Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              {/* 예상 정산 요약 */}
              <div className="rounded-2xl bg-slate-900 p-3.5 text-white">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>1인 참가비 자동 계산</span>
                  <span className="text-base font-extrabold text-amber-300">
                    {calculatedTicketPrice.toLocaleString()}원
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300">
                  정원 마감 시 주선자 예상 수익:{" "}
                  <strong className="text-white">
                    {(newHostFee * totalPeople).toLocaleString()}원
                  </strong>{" "}
                  (원천징수 전)
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isPickedVenueAvailable}
              className="mt-4 w-full rounded-2xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-600 disabled:bg-slate-300"
            >
              {isPickedVenueAvailable
                ? "파티룸 슬롯 홀드 및 모임 개설하기"
                : "선택한 시간에 가능한 파티룸을 골라주세요"}
            </button>
          </form>
        </div>
      )}

      {/* 신고하기 모달 */}
      {reportTargetEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <h3 className="text-base font-extrabold text-slate-900">
              모임/주선자 위반 신고
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              신고 접수 시 해당 모임의 주선자 정산이 즉시 보류(HOLD)됩니다.
            </p>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs"
            >
              <option value="현장에서 개인 계좌이체/현금 추가 비용을 요구함">
                현장에서 개인 계좌이체/현금 추가 비용을 요구함
              </option>
              <option value="사전 안내된 장소/케이터링과 현저히 다름">
                사전 안내된 장소/케이터링과 현저히 다름
              </option>
              <option value="비매너/영업/다단계 목적 참여">
                비매너/영업/다단계 목적 참여
              </option>
            </select>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setReportTargetEvent(null)}
                className="rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600"
              >
                취소
              </button>
              <button
                onClick={() => {
                  submitReport(reportTargetEvent.title, reportReason);
                  setReportTargetEvent(null);
                }}
                className="rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white"
              >
                신고 접수
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
