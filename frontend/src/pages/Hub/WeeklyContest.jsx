import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback } from "react";

import { Link } from "react-router-dom";

import {

  Award,

  Calendar,

  CheckCircle2,

  Clock,

  Code2,

  Crown,

  Flame,

  Globe,

  HelpCircle,

  Info,

  Layers,

  Lock,

  Medal,

  Play,

  Printer,

  RefreshCw,

  Search,

  ShieldAlert,

  ShieldCheck,

  Sparkles,

  Swords,

  Timer,

  Trophy,

  UserCheck,

  UserPlus,

  Users,

  Zap,

} from "lucide-react";

import gsap from "gsap";

import HubLayout from "../../components/Hub/HubLayout";

import Arena3DScene from "../../components/Contest/Arena3DScene";

import ContestCertificate from "../../components/Contest/ContestCertificate";

import ContestStoryArena from "../../components/Contest/ContestStoryArena";

import {

  CONTEST_CHAPTERS,

  CONTEST_STORY_PROLOGUE,

} from "../../data/contestStoryProblems";

import {

  loadContestState,

  saveContestState,

  getEffectiveStage,

  getTimeUntilSunday,

  isUserRegistered,

  registerCurrentStudent,

  unregisterCurrentStudent,

  loadStudentMedals,

  awardStudentMedal,

  SEED_COMPETITORS,

} from "../../services/contestService";

import { getUser } from "../../services/learningHub";

import { fetchStudentProgress } from "../../services/learningContentService";



