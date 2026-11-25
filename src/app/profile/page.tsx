"use client";

import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock,
  LogIn,
  MapPin,
  RefreshCw,
  Shield,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";
import {
  AppShell,
  CompanyBadge,
  MannerTempBadge,
} from "@/components/AppShell";
import { useApp } from "@/lib/appContext";

export default function ProfilePage() {
  const { user, setUser } = useApp();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanyDomain, setNewCompanyDomain] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const handleSimulateExpire = () => {
    setUser((prev) => ({
      ...prev,
      companyStatus: "FORMER_EMPLOYEE",
      daysUntilExpire: 0,
    }));
    setToast(
      `6개월 미인증으로 '${user.companyName}'이(가) [전 직장] 상태로 자동 전환되었습니다.`
    );
  };

  const handleReverify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) return;
    const domain = emailInput.split("@")[1];
    const companyGuess =
      domain.includes("naver")
        ? "네이버"
        : domain.includes("kakao")
        ? "카카오"
        : domain.split(".")[0].toUpperCase();

    setUser((prev) => ({
      ...prev,
      companyName: companyGuess,
      companyStatus: "VERIFIED",
      daysUntilExpire: 180,
    }));
    setEmailInput("");
    setToast(
      `${companyGuess} 메일 인증 완료! 이메일 원문은 해시 처리 후 폐기되었습니다. (180일 유효)`
    );
  };

  const handleNewCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setShowNewCompanyModal(false);
    setToast(
      `[${newCompanyName}] 신규 회사/스타트업 도메인(${
        newCompanyDomain || "대체 서류"
      }) 등록이 신청되었습니다. 운영팀 검수 후 반영됩니다.`
    );
    setNewCompanyName("");
    setNewCompanyDomain("");
  };

  return (
    <AppShell
      title="마이 / 인증"
      rightAction={
        <button
          onClick={() => setShowAuthModal(true)}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
        >
          <LogIn className="h-3.5 w-3.5" />
          가입·본인인증
        </button>
      }
    >
      <div className="space-y-4 p-4">
        {toast && (
          <div className="flex items-center justify-between gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900">
            <span>{toast}</span>
            <button onClick={() => setToast(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* 내 프로필 요약 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-orange-400 text-2xl font-bold text-white">
                😎
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  {user.nickname}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <CompanyBadge
                    companyName={user.companyName}
                    status={user.companyStatus}
                  />
                  <MannerTempBadge temp={user.mannerTemp} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="text-slate-400">로그인 / 본인인증</span>
              <p className="mt-0.5 font-bold text-slate-800">
                {user.loginProvider} · 휴대폰 CI 완료
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <span className="text-slate-400">판교 GPS 생활권</span>
              <p className="mt-0.5 font-bold text-emerald-700">
                ✓ 판교테크노밸리 인증됨
              </p>
            </div>
          </div>
        </div>

        {/* 6개월 회사 메일 인증 관리 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-extrabold text-slate-900">
                회사 메일 인증 (6개월 주기)
              </h3>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {user.companyStatus === "VERIFIED"
                ? `만료까지 ${user.daysUntilExpire}일`
                : "만료 · 전 직장 상태"}
            </span>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-slate-600">
            6개월마다 재인증을 거치며, 만료 시 계정이 차단되지 않고{" "}
            <strong>[전 직장]</strong>으로 자동 전환됩니다. (이메일 원문은
            저장하지 않고 해시 처리됩니다.)
          </p>

          <form onSubmit={handleReverify} className="mt-3 flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@company.com"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
            >
              인증하기
            </button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSimulateExpire}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              ⏱️ 6개월 만료 시뮬레이션 (전 직장 전환)
            </button>
            <button
              type="button"
              onClick={() => setShowNewCompanyModal(true)}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              + 미등록 스타트업/회사 등록 신청
            </button>
          </div>
        </div>

        {/* GPS 생활권 & 지인 차단 설정 */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-rose-500" />
              <span className="text-sm font-bold text-slate-900">
                판교 GPS 생활권 인증
              </span>
            </div>
            <button
              onClick={() =>
                setToast("현재 위치(성남시 분당구 삼평동)로 생활권이 갱신되었습니다.")
              }
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700"
            >
              <RefreshCw className="h-3 w-3" />
              재인증
            </button>
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  동일 회사 동료 자동 차단
                </p>
                <p className="text-[11px] text-slate-500">
                  연락처 {user.blockedPhoneCount}명 차단 동기화됨
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={user.blockSameCompany}
              onChange={(e) =>
                setUser((prev) => ({
                  ...prev,
                  blockSameCompany: e.target.checked,
                }))
              }
              className="h-5 w-5 accent-rose-500"
            />
          </div>
        </div>
      </div>

      {/* 회원가입(일반/네이버/카카오) + 휴대폰 본인인증 미리보기 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                로그인 / 가입 흐름 미리보기
              </h3>
              <button onClick={() => setShowAuthModal(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              3가지 로그인 지원 + 최초 1회 휴대폰 본인인증(CI)으로 1인 1계정 및
              성인인증을 보장합니다.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => {
                  setUser((p) => ({ ...p, loginProvider: "KAKAO" }));
                  setShowAuthModal(false);
                  setToast("카카오 계정으로 전환되었습니다.");
                }}
                className="w-full rounded-xl bg-[#FEE500] py-2.5 text-xs font-bold text-[#191919]"
              >
                카카오로 시작하기
              </button>
              <button
                onClick={() => {
                  setUser((p) => ({ ...p, loginProvider: "NAVER" }));
                  setShowAuthModal(false);
                  setToast("네이버 계정으로 전환되었습니다.");
                }}
                className="w-full rounded-xl bg-[#03C75A] py-2.5 text-xs font-bold text-white"
              >
                네이버로 시작하기
              </button>
              <button
                onClick={() => {
                  setUser((p) => ({ ...p, loginProvider: "LOCAL" }));
                  setShowAuthModal(false);
                  setToast("일반 이메일 계정으로 전환되었습니다.");
                }}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700"
              >
                일반 이메일로 가입/로그인
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
              <Smartphone className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                <strong>2단계 필수:</strong> PASS/NICE 휴대폰 본인인증 (CI
                해시 저장 · 만 19세 이상 확인)
              </span>
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            </div>
          </div>
        </div>
      )}

      {/* 신규 회사 / 스타트업 도메인 등록 신청 모달 */}
      {showNewCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleNewCompanySubmit}
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900">
                신규 회사 / 스타트업 등록
              </h3>
              <button
                type="button"
                onClick={() => setShowNewCompanyModal(false)}
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              화이트리스트에 없는 스타트업이나 도메인 없는 회사는 등록 신청 및
              명함/재직서류 대체 인증이 가능합니다.
            </p>
            <div className="mt-3 space-y-2.5 text-xs">
              <input
                type="text"
                required
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="회사명 (예: 판교AI스타트업)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
              <input
                type="text"
                value={newCompanyDomain}
                onChange={(e) => setNewCompanyDomain(e.target.value)}
                placeholder="회사 도메인 (없으면 비워두세요)"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
              />
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="h-4 w-4 shrink-0 text-slate-500" />
                <span>
                  도메인 미보유 시 명함/자격득실확인서 검수 후 즉시 파기됩니다.
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white"
            >
              등록 신청하기
            </button>
          </form>
        </div>
      )}
    </AppShell>
  );
}