export default function WeeklyContest() {

  const [contestState, setContestState] = useState(loadContestState);

  const [currentUser, setCurrentUser] = useState(getUser);

  const [userProgress, setUserProgress] = useState(null);

  const [countdown, setCountdown] = useState(getTimeUntilSunday);

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedDivision, setSelectedDivision] = useState("all");

  const [activeTab, setActiveTab] = useState("roster"); // "roster" | "arena" | "podium" | "rules"

  const [certificateMedal, setCertificateMedal] = useState(null);

  const [celebrationMessage, setCelebrationMessage] = useState(null);



  const heroRef = useRef(null);

  const cardsGridRef = useRef(null);



  // Load live user progress to get exact real XP and streak

  useEffect(() => {

    fetchStudentProgress()

      .then((data) => {

        if (data?.user) {

          setUserProgress(data);

          setCurrentUser((prev) => ({

            ...prev,

            ...data.user,

          }));

        }

      })

      .catch((err) => console.warn("Could not fetch progress:", err));

  }, []);



  // Sync state updates

  useEffect(() => {

    const handleUpdate = () => {

      setContestState(loadContestState());

    };

    window.addEventListener("codeland:contest_update", handleUpdate);

    return () => window.removeEventListener("codeland:contest_update", handleUpdate);

  }, []);



  // Ticking countdown clock

  useEffect(() => {

    const timer = setInterval(() => {

      setCountdown(getTimeUntilSunday());

    }, 1000);

    return () => clearInterval(timer);

  }, []);



  const effectiveStage = getEffectiveStage(contestState);

  const isRegistered = isUserRegistered(currentUser, contestState);



  // Safe registered list fallback

  const registeredList = useMemo(() => {

    return Array.isArray(contestState?.registeredStudents) && contestState.registeredStudents.length > 0

      ? contestState.registeredStudents

      : SEED_COMPETITORS;

  }, [contestState?.registeredStudents]);



  // Live telemetry calculations

  const totalCompetitors = registeredList.length;

  const totalXpInArena = useMemo(() => {

    return registeredList.reduce((acc, s) => acc + (s?.xp || 0), 0);

  }, [registeredList]);



  const avgXp = totalCompetitors ? Math.round(totalXpInArena / totalCompetitors) : 0;



  // Filtered competitors

  const filteredCompetitors = useMemo(() => {

    return registeredList

      .filter((s) => {

        if (!s) return false;

        const name = s.name || "";

        const handle = s.handle || "";

        const div = s.division || "";

        const matchesSearch =

          name.toLowerCase().includes(searchQuery.toLowerCase()) ||

          handle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDiv =

          selectedDivision === "all" ||

          div.toLowerCase() === selectedDivision.toLowerCase();

        return matchesSearch && matchesDiv;

      })

      .sort((a, b) => (b?.xp || 0) - (a?.xp || 0));

  }, [registeredList, searchQuery, selectedDivision]);



  // Handle student registration toggle

  const handleToggleRegistration = () => {

    const userXp = userProgress?.user?.totalXp || 500;

    const userStreak = userProgress?.user?.streakDays || 3;



    if (isRegistered) {

      unregisterCurrentStudent(currentUser);

      setCelebrationMessage("You have unregistered from this Sunday's Arena.");

    } else {

      registerCurrentStudent(currentUser, userXp, userStreak);

      setCelebrationMessage("✓ Arena Pass Confirmed! You are officially registered for Sunday's battle.");



      // Visual flash animation

      gsap.fromTo(

        ".contest-reg-card",

        { scale: 0.96, boxShadow: "0 0 50px rgba(168, 85, 247, 0.8)" },

        { scale: 1, boxShadow: "0 0 20px rgba(168, 85, 247, 0.2)", duration: 0.6 }

      );

    }



    setContestState(loadContestState());

    setTimeout(() => setCelebrationMessage(null), 4000);

  };



  // Change stage simulator

  const handleStageChange = (newStage) => {

    const nextState = { ...contestState, stageOverride: newStage };

    setContestState(nextState);

    saveContestState(nextState);

  };



  // Simulate claiming a medal and viewing certificate

  const handleClaimMedal = (medalType, rank) => {

    const awarded = awardStudentMedal({

      user: currentUser,

      medalType,

      rank,

      edition: contestState.edition || "#42",

      score: medalType === "gold" ? "995 / 1000" : medalType === "silver" ? "940 / 1000" : "890 / 1000",

      totalParticipants: totalCompetitors,

    });

    setCertificateMedal(awarded);

  };



  // Called when all 6 story chapters are completed in ContestStoryArena

  const handleContestFinish = ({ totalScore, elapsedSeconds, wrongAttempts }) => {

    const rank = totalScore >= 1200 ? 1 : totalScore >= 800 ? 2 : 3;

    const medalType = rank === 1 ? "gold" : rank === 2 ? "silver" : "bronze";



    const awarded = awardStudentMedal({

      user: currentUser,

      medalType,

      rank,

      edition: contestState.edition || "#42",

      score: `${totalScore} / 1700`,

      totalParticipants: totalCompetitors,

    });



    setCelebrationMessage(

      `🎉 MISSION COMPLETE! You cleared all 6 Citadel chapters with ${totalScore} PTS! Awarded ${medalType.toUpperCase()} Medal!`

    );

    setActiveTab("podium");

    setCertificateMedal(awarded);

  };



  // Auto-switch to arena tab when Sunday live mode is active

  useEffect(() => {

    if (effectiveStage === "live" && isRegistered) {

      setActiveTab("arena");

    }

  }, [effectiveStage, isRegistered]);



  // GSAP Animations

  useLayoutEffect(() => {

    if (heroRef.current) {

      gsap.fromTo(

        heroRef.current.querySelectorAll(".stagger-in"),

        { opacity: 0, y: 25 },

        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }

      );

    }

  }, []);



  // Cinematic page choreography
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".wc-reveal",
        { opacity: 0, y: 28, scale: 0.985 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.07, ease: "power3.out" }
      );

      gsap.to(".wc-orbit-ring-a", {
        rotation: 360,
        duration: 24,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".wc-orbit-ring-b", {
        rotation: -360,
        duration: 34,
        repeat: -1,
        ease: "none",
      });

      gsap.to(".wc-scan-beam", {
        yPercent: 900,
        duration: 5.5,
        repeat: -1,
        ease: "none",
      });
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    gsap.fromTo(
      ".wc-tab-content",
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }
    );
  }, [activeTab]);

  const stageLabel =
    effectiveStage === "live"
      ? "LIVE COMBAT WINDOW"
      : effectiveStage === "concluded"
        ? "ARENA ARCHIVED"
        : "REGISTRATION WINDOW";

  const stageAccent =
    effectiveStage === "live"
      ? "#22c55e"
      : effectiveStage === "concluded"
        ? "#fbbf24"
        : "#a855f7";

  const tabs = [
    { id: "roster", label: "Contenders", Icon: Users },
    { id: "arena", label: "Story Arena", Icon: Swords },
    { id: "podium", label: "Podium", Icon: Trophy },
    { id: "rules", label: "Protocols", Icon: ShieldCheck },
  ];

  return (
    <HubLayout title="Weekly Contest">
      <style>{String.raw`
        .wc-shell {
          --wc-accent: #a855f7;
          --wc-accent-rgb: 168, 85, 247;
          --wc-cyan: #38bdf8;
          --wc-green: #34d399;
          --wc-gold: #fbbf24;
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          color: #eef2ff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .wc-shell.stage-live {
          --wc-accent: #22c55e;
          --wc-accent-rgb: 34, 197, 94;
        }

        .wc-shell.stage-concluded {
          --wc-accent: #fbbf24;
          --wc-accent-rgb: 251, 191, 36;
        }

        .wc-cosmos {
          position: fixed;
          inset: 0;
          z-index: -4;
          pointer-events: none;
          overflow: hidden;
          background:
            radial-gradient(circle at 13% 12%, rgba(var(--wc-accent-rgb), .12), transparent 24%),
            radial-gradient(circle at 88% 18%, rgba(56, 189, 248, .09), transparent 24%),
            radial-gradient(circle at 72% 84%, rgba(99, 102, 241, .08), transparent 25%),
            linear-gradient(135deg, #030611 0%, #050916 45%, #03050c 100%);
        }

        .wc-cosmos::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: .24;
          background-image:
            linear-gradient(rgba(148, 163, 184, .06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, .06) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, black, transparent 88%);
          transform: perspective(650px) rotateX(60deg) scale(1.4) translateY(20%);
          transform-origin: center bottom;
        }

        .wc-cosmos::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(255,255,255,.52) 0 1px, transparent 1.25px);
          background-size: 53px 53px;
          opacity: .12;
        }

        .wc-ambient-orb {
          position: absolute;
          border-radius: 999px;
          filter: blur(70px);
          opacity: .22;
          animation: wcFloatOrb 12s ease-in-out infinite alternate;
        }

        .wc-ambient-orb.one {
          width: 360px;
          height: 360px;
          top: 9%;
          left: -110px;
          background: rgba(var(--wc-accent-rgb), .46);
        }

        .wc-ambient-orb.two {
          width: 300px;
          height: 300px;
          right: -90px;
          top: 42%;
          background: rgba(56, 189, 248, .3);
          animation-delay: -5s;
        }

        .wc-layout {
          position: relative;
          max-width: 1540px;
          margin: 0 auto;
          padding: 6px 0 80px;
        }

        .wc-glass {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(148, 163, 184, .14);
          background:
            linear-gradient(145deg, rgba(15, 23, 42, .78), rgba(5, 9, 21, .86));
          box-shadow:
            0 26px 70px rgba(0, 0, 0, .38),
            inset 0 1px rgba(255, 255, 255, .035);
          backdrop-filter: blur(18px);
        }

        .wc-glass::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(120deg, transparent 0 30%, rgba(255,255,255,.035) 48%, transparent 65%);
          transform: translateX(-90%);
          transition: transform .8s ease;
        }

        .wc-glass:hover::before { transform: translateX(90%); }

        .wc-devbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 10px 14px;
          margin-bottom: 18px;
          border-radius: 16px;
          background: rgba(3, 7, 18, .72);
          border: 1px solid rgba(148, 163, 184, .12);
        }

        .wc-devbar-label {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .06em;
        }

        .wc-devbar-label strong { color: #e2e8f0; }

        .wc-sim-controls {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .wc-sim-btn {
          border: 1px solid rgba(148, 163, 184, .14);
          border-radius: 9px;
          padding: 6px 10px;
          background: rgba(15, 23, 42, .8);
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s ease;
        }

        .wc-sim-btn:hover,
        .wc-sim-btn.active {
          color: white;
          border-color: rgba(var(--wc-accent-rgb), .58);
          background: rgba(var(--wc-accent-rgb), .13);
          box-shadow: 0 0 24px rgba(var(--wc-accent-rgb), .13);
        }

        .wc-toast {
          position: relative;
          z-index: 8;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          margin-bottom: 18px;
          border-radius: 14px;
          color: #a7f3d0;
          border: 1px solid rgba(52, 211, 153, .34);
          background: linear-gradient(90deg, rgba(16, 185, 129, .14), rgba(6, 182, 212, .08));
          box-shadow: 0 10px 40px rgba(16, 185, 129, .1);
          font-size: 13px;
          font-weight: 700;
        }

        .wc-hero {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(430px, .95fr);
          gap: 22px;
          margin-bottom: 22px;
          min-height: 510px;
        }

        .wc-hero-copy {
          border-radius: 28px;
          padding: 38px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 510px;
        }

        .wc-hero-copy::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          left: -120px;
          top: -140px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(var(--wc-accent-rgb), .2), transparent 68%);
          pointer-events: none;
        }

        .wc-eyebrow {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          padding: 7px 12px;
          margin-bottom: 20px;
          border: 1px solid rgba(var(--wc-accent-rgb), .34);
          border-radius: 999px;
          background: rgba(var(--wc-accent-rgb), .08);
          color: var(--wc-accent);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .15em;
          text-transform: uppercase;
          box-shadow: 0 0 30px rgba(var(--wc-accent-rgb), .08);
        }

        .wc-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 12px currentColor;
          animation: wcPulse 1.5s ease-in-out infinite;
        }

        .wc-kicker {
          margin: 0 0 8px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .wc-title {
          position: relative;
          z-index: 2;
          max-width: 820px;
          margin: 0;
          font-size: clamp(38px, 5vw, 72px);
          line-height: .98;
          letter-spacing: -.05em;
          font-weight: 950;
          color: #fff;
          text-wrap: balance;
          text-shadow: 0 12px 40px rgba(0,0,0,.5);
        }

        .wc-title span {
          display: block;
          margin-top: 8px;
          font-size: .52em;
          letter-spacing: -.025em;
          background: linear-gradient(90deg, var(--wc-accent), #38bdf8 50%, #e879f9);
          -webkit-background-clip: text;
          color: transparent;
          filter: drop-shadow(0 0 14px rgba(var(--wc-accent-rgb), .2));
        }

        .wc-intro {
          max-width: 730px;
          margin: 20px 0 26px;
          color: #9aa9be;
          font-size: 14px;
          line-height: 1.8;
        }

        .wc-intro strong { color: #f8fafc; }

        .wc-countdown {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 9px;
          padding: 10px;
          border: 1px solid rgba(148,163,184,.1);
          border-radius: 18px;
          background: rgba(2,6,23,.56);
          box-shadow: inset 0 0 30px rgba(0,0,0,.25);
        }

        .wc-timecell {
          position: relative;
          padding: 14px 10px 12px;
          text-align: center;
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(30,41,59,.48), rgba(8,12,26,.35));
          overflow: hidden;
        }

        .wc-timecell::before {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--wc-accent), transparent);
          opacity: .65;
        }

        .wc-timevalue {
          display: block;
          font-family: "SFMono-Regular", Consolas, monospace;
          color: #f8fafc;
          font-size: 27px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -.03em;
          text-shadow: 0 0 18px rgba(var(--wc-accent-rgb), .24);
        }

        .wc-timelabel {
          display: block;
          margin-top: 7px;
          color: #526176;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .18em;
        }

        .wc-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 20px;
        }

        .wc-primary-btn,
        .wc-secondary-btn,
        .wc-card-btn {
          appearance: none;
          border: 0;
          cursor: pointer;
          transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
          font: inherit;
        }

        .wc-primary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 47px;
          padding: 0 22px;
          border-radius: 13px;
          background: linear-gradient(135deg, var(--wc-accent), #6366f1);
          color: white;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 12px 32px rgba(var(--wc-accent-rgb), .28), inset 0 1px rgba(255,255,255,.16);
        }

        .stage-live .wc-primary-btn { background: linear-gradient(135deg, #22c55e, #059669); }
        .stage-concluded .wc-primary-btn { background: linear-gradient(135deg, #fbbf24, #d97706); color: #111827; }

        .wc-primary-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 38px rgba(var(--wc-accent-rgb), .4); }

        .wc-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 47px;
          padding: 0 18px;
          border: 1px solid rgba(148,163,184,.16);
          border-radius: 13px;
          background: rgba(15,23,42,.58);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 800;
        }

        .wc-secondary-btn:hover { transform: translateY(-2px); border-color: rgba(var(--wc-accent-rgb), .5); }

        .wc-action-note {
          color: #64748b;
          font-size: 11px;
          line-height: 1.5;
        }

        .wc-visual {
          position: relative;
          min-height: 510px;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid rgba(var(--wc-accent-rgb), .22);
          background: linear-gradient(160deg, rgba(6, 10, 24, .92), rgba(3, 5, 13, .98));
          box-shadow: 0 30px 80px rgba(0,0,0,.52), 0 0 60px rgba(var(--wc-accent-rgb), .08);
        }

        .wc-visual > div:not(.wc-visual-overlay):not(.wc-orbit-ring-a):not(.wc-orbit-ring-b):not(.wc-scan-beam) {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        .wc-visual canvas { width: 100% !important; height: 100% !important; display: block; }

        .wc-visual-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 4;
          background:
            linear-gradient(to bottom, rgba(2,6,23,.02), rgba(2,6,23,.42)),
            radial-gradient(circle at 50% 50%, transparent 35%, rgba(2,6,23,.54) 100%);
        }

        .wc-hud-top,
        .wc-hud-bottom {
          position: absolute;
          left: 18px;
          right: 18px;
          z-index: 6;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          pointer-events: none;
          font-family: "SFMono-Regular", Consolas, monospace;
          color: #93a4b8;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .wc-hud-top { top: 17px; }
        .wc-hud-bottom { bottom: 17px; }

        .wc-hud-chip {
          padding: 6px 9px;
          border-radius: 8px;
          border: 1px solid rgba(148,163,184,.14);
          background: rgba(3,7,18,.64);
          backdrop-filter: blur(8px);
        }

        .wc-hud-chip strong { color: var(--wc-accent); }

        .wc-corner {
          position: absolute;
          z-index: 6;
          width: 34px;
          height: 34px;
          pointer-events: none;
        }

        .wc-corner.tl { top: 13px; left: 13px; border-top: 2px solid var(--wc-accent); border-left: 2px solid var(--wc-accent); }
        .wc-corner.tr { top: 13px; right: 13px; border-top: 2px solid var(--wc-accent); border-right: 2px solid var(--wc-accent); }
        .wc-corner.bl { bottom: 13px; left: 13px; border-bottom: 2px solid var(--wc-accent); border-left: 2px solid var(--wc-accent); }
        .wc-corner.br { bottom: 13px; right: 13px; border-bottom: 2px solid var(--wc-accent); border-right: 2px solid var(--wc-accent); }

        .wc-orbit-ring-a,
        .wc-orbit-ring-b {
          position: absolute;
          z-index: 3;
          left: 50%;
          top: 50%;
          border-radius: 50%;
          pointer-events: none;
          transform-origin: center;
        }

        .wc-orbit-ring-a {
          width: 74%;
          aspect-ratio: 1;
          margin: -37% 0 0 -37%;
          border: 1px dashed rgba(var(--wc-accent-rgb), .24);
        }

        .wc-orbit-ring-b {
          width: 58%;
          aspect-ratio: 1;
          margin: -29% 0 0 -29%;
          border: 1px solid rgba(56,189,248,.12);
        }

        .wc-orbit-ring-a::before,
        .wc-orbit-ring-b::before {
          content: "";
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--wc-accent);
          box-shadow: 0 0 16px var(--wc-accent);
          left: 50%;
          top: -4px;
        }

        .wc-scan-beam {
          position: absolute;
          z-index: 5;
          top: 0;
          left: 5%;
          right: 5%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(56,189,248,.7), transparent);
          box-shadow: 0 0 18px rgba(56,189,248,.45);
          pointer-events: none;
        }

        .wc-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0,1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        .wc-stat {
          position: relative;
          overflow: hidden;
          min-height: 116px;
          padding: 18px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid rgba(148,163,184,.11);
          background: linear-gradient(145deg, rgba(15,23,42,.66), rgba(5,9,21,.78));
          box-shadow: 0 15px 40px rgba(0,0,0,.18);
          transition: transform .25s ease, border-color .25s ease;
        }

        .wc-stat:hover { transform: translateY(-4px); border-color: rgba(var(--wc-accent-rgb), .34); }

        .wc-stat::after {
          content: "";
          position: absolute;
          inset: auto 0 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--stat-color, var(--wc-accent)), transparent);
          opacity: .65;
        }

        .wc-stat-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          color: var(--stat-color, var(--wc-accent));
          background: color-mix(in srgb, var(--stat-color, var(--wc-accent)) 13%, transparent);
          border: 1px solid color-mix(in srgb, var(--stat-color, var(--wc-accent)) 22%, transparent);
          box-shadow: 0 0 22px color-mix(in srgb, var(--stat-color, var(--wc-accent)) 12%, transparent);
        }

        .wc-stat-value {
          color: #f8fafc;
          font-size: 19px;
          font-weight: 900;
          letter-spacing: -.02em;
        }

        .wc-stat-label {
          margin-top: 4px;
          color: #66758b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .wc-nav {
          position: sticky;
          top: 8px;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 9px;
          margin-bottom: 18px;
          border-radius: 18px;
          border: 1px solid rgba(148,163,184,.12);
          background: rgba(3,7,18,.82);
          backdrop-filter: blur(18px);
          box-shadow: 0 16px 45px rgba(0,0,0,.28);
        }

        .wc-tabs {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .wc-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 14px;
          border: 1px solid transparent;
          border-radius: 11px;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
          transition: .2s ease;
        }

        .wc-tab:hover { color: #cbd5e1; background: rgba(148,163,184,.06); }

        .wc-tab.active {
          color: #fff;
          background: rgba(var(--wc-accent-rgb), .13);
          border-color: rgba(var(--wc-accent-rgb), .26);
          box-shadow: inset 0 0 22px rgba(var(--wc-accent-rgb), .06);
        }

        .wc-tab.active::after {
          content: "";
          position: absolute;
          left: 16%;
          right: 16%;
          bottom: -10px;
          height: 2px;
          background: var(--wc-accent);
          box-shadow: 0 0 12px var(--wc-accent);
        }

        .wc-nav-status {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-right: 8px;
          color: #64748b;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: .1em;
        }

        .wc-nav-status b { color: var(--wc-accent); }

        .wc-panel {
          position: relative;
          border-radius: 24px;
          padding: 24px;
          border: 1px solid rgba(148,163,184,.11);
          background: linear-gradient(145deg, rgba(10,15,30,.72), rgba(4,7,16,.82));
          box-shadow: 0 22px 60px rgba(0,0,0,.25);
        }

        .wc-section-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .wc-section-kicker {
          color: var(--wc-accent);
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .wc-section-title {
          margin: 5px 0 0;
          color: #f8fafc;
          font-size: 24px;
          font-weight: 900;
          letter-spacing: -.03em;
        }

        .wc-section-sub {
          margin-top: 7px;
          color: #728197;
          font-size: 12px;
          line-height: 1.6;
        }

        .wc-tools {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .wc-searchbox {
          position: relative;
          min-width: 240px;
        }

        .wc-searchbox svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #526176;
        }

        .wc-input,
        .wc-select {
          width: 100%;
          height: 40px;
          border: 1px solid rgba(148,163,184,.13);
          border-radius: 11px;
          outline: none;
          background: rgba(2,6,23,.68);
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 700;
          transition: .2s ease;
        }

        .wc-input { padding: 0 13px 0 36px; }
        .wc-select { width: auto; min-width: 150px; padding: 0 11px; }
        .wc-input:focus, .wc-select:focus { border-color: rgba(var(--wc-accent-rgb), .5); box-shadow: 0 0 0 3px rgba(var(--wc-accent-rgb), .07); }

        .wc-roster-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 12px;
        }

        .wc-contender {
          --division: #8b5cf6;
          position: relative;
          min-height: 196px;
          padding: 17px;
          border-radius: 17px;
          border: 1px solid rgba(148,163,184,.1);
          background:
            radial-gradient(circle at 100% 0, color-mix(in srgb, var(--division) 11%, transparent), transparent 42%),
            linear-gradient(145deg, rgba(15,23,42,.72), rgba(5,9,21,.76));
          overflow: hidden;
          transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
        }

        .wc-contender:hover {
          transform: translateY(-5px);
          border-color: color-mix(in srgb, var(--division) 42%, transparent);
          box-shadow: 0 18px 40px rgba(0,0,0,.28), 0 0 28px color-mix(in srgb, var(--division) 10%, transparent);
        }

        .wc-contender.me {
          border-color: rgba(168,85,247,.46);
          box-shadow: inset 0 0 38px rgba(168,85,247,.06), 0 0 28px rgba(168,85,247,.09);
        }

        .wc-contender-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .wc-profile {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .wc-avatar {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 13px;
          border: 1px solid color-mix(in srgb, var(--division) 52%, transparent);
          background: rgba(15,23,42,.8);
          color: #e2e8f0;
          font-weight: 900;
          box-shadow: 0 0 20px color-mix(in srgb, var(--division) 10%, transparent);
        }

        .wc-avatar img { width: 100%; height: 100%; object-fit: cover; }

        .wc-name {
          color: #f8fafc;
          font-size: 14px;
          font-weight: 850;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wc-handle { margin-top: 3px; color: #526176; font-size: 10px; }

        .wc-you {
          display: inline-flex;
          margin-left: 6px;
          padding: 2px 5px;
          border-radius: 4px;
          background: #a855f7;
          color: white;
          font-size: 7px;
          font-weight: 900;
          vertical-align: middle;
        }

        .wc-rank {
          flex: 0 0 auto;
          min-width: 44px;
          padding: 6px 8px;
          border-radius: 9px;
          text-align: center;
          border: 1px solid rgba(148,163,184,.12);
          background: rgba(2,6,23,.46);
          color: #94a3b8;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 10px;
          font-weight: 900;
        }

        .wc-rank.top1 { color: #fde047; border-color: rgba(251,191,36,.34); background: rgba(251,191,36,.09); }
        .wc-rank.top2 { color: #e2e8f0; border-color: rgba(203,213,225,.25); }
        .wc-rank.top3 { color: #fdba74; border-color: rgba(249,115,22,.28); background: rgba(249,115,22,.07); }

        .wc-badges {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
          margin: 16px 0;
        }

        .wc-division-badge,
        .wc-confirmed {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 7px;
          font-size: 9px;
          font-weight: 850;
        }

        .wc-division-badge {
          color: var(--division);
          background: color-mix(in srgb, var(--division) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--division) 24%, transparent);
        }

        .wc-confirmed { color: #6ee7b7; background: rgba(16,185,129,.07); border: 1px solid rgba(16,185,129,.14); }

        .wc-contender-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(148,163,184,.08);
        }

        .wc-xp {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #fde047;
          font-size: 12px;
          font-weight: 900;
        }

        .wc-streak {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #fb923c;
          font-size: 10px;
          font-weight: 800;
        }

        .wc-empty {
          grid-column: 1/-1;
          padding: 50px 20px;
          text-align: center;
          color: #64748b;
          border: 1px dashed rgba(148,163,184,.14);
          border-radius: 16px;
        }

        .wc-vault {
          position: relative;
          overflow: hidden;
          padding: 36px 30px 30px;
          border-radius: 24px;
          text-align: center;
          border: 1px solid rgba(var(--wc-accent-rgb), .22);
          background:
            radial-gradient(circle at 50% 0%, rgba(var(--wc-accent-rgb), .13), transparent 34%),
            linear-gradient(145deg, rgba(9,14,30,.9), rgba(3,6,14,.95));
          box-shadow: 0 28px 70px rgba(0,0,0,.38), inset 0 0 80px rgba(var(--wc-accent-rgb), .025);
        }

        .wc-vault-emblem {
          position: relative;
          width: 108px;
          height: 108px;
          margin: 0 auto 22px;
          display: grid;
          place-items: center;
        }

        .wc-vault-emblem::before,
        .wc-vault-emblem::after {
          content: "";
          position: absolute;
          border-radius: 50%;
          border: 1px dashed rgba(var(--wc-accent-rgb), .38);
          animation: wcSpin 14s linear infinite;
        }

        .wc-vault-emblem::before { inset: 0; }
        .wc-vault-emblem::after { inset: 13px; animation-direction: reverse; animation-duration: 9s; }

        .wc-lock-core {
          width: 66px;
          height: 66px;
          display: grid;
          place-items: center;
          border-radius: 20px;
          color: var(--wc-accent);
          border: 1px solid rgba(var(--wc-accent-rgb), .55);
          background: rgba(var(--wc-accent-rgb), .09);
          box-shadow: 0 0 35px rgba(var(--wc-accent-rgb), .2), inset 0 0 18px rgba(var(--wc-accent-rgb), .06);
        }

        .wc-vault-title {
          margin: 5px 0 8px;
          color: #f8fafc;
          font-size: clamp(25px, 4vw, 38px);
          font-weight: 950;
          letter-spacing: -.035em;
        }

        .wc-vault-copy {
          max-width: 700px;
          margin: 0 auto 24px;
          color: #7f8ea3;
          font-size: 12px;
          line-height: 1.8;
        }

        .wc-pass-banner {
          max-width: 660px;
          margin: 0 auto 26px;
          padding: 13px 15px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
          border: 1px solid rgba(148,163,184,.11);
          background: rgba(2,6,23,.54);
        }

        .wc-pass-banner.ready { border-color: rgba(52,211,153,.24); background: rgba(16,185,129,.055); }
        .wc-pass-title { color: #e2e8f0; font-size: 11px; font-weight: 900; }
        .wc-pass-copy { margin-top: 3px; color: #64748b; font-size: 10px; }

        .wc-sectors {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 10px;
          max-width: 1020px;
          margin: 0 auto;
          text-align: left;
        }

        .wc-sector {
          position: relative;
          min-height: 108px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(148,163,184,.09);
          background: linear-gradient(145deg, rgba(15,23,42,.52), rgba(3,7,18,.58));
          overflow: hidden;
        }

        .wc-sector::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 2px;
          background: var(--sector-color, var(--wc-accent));
          opacity: .35;
        }

        .wc-sector-num { color: var(--sector-color, var(--wc-accent)); font-size: 8px; font-weight: 900; letter-spacing: .14em; }
        .wc-sector-title { margin-top: 7px; color: #dbe4f0; font-size: 11px; font-weight: 850; }
        .wc-sector-meta { margin-top: 6px; color: #56657a; font-size: 9px; }
        .wc-sector-lock { position: absolute; right: 12px; bottom: 12px; color: #3f4d61; }

        .wc-dev-shortcut {
          max-width: 1020px;
          margin: 12px auto 0;
          padding: 12px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          text-align: left;
          background: rgba(2,6,23,.68);
          border: 1px solid rgba(56,189,248,.1);
          color: #64748b;
          font-size: 10px;
        }

        .wc-live-gate {
          padding: 48px 26px;
          border-radius: 24px;
          text-align: center;
          border: 1px solid rgba(34,197,94,.34);
          background:
            radial-gradient(circle at 50% 0, rgba(34,197,94,.16), transparent 34%),
            linear-gradient(145deg, rgba(6,24,18,.78), rgba(3,7,18,.96));
          box-shadow: 0 0 60px rgba(34,197,94,.09);
        }

        .wc-live-gate-icon {
          width: 82px;
          height: 82px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          border-radius: 24px;
          color: #4ade80;
          border: 1px solid rgba(74,222,128,.34);
          background: rgba(34,197,94,.08);
          box-shadow: 0 0 34px rgba(34,197,94,.13);
          animation: wcPulseSoft 2s ease-in-out infinite;
        }

        .wc-arena-wrap {
          border-radius: 22px;
          overflow: hidden;
          border: 1px solid rgba(var(--wc-accent-rgb), .14);
          background: rgba(2,6,23,.34);
          box-shadow: 0 24px 70px rgba(0,0,0,.28);
        }

        .wc-podium-stage {
          position: relative;
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 16px;
          align-items: end;
          padding: 34px 10px 10px;
          overflow: hidden;
        }

        .wc-podium-stage::before {
          content: "";
          position: absolute;
          left: 10%;
          right: 10%;
          bottom: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,.65), transparent);
          box-shadow: 0 0 30px rgba(251,191,36,.28);
        }

        .wc-medal-card {
          position: relative;
          padding: 24px 18px 18px;
          border-radius: 22px 22px 10px 10px;
          text-align: center;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--medal) 28%, transparent);
          background:
            radial-gradient(circle at 50% 0, color-mix(in srgb, var(--medal) 12%, transparent), transparent 42%),
            linear-gradient(180deg, rgba(15,23,42,.78), rgba(4,7,16,.94));
          box-shadow: 0 20px 50px rgba(0,0,0,.3);
          min-height: 290px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform .25s ease, box-shadow .25s ease;
        }

        .wc-medal-card:hover { transform: translateY(-6px); box-shadow: 0 26px 60px rgba(0,0,0,.38), 0 0 35px color-mix(in srgb, var(--medal) 10%, transparent); }
        .wc-medal-card.gold { min-height: 350px; transform: translateY(-16px); }
        .wc-medal-card.gold:hover { transform: translateY(-22px); }

        .wc-medal-glow {
          position: absolute;
          width: 170px;
          height: 170px;
          border-radius: 50%;
          left: 50%;
          top: -95px;
          transform: translateX(-50%);
          background: var(--medal);
          filter: blur(60px);
          opacity: .13;
        }

        .wc-medal-emoji { font-size: 48px; filter: drop-shadow(0 10px 18px rgba(0,0,0,.35)); }
        .wc-medal-label { margin-top: 7px; color: var(--medal); font-size: 10px; font-weight: 950; letter-spacing: .13em; }
        .wc-medal-name { margin-top: 18px; color: white; font-size: 15px; font-weight: 900; }
        .wc-medal-score { margin-top: 5px; color: #75849a; font-size: 10px; }

        .wc-card-btn {
          width: 100%;
          min-height: 39px;
          margin-top: 18px;
          border-radius: 10px;
          border: 1px solid color-mix(in srgb, var(--medal) 26%, transparent);
          background: color-mix(in srgb, var(--medal) 9%, rgba(2,6,23,.82));
          color: color-mix(in srgb, var(--medal) 80%, white);
          font-size: 10px;
          font-weight: 900;
        }

        .wc-card-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--medal) 12%, transparent); }

        .wc-rules-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0,1fr));
          gap: 12px;
        }

        .wc-rule {
          position: relative;
          min-height: 230px;
          padding: 20px;
          border-radius: 17px;
          border: 1px solid rgba(148,163,184,.1);
          background: linear-gradient(145deg, rgba(15,23,42,.64), rgba(4,7,16,.76));
          overflow: hidden;
        }

        .wc-rule-index {
          color: var(--rule-color, var(--wc-accent));
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .wc-rule-icon {
          width: 44px;
          height: 44px;
          margin: 20px 0 18px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: var(--rule-color, var(--wc-accent));
          background: color-mix(in srgb, var(--rule-color, var(--wc-accent)) 9%, transparent);
          border: 1px solid color-mix(in srgb, var(--rule-color, var(--wc-accent)) 20%, transparent);
        }

        .wc-rule-title { color: #f8fafc; font-size: 13px; font-weight: 900; }
        .wc-rule-copy { margin-top: 8px; color: #748398; font-size: 11px; line-height: 1.75; }

        .wc-honor {
          margin-top: 12px;
          padding: 17px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          gap: 13px;
          color: #a5b4fc;
          border: 1px solid rgba(99,102,241,.18);
          background: rgba(99,102,241,.055);
          font-size: 11px;
          line-height: 1.65;
        }

        .wc-footer-signal {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-top: 22px;
          color: #3f4d61;
          font-family: "SFMono-Regular", Consolas, monospace;
          font-size: 8px;
          font-weight: 800;
          letter-spacing: .16em;
        }

        .wc-footer-signal::before,
        .wc-footer-signal::after {
          content: "";
          width: 70px;
          height: 1px;
          background: linear-gradient(90deg, transparent, #273449);
        }

        @keyframes wcFloatOrb {
          from { transform: translate3d(0,0,0) scale(1); }
          to { transform: translate3d(34px,28px,0) scale(1.08); }
        }

        @keyframes wcPulse {
          0%,100% { opacity: .45; transform: scale(.82); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes wcPulseSoft {
          0%,100% { transform: scale(1); box-shadow: 0 0 28px rgba(34,197,94,.1); }
          50% { transform: scale(1.035); box-shadow: 0 0 46px rgba(34,197,94,.2); }
        }

        @keyframes wcSpin { to { transform: rotate(360deg); } }

        @media (max-width: 1180px) {
          .wc-hero { grid-template-columns: 1fr; }
          .wc-visual { min-height: 430px; }
          .wc-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .wc-sectors { grid-template-columns: repeat(2, minmax(0,1fr)); }
        }

        @media (max-width: 820px) {
          .wc-layout { padding-bottom: 48px; }
          .wc-devbar { align-items: flex-start; flex-direction: column; }
          .wc-hero-copy { padding: 25px; min-height: auto; }
          .wc-title { font-size: clamp(36px, 11vw, 58px); }
          .wc-nav { position: relative; top: auto; align-items: flex-start; flex-direction: column; }
          .wc-nav-status { padding: 0 8px 4px; }
          .wc-section-head { align-items: flex-start; flex-direction: column; }
          .wc-tools { width: 100%; }
          .wc-searchbox { min-width: 0; flex: 1 1 220px; }
          .wc-podium-stage { grid-template-columns: 1fr; padding-top: 10px; }
          .wc-medal-card.gold { transform: none; min-height: 300px; }
          .wc-medal-card.gold:hover { transform: translateY(-6px); }
          .wc-rules-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 620px) {
          .wc-stats { grid-template-columns: 1fr; }
          .wc-countdown { grid-template-columns: repeat(2, minmax(0,1fr)); }
          .wc-visual { min-height: 360px; }
          .wc-panel { padding: 15px; }
          .wc-sectors { grid-template-columns: 1fr; }
          .wc-vault { padding: 30px 16px 20px; }
          .wc-pass-banner, .wc-dev-shortcut { align-items: flex-start; flex-direction: column; }
          .wc-tabs { width: 100%; display: grid; grid-template-columns: repeat(2,1fr); }
          .wc-tab { justify-content: center; }
          .wc-tab.active::after { display: none; }
          .wc-nav-status { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .wc-shell *, .wc-shell *::before, .wc-shell *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className={`wc-shell stage-${effectiveStage}`}>
        <div className="wc-cosmos">
          <div className="wc-ambient-orb one" />
          <div className="wc-ambient-orb two" />
        </div>

        <div className="wc-layout">
          <div className="wc-devbar wc-reveal">
            <div className="wc-devbar-label">
              <Sparkles size={14} color="#fbbf24" />
              <span><strong>ARENA SIMULATOR</strong> // evaluator controls</span>
            </div>
            <div className="wc-sim-controls">
              {[
                ["auto", "AUTO"],
                ["registration", "COUNTDOWN"],
                ["live", "LIVE"],
                ["concluded", "PODIUM"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStageChange(value)}
                  className={`wc-sim-btn ${contestState.stageOverride === value ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {celebrationMessage && (
            <div className="wc-toast">
              <CheckCircle2 size={17} />
              <span>{celebrationMessage}</span>
            </div>
          )}

          <section ref={heroRef} className="wc-hero">
            <div className="wc-hero-copy wc-glass wc-reveal">
              <div>
                <div className="wc-eyebrow stagger-in">
                  <span className="wc-live-dot" />
                  {stageLabel}
                </div>

                <div className="wc-kicker stagger-in">
                  CODELAND // SUNDAY CHAMPIONSHIP PROTOCOL
                </div>

                <h1 className="wc-title stagger-in">
                  {contestState.title || "Operation Citadel"}
                  <span>Enter the Algorithmic Battleground</span>
                </h1>

                <p className="wc-intro stagger-in">
                  The weekly arena where CodeLand contenders enter under strict time pressure,
                  breach six algorithmic sectors, climb the live standings, and fight for
                  <strong> Gold, Silver, and Bronze distinction.</strong>
                </p>

                <div className="wc-countdown stagger-in">
                  {[
                    { label: "DAYS", val: countdown.days },
                    { label: "HOURS", val: String(countdown.hours).padStart(2, "0") },
                    { label: "MINS", val: String(countdown.minutes).padStart(2, "0") },
                    { label: "SECS", val: String(countdown.seconds).padStart(2, "0") },
                  ].map((item) => (
                    <div className="wc-timecell" key={item.label}>
                      <span className="wc-timevalue">{item.val}</span>
                      <span className="wc-timelabel">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wc-actions stagger-in">
                <button type="button" className="wc-primary-btn" onClick={handleToggleRegistration}>
                  {isRegistered ? <UserCheck size={17} /> : <UserPlus size={17} />}
                  {isRegistered ? "Arena Pass Active" : "Register for Sunday Arena"}
                </button>

                {effectiveStage === "concluded" && (
                  <button
                    type="button"
                    className="wc-secondary-btn"
                    onClick={() => handleClaimMedal("gold", 1)}
                  >
                    <Printer size={16} /> Open Certificate Vault
                  </button>
                )}

                <div className="wc-action-note">
                  {isRegistered
                    ? "Identity verified. Your combat slot is synchronized for Sunday."
                    : "Open to all CodeLand Academy students. One-click arena registration."}
                </div>
              </div>
            </div>

            <div className="wc-visual wc-reveal">
              <Arena3DScene stage={effectiveStage} />
              <div className="wc-visual-overlay" />
              <div className="wc-orbit-ring-a" />
              <div className="wc-orbit-ring-b" />
              <div className="wc-scan-beam" />
              <span className="wc-corner tl" />
              <span className="wc-corner tr" />
              <span className="wc-corner bl" />
              <span className="wc-corner br" />

              <div className="wc-hud-top">
                <span className="wc-hud-chip">CITADEL CORE // <strong>ONLINE</strong></span>
                <span className="wc-hud-chip">LATENCY 08MS</span>
              </div>
              <div className="wc-hud-bottom">
                <span className="wc-hud-chip">NODE 0x42 // AES-256</span>
                <span className="wc-hud-chip">STAGE // <strong>{effectiveStage.toUpperCase()}</strong></span>
              </div>
            </div>
          </section>

          <section className="wc-stats wc-reveal">
            {[
              { Icon: Users, color: "#c084fc", value: `${totalCompetitors} Students`, label: "Registered contenders" },
              { Icon: Zap, color: "#fbbf24", value: `${totalXpInArena.toLocaleString()} XP`, label: "Total contender XP pool" },
              { Icon: Trophy, color: "#38bdf8", value: `${avgXp.toLocaleString()} XP`, label: "Average arena XP" },
              { Icon: Calendar, color: "#34d399", value: "Every Sunday", label: "10:00 AM UTC // 2 hours" },
            ].map(({ Icon, color, value, label }) => (
              <div key={label} className="wc-stat" style={{ "--stat-color": color }}>
                <div className="wc-stat-icon"><Icon size={22} /></div>
                <div>
                  <div className="wc-stat-value">{value}</div>
                  <div className="wc-stat-label">{label}</div>
                </div>
              </div>
            ))}
          </section>

          <div className="wc-nav wc-reveal">
            <div className="wc-tabs">
              {tabs.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  className={`wc-tab ${activeTab === id ? "active" : ""}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={15} />
                  {label}
                  {id === "arena" && effectiveStage === "live" && (
                    <span style={{ color: "#4ade80", fontSize: 8, fontWeight: 900 }}>LIVE</span>
                  )}
                  {id === "arena" && effectiveStage !== "live" && <Lock size={10} />}
                </button>
              ))}
            </div>
            <div className="wc-nav-status">
              <span className="wc-live-dot" style={{ color: stageAccent }} />
              SYSTEM <b>{effectiveStage.toUpperCase()}</b>
            </div>
          </div>

          {activeTab === "roster" && (
            <section className="wc-panel wc-tab-content">
              <div className="wc-section-head">
                <div>
                  <div className="wc-section-kicker">CONTENDER DATABASE // LIVE INDEX</div>
                  <h2 className="wc-section-title">Arena Roster</h2>
                  <div className="wc-section-sub">
                    {filteredCompetitors.length} of {totalCompetitors} enrolled contenders // ranked by XP signal
                  </div>
                </div>

                <div className="wc-tools">
                  <div className="wc-searchbox">
                    <Search size={14} />
                    <input
                      className="wc-input"
                      type="text"
                      placeholder="Search contender..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select
                    className="wc-select"
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                  >
                    <option value="all">All Divisions</option>
                    <option value="grandmaster">Grandmaster</option>
                    <option value="master">Master</option>
                    <option value="challenger">Challenger</option>
                    <option value="rising star">Rising Star</option>
                  </select>
                </div>
              </div>

              <div ref={cardsGridRef} className="wc-roster-grid">
                {filteredCompetitors.length === 0 ? (
                  <div className="wc-empty">No contender signal matches your current filters.</div>
                ) : (
                  filteredCompetitors.map((student, idx) => {
                    const isMe =
                      student.id === currentUser?.id ||
                      student.isCurrentUser ||
                      student.email === currentUser?.email;
                    const initials = (student.name || "?")
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <article
                        key={student.id || `${student.name}-${idx}`}
                        className={`wc-contender ${isMe ? "me" : ""}`}
                        style={{ "--division": student.divisionColor || "#8b5cf6" }}
                      >
                        <div className="wc-contender-top">
                          <div className="wc-profile">
                            <div className="wc-avatar">
                              {student.avatar ? <img src={student.avatar} alt={student.name || "Contender"} /> : initials}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div className="wc-name">
                                {student.name || "Unnamed Contender"}
                                {isMe && <span className="wc-you">YOU</span>}
                              </div>
                              <div className="wc-handle">{student.handle || "@unknown"}</div>
                            </div>
                          </div>

                          <div className={`wc-rank ${idx === 0 ? "top1" : idx === 1 ? "top2" : idx === 2 ? "top3" : ""}`}>
                            #{idx + 1}
                          </div>
                        </div>

                        <div className="wc-badges">
                          <span className="wc-division-badge">{student.division || "Unranked"}</span>
                          <span className="wc-confirmed"><CheckCircle2 size={10} /> Confirmed</span>
                        </div>

                        <div className="wc-contender-bottom">
                          <div className="wc-xp"><Zap size={13} /> {(student.xp || 0).toLocaleString()} XP</div>
                          <div className="wc-streak"><Flame size={12} /> {student.streak || 3}d streak</div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {activeTab === "arena" && (
            <section className="wc-tab-content">
              {effectiveStage !== "live" ? (
                <div className="wc-vault">
                  <div className="wc-vault-emblem">
                    <div className="wc-lock-core"><Lock size={30} /></div>
                  </div>

                  <div className="wc-section-kicker">RESTRICTED ACCESS // SUNDAY PROTOCOL</div>
                  <h2 className="wc-vault-title">Operation Citadel is Sealed</h2>
                  <p className="wc-vault-copy">
                    Six containment sectors remain encrypted until the official Sunday combat window.
                    Pre-register now so your identity token is already synchronized when the core opens.
                  </p>

                  <div className={`wc-pass-banner ${isRegistered ? "ready" : ""}`}>
                    <div>
                      <div className="wc-pass-title">
                        {isRegistered ? "✓ ARENA PASS CONFIRMED" : "⚠ REGISTRATION TOKEN NOT FOUND"}
                      </div>
                      <div className="wc-pass-copy">
                        {isRegistered
                          ? "Your seat is secured. Sector 01 will unlock automatically when the arena goes live."
                          : "Register before Sunday to guarantee immediate entry when the countdown reaches zero."}
                      </div>
                    </div>
                    {!isRegistered && (
                      <button type="button" className="wc-primary-btn" onClick={handleToggleRegistration}>
                        <UserPlus size={15} /> Register
                      </button>
                    )}
                  </div>

                  <div className="wc-sectors">
                    {CONTEST_CHAPTERS.map((ch) => (
                      <div key={ch.id} className="wc-sector" style={{ "--sector-color": ch.difficultyColor || "#a855f7" }}>
                        <div className="wc-sector-num">SECTOR {String(ch.chapterNumber).padStart(2, "0")} // {ch.arabicTitle}</div>
                        <div className="wc-sector-title">{ch.title}</div>
                        <div className="wc-sector-meta">{ch.difficulty} · {ch.basePoints} PTS</div>
                        <Lock className="wc-sector-lock" size={14} />
                      </div>
                    ))}
                  </div>

                  <div className="wc-dev-shortcut">
                    <span><strong style={{ color: "#38bdf8" }}>EVALUATOR BYPASS:</strong> activate the live stage instantly for development/testing.</span>
                    <button
                      type="button"
                      className="wc-secondary-btn"
                      onClick={() => {
                        if (!isRegistered) registerCurrentStudent(currentUser);
                        handleStageChange("live");
                        setContestState(loadContestState());
                      }}
                    >
                      <Zap size={14} /> Unlock Live Arena
                    </button>
                  </div>
                </div>
              ) : !isRegistered ? (
                <div className="wc-live-gate">
                  <div className="wc-live-gate-icon"><Swords size={34} /></div>
                  <div className="wc-section-kicker" style={{ color: "#4ade80" }}>SUNDAY SIGNAL CONFIRMED</div>
                  <h2 className="wc-vault-title">The Arena Is Live</h2>
                  <p className="wc-vault-copy">
                    Operation Citadel has started. Activate your contender token now and enter Sector 01 immediately.
                  </p>
                  <button type="button" className="wc-primary-btn" onClick={handleToggleRegistration}>
                    <UserCheck size={16} /> Quick Register & Enter Sector 01
                  </button>
                </div>
              ) : (
                <div className="wc-arena-wrap">
                  <ContestStoryArena user={currentUser} onContestComplete={handleContestFinish} />
                </div>
              )}
            </section>
          )}

          {activeTab === "podium" && (
            <section className="wc-panel wc-tab-content">
              <div className="wc-section-head" style={{ justifyContent: "center", textAlign: "center" }}>
                <div>
                  <div className="wc-section-kicker" style={{ color: "#fbbf24" }}>HALL OF SUNDAY GLADIATORS</div>
                  <h2 className="wc-section-title">Championship Podium</h2>
                  <div className="wc-section-sub">Three signals remain when the Citadel closes. One becomes champion.</div>
                </div>
              </div>

              <div className="wc-podium-stage">
                <article className="wc-medal-card" style={{ "--medal": "#cbd5e1" }}>
                  <div className="wc-medal-glow" />
                  <div>
                    <div className="wc-medal-emoji">🥈</div>
                    <div className="wc-medal-label">SILVER // RANK 02</div>
                    <div className="wc-medal-name">Maya Lin</div>
                    <div className="wc-medal-score">+300 BONUS XP · 940 / 1000</div>
                  </div>
                  <button type="button" className="wc-card-btn" onClick={() => handleClaimMedal("silver", 2)}>
                    Inspect Silver Certificate
                  </button>
                </article>

                <article className="wc-medal-card gold" style={{ "--medal": "#fbbf24" }}>
                  <div className="wc-medal-glow" />
                  <div>
                    <Crown size={27} color="#fde047" />
                    <div className="wc-medal-emoji">🥇</div>
                    <div className="wc-medal-label">GRAND CHAMPION // RANK 01</div>
                    <div className="wc-medal-name">{currentUser?.fullName || currentUser?.name || "CodeLand Champion"}</div>
                    <div className="wc-medal-score">+500 CHAMPION XP · 995 / 1000</div>
                  </div>
                  <button type="button" className="wc-card-btn" onClick={() => handleClaimMedal("gold", 1)}>
                    <Printer size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />
                    Claim Gold Diploma
                  </button>
                </article>

                <article className="wc-medal-card" style={{ "--medal": "#fb923c" }}>
                  <div className="wc-medal-glow" />
                  <div>
                    <div className="wc-medal-emoji">🥉</div>
                    <div className="wc-medal-label">BRONZE // RANK 03</div>
                    <div className="wc-medal-name">Ziad El-Masri</div>
                    <div className="wc-medal-score">+150 BONUS XP · 890 / 1000</div>
                  </div>
                  <button type="button" className="wc-card-btn" onClick={() => handleClaimMedal("bronze", 3)}>
                    Inspect Bronze Certificate
                  </button>
                </article>
              </div>
            </section>
          )}

          {activeTab === "rules" && (
            <section className="wc-panel wc-tab-content">
              <div className="wc-section-head">
                <div>
                  <div className="wc-section-kicker">CITADEL GOVERNANCE // IMMUTABLE RULESET</div>
                  <h2 className="wc-section-title">Arena Protocols</h2>
                  <div className="wc-section-sub">Read before deployment. The combat window is strict and rank scoring is final.</div>
                </div>
                <ShieldCheck size={30} color="#38bdf8" />
              </div>

              <div className="wc-rules-grid">
                <article className="wc-rule" style={{ "--rule-color": "#38bdf8" }}>
                  <div className="wc-rule-index">PROTOCOL // 01</div>
                  <div className="wc-rule-icon"><Clock size={21} /></div>
                  <div className="wc-rule-title">Sunday Combat Window</div>
                  <div className="wc-rule-copy">
                    The arena opens every Sunday at 10:00 AM UTC and closes at 12:00 PM UTC. Submissions after the gate closes are not accepted for rank scoring.
                  </div>
                </article>

                <article className="wc-rule" style={{ "--rule-color": "#a855f7" }}>
                  <div className="wc-rule-index">PROTOCOL // 02</div>
                  <div className="wc-rule-icon"><Code2 size={21} /></div>
                  <div className="wc-rule-title">Algorithmic Trial Structure</div>
                  <div className="wc-rule-copy">
                    Operation Citadel is composed of six story-driven algorithmic sectors. Precision, speed, and low failed-attempt count determine your final combat score.
                  </div>
                </article>

                <article className="wc-rule" style={{ "--rule-color": "#fbbf24" }}>
                  <div className="wc-rule-index">PROTOCOL // 03</div>
                  <div className="wc-rule-icon"><Award size={21} /></div>
                  <div className="wc-rule-title">Podium Honors</div>
                  <div className="wc-rule-copy">
                    The Top 3 earn Gold, Silver, and Bronze distinction together with a printable, verifiable Certificate of Excellence signed by the platform founders.
                  </div>
                </article>
              </div>

              <div className="wc-honor">
                <ShieldAlert size={20} style={{ flex: "0 0 auto" }} />
                <span>
                  <strong style={{ color: "#e0e7ff" }}>Honor Code:</strong> compete using your own reasoning and submitted code. Arena integrity is part of the championship itself.
                </span>
              </div>
            </section>
          )}

          <div className="wc-footer-signal">
            CITADEL NETWORK // SECURE CHANNEL ACTIVE // EDITION {contestState.edition || "#42"}
          </div>
        </div>

        {certificateMedal && (
          <ContestCertificate
            medalData={certificateMedal}
            initialStudentName={currentUser?.fullName || currentUser?.name || "CodeLand Champion"}
            onClose={() => setCertificateMedal(null)}
          />
        )}
      </div>
    </HubLayout>
  );
}
