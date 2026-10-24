import { useState, useRef } from "react";
import {
  Printer,
  X,
  CheckCircle2,
  ShieldCheck,
  Trophy,
  Share2,
} from "lucide-react";

export default function ContestCertificate({
  medalData,
  onClose,
  initialStudentName = "Alex Morgan",
}) {
  const [selectedMedalType, setSelectedMedalType] = useState(
    medalData?.medalType || "gold"
  );
  const [customName, setCustomName] = useState(
    medalData?.studentName || initialStudentName
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const certRef = useRef(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const medalThemes = {
    gold: {
      name: "Gold Medalist",
      rankTitle: "1ST PLACE GRAND CHAMPION",
      borderGlow: "#fbbf24",
      accentGrad: "linear-gradient(135deg, #fde047 0%, #d97706 100%)",
      badgeText: "CHAMPIONSHIP GOLD",
      medalEmoji: "🥇",
      ribbonColor: "#d97706",
      sealBorder: "#fde047",
    },
    silver: {
      name: "Silver Medalist",
      rankTitle: "2ND PLACE MASTER RUNNER-UP",
      borderGlow: "#cbd5e1",
      accentGrad: "linear-gradient(135deg, #f8fafc 0%, #64748b 100%)",
      badgeText: "CHAMPIONSHIP SILVER",
      medalEmoji: "🥈",
      ribbonColor: "#64748b",
      sealBorder: "#94a3b8",
    },
    bronze: {
      name: "Bronze Medalist",
      rankTitle: "3RD PLACE ELITE PODIUM FINALIST",
      borderGlow: "#f97316",
      accentGrad: "linear-gradient(135deg, #fdba74 0%, #c2410c 100%)",
      badgeText: "CHAMPIONSHIP BRONZE",
      medalEmoji: "🥉",
      ribbonColor: "#9a3412",
      sealBorder: "#ea580c",
    },
  };

  const theme = medalThemes[selectedMedalType] || medalThemes.gold;
  const certDate =
    medalData?.dateAwarded ||
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const certCode =
    medalData?.certificateCode ||
    `CL-SUN-2026-${selectedMedalType.toUpperCase()}-0842`;

  return (
    <div className="codeland-cert-modal-backdrop">
      {/* Modal Actions Bar (Hidden in Print) */}
      <div className="codeland-cert-actions-bar no-print">
        <div className="codeland-cert-action-tabs">
          <button
            className={`cert-type-btn ${selectedMedalType === "gold" ? "active gold" : ""}`}
            onClick={() => setSelectedMedalType("gold")}
          >
            🥇 Gold Champion
          </button>
          <button
            className={`cert-type-btn ${selectedMedalType === "silver" ? "active silver" : ""}`}
            onClick={() => setSelectedMedalType("silver")}
          >
            🥈 Silver Runner-Up
          </button>
          <button
            className={`cert-type-btn ${selectedMedalType === "bronze" ? "active bronze" : ""}`}
            onClick={() => setSelectedMedalType("bronze")}
          >
            🥉 Bronze Finalist
          </button>
        </div>

        <div className="codeland-cert-buttons">
          <button className="cert-btn primary" onClick={handlePrint}>
            <Printer size={16} /> Print Certificate
          </button>
          <button className="cert-btn secondary" onClick={handleShare}>
            {copiedLink ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
            {copiedLink ? "Link Copied!" : "Share Certificate"}
          </button>
          {onClose && (
            <button className="cert-btn close" onClick={onClose}>
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Main Certificate Scrollable Container */}
      <div className="codeland-cert-viewport">
        <div
          ref={certRef}
          className={`codeland-certificate-sheet theme-${selectedMedalType}`}
        >
          {/* Outer Guilloche Border */}
          <div className="cert-border-outer">
            <div className="cert-border-inner">
              {/* Corner Ornaments */}
              <div className="cert-corner corner-tl" />
              <div className="cert-corner corner-tr" />
              <div className="cert-corner corner-bl" />
              <div className="cert-corner corner-br" />

              {/* Watermark Crest */}
              <div className="cert-watermark">CODELAND</div>

              {/* Certificate Content Header */}
              <header className="cert-header">
                <div className="cert-insignia">
                  <Trophy size={36} className="cert-insignia-icon" />
                  <span className="cert-insignia-stars">★ ★ ★ ★ ★</span>
                </div>
                <div className="cert-organization">
                  CODELAND ACADEMY OF ADVANCED COMPUTING & COMPETITIVE PROGRAMMING
                </div>
                <h1 className="cert-main-title">Certificate of Victory & Excellence</h1>
                <div className="cert-subtitle">
                  OFFICIAL RECOGNITION OF DISTINGUISHED ALGORITHMIC MERIT
                </div>
              </header>

              {/* Body Text */}
              <div className="cert-body">
                <p className="cert-presentation-text">
                  This prestigious diploma is officially conferred upon
                </p>

                {/* Recipient Name with inline edit capability */}
                <div className="cert-recipient-wrapper">
                  {isEditingName ? (
                    <input
                      type="text"
                      className="cert-name-input no-print"
                      value={customName}
                      autoFocus
                      onChange={(e) => setCustomName(e.target.value)}
                      onBlur={() => setIsEditingName(false)}
                      onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                    />
                  ) : (
                    <h2
                      className="cert-recipient-name"
                      title="Click to edit name"
                      onClick={() => setIsEditingName(true)}
                    >
                      {customName}
                    </h2>
                  )}
                  <span className="cert-name-hint no-print">
                    (Click name to customize before printing)
                  </span>
                </div>

                <p className="cert-citation">
                  For demonstrating supreme algorithmic reasoning, code efficiency, and
                  unyielding tenacity in the <strong>CodeLand Weekly Sunday Arena</strong>{" "}
                  championship, officially earning the distinguished rank of
                </p>

                {/* Big Medal Banner */}
                <div className="cert-award-plaque">
                  <span className="cert-plaque-medal">{theme.medalEmoji}</span>
                  <div className="cert-plaque-content">
                    <span className="cert-plaque-rank">{theme.rankTitle}</span>
                    <span className="cert-plaque-category">
                      Grand Sunday Invitational — Algorithmic Division I
                    </span>
                  </div>
                </div>

                {/* Verification Metadata Row */}
                <div className="cert-meta-row">
                  <div className="cert-meta-item">
                    <span className="meta-label">EDITION</span>
                    <span className="meta-val">{medalData?.edition || "#42"}</span>
                  </div>
                  <div className="cert-meta-item">
                    <span className="meta-label">DATE CONFERRED</span>
                    <span className="meta-val">{certDate}</span>
                  </div>
                  <div className="cert-meta-item">
                    <span className="meta-label">ARENA SCORE</span>
                    <span className="meta-val">{medalData?.score || "980 / 1000"}</span>
                  </div>
                  <div className="cert-meta-item">
                    <span className="meta-label">CREDENTIAL ID</span>
                    <span className="meta-val code">{certCode}</span>
                  </div>
                </div>
              </div>

              {/* Certificate Footer & Signatures */}
              <footer className="cert-footer">
                {/* Official Holographic Embossed Seal */}
                <div className="cert-seal-column">
                  <div className="cert-seal-ribbon ribbon-left" />
                  <div className="cert-seal-ribbon ribbon-right" />
                  <div className="cert-embossed-seal">
                    <ShieldCheck size={28} />
                    <span className="seal-text-top">CODELAND</span>
                    <span className="seal-text-center">VERIFIED</span>
                    <span className="seal-text-bottom">EXCELLENCE</span>
                  </div>
                </div>

                {/* Three Official Signatures (English as requested) */}
                <div className="cert-signatures-grid">
                  {/* Signature 1: Abdullah Al-Buraidi */}
                  <div className="cert-signature-block">
                    <div className="sig-handwriting sig-buraidi">
                      Abdullah Al-Buraidi
                    </div>
                    <div className="sig-line" />
                    <div className="sig-name">Abdullah Al-Buraidi</div>
                    <div className="sig-role">Co-Founder & Head of Curriculum</div>
                    <div className="sig-corp">Platform Director</div>
                  </div>

                  {/* Signature 2: Omran Haj Hussein */}
                  <div className="cert-signature-block">
                    <div className="sig-handwriting sig-omran">
                      Omran Haj Hussein
                    </div>
                    <div className="sig-line" />
                    <div className="sig-name">Omran Haj Hussein</div>
                    <div className="sig-role">Co-Founder & Lead Systems Architect</div>
                    <div className="sig-corp">Technical Director</div>
                  </div>

                  {/* Signature 3: Abdullah Hamed */}
                  <div className="cert-signature-block">
                    <div className="sig-handwriting sig-hamed">
                      Abdullah Hamed
                    </div>
                    <div className="sig-line" />
                    <div className="sig-name">Abdullah Hamed</div>
                    <div className="sig-role">Co-Founder & Head of Competitive Programming</div>
                    <div className="sig-corp">Head of Contests</div>
                  </div>
                </div>
              </footer>

              {/* Security Bottom Strip */}
              <div className="cert-security-strip">
                <span className="security-text">
                  SECURE VERIFICATION TOKEN: {certCode} • ISSUED BY CODELAND GLOBAL COMPETITIVE GUILD • ALL RIGHTS RESERVED
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Certificate CSS for Luxury Display & High-Res Print */}
      <style>{`
        /* ========================================================= */
        /* MODAL BACKDROP & VIEWPORT */
        /* ========================================================= */
        .codeland-cert-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(2, 6, 23, 0.92);
          backdrop-filter: blur(16px);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .codeland-cert-actions-bar {
          width: 100%;
          max-width: 1000px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          gap: 16px;
          flex-wrap: wrap;
        }

        .codeland-cert-action-tabs {
          display: flex;
          gap: 8px;
          background: rgba(15, 23, 42, 0.8);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .cert-type-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cert-type-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
        }

        .cert-type-btn.active.gold {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #000;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(245, 158, 11, 0.4);
        }

        .cert-type-btn.active.silver {
          background: linear-gradient(135deg, #e2e8f0, #94a3b8);
          color: #0f172a;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(226, 232, 240, 0.4);
        }

        .cert-type-btn.active.bronze {
          background: linear-gradient(135deg, #fb923c, #c2410c);
          color: #fff;
          font-weight: 700;
          box-shadow: 0 0 16px rgba(251, 146, 60, 0.4);
        }

        .codeland-cert-buttons {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cert-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s;
        }

        .cert-btn.primary {
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: #1e1b4b;
          font-weight: 700;
          box-shadow: 0 4px 20px rgba(245, 158, 11, 0.35);
        }

        .cert-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(245, 158, 11, 0.5);
        }

        .cert-btn.secondary {
          background: rgba(30, 41, 59, 0.8);
          color: #e2e8f0;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .cert-btn.secondary:hover {
          background: rgba(51, 65, 85, 0.9);
        }

        .cert-btn.close {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.4);
          padding: 10px;
          border-radius: 50%;
        }

        .cert-btn.close:hover {
          background: rgba(239, 68, 68, 0.4);
        }

        .codeland-cert-viewport {
          width: 100%;
          display: flex;
          justify-content: center;
          padding-bottom: 40px;
        }

        /* ========================================================= */
        /* LUXURIOUS CERTIFICATE SHEET (A4 Landscape Proportions) */
        /* ========================================================= */
        .codeland-certificate-sheet {
          width: 980px;
          min-height: 690px;
          background: #090d1a;
          background: radial-gradient(circle at 50% 30%, #10172e 0%, #060914 100%);
          color: #f8fafc;
          border-radius: 4px;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.9), 0 0 60px rgba(245, 158, 11, 0.15);
          box-sizing: border-box;
          font-family: "Cinzel", Georgia, "Times New Roman", serif;
        }

        .cert-border-outer {
          padding: 14px;
          border: 3px solid #b48325;
          position: relative;
          height: 100%;
          box-sizing: border-box;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(217, 119, 6, 0.03) 10px,
            rgba(217, 119, 6, 0.03) 20px
          );
        }

        .cert-border-inner {
          border: 1px solid #eab308;
          padding: 36px 48px;
          position: relative;
          height: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(ellipse at 50% 40%, rgba(20, 29, 58, 0.6) 0%, rgba(7, 10, 22, 0.95) 100%);
        }

        /* Corner Filigrees */
        .cert-corner {
          position: absolute;
          width: 32px;
          height: 32px;
          border: 3px solid #eab308;
        }
        .corner-tl { top: 8px; left: 8px; border-right: none; border-bottom: none; }
        .corner-tr { top: 8px; right: 8px; border-left: none; border-bottom: none; }
        .corner-bl { bottom: 8px; left: 8px; border-right: none; border-top: none; }
        .corner-br { bottom: 8px; right: 8px; border-left: none; border-top: none; }

        /* Subtle Watermark */
        .cert-watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-25deg);
          font-size: 110px;
          font-weight: 900;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.018);
          pointer-events: none;
          user-select: none;
          z-index: 0;
          font-family: Inter, sans-serif;
        }

        /* Header */
        .cert-header {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .cert-insignia {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
        }

        .cert-insignia-icon {
          color: #fbbf24;
          filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.6));
        }

        .cert-insignia-stars {
          font-size: 11px;
          letter-spacing: 0.4em;
          color: #fde047;
        }

        .cert-organization {
          font-family: Inter, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .cert-main-title {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 0.06em;
          margin: 0 0 4px 0;
          background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-transform: uppercase;
        }

        .cert-subtitle {
          font-family: Inter, sans-serif;
          font-size: 11px;
          letter-spacing: 0.22em;
          color: #fbbf24;
          font-weight: 600;
        }

        /* Body */
        .cert-body {
          text-align: center;
          margin: 20px 0;
          position: relative;
          z-index: 1;
        }

        .cert-presentation-text {
          font-family: "Great Vibes", "Playfair Display", Georgia, serif;
          font-size: 18px;
          font-style: italic;
          color: #94a3b8;
          margin: 0 0 8px 0;
        }

        .cert-recipient-wrapper {
          margin: 4px 0 16px 0;
        }

        .cert-recipient-name {
          font-size: 40px;
          font-weight: 800;
          letter-spacing: 0.04em;
          margin: 0;
          background: linear-gradient(135deg, #fef08a 0%, #f59e0b 50%, #b45309 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 20px rgba(245, 158, 11, 0.3);
          cursor: pointer;
        }

        .cert-name-input {
          font-family: "Cinzel", Georgia, serif;
          font-size: 32px;
          font-weight: 700;
          color: #fbbf24;
          background: rgba(15, 23, 42, 0.9);
          border: 1px dashed #fbbf24;
          border-radius: 8px;
          padding: 4px 16px;
          text-align: center;
          width: 80%;
          outline: none;
        }

        .cert-name-hint {
          display: block;
          font-family: Inter, sans-serif;
          font-size: 10px;
          color: #64748b;
          margin-top: 4px;
        }

        .cert-citation {
          font-family: Inter, sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #cbd5e1;
          max-width: 680px;
          margin: 0 auto 16px auto;
        }

        .cert-award-plaque {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          padding: 10px 28px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 999px;
          margin-bottom: 20px;
        }

        .theme-silver .cert-award-plaque {
          background: rgba(203, 213, 225, 0.08);
          border-color: rgba(203, 213, 225, 0.3);
        }

        .theme-bronze .cert-award-plaque {
          background: rgba(249, 115, 22, 0.08);
          border-color: rgba(249, 115, 22, 0.3);
        }

        .cert-plaque-medal {
          font-size: 26px;
        }

        .cert-plaque-content {
          text-align: left;
        }

        .cert-plaque-rank {
          display: block;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #fde047;
        }

        .theme-silver .cert-plaque-rank { color: #f1f5f9; }
        .theme-bronze .cert-plaque-rank { color: #fed7aa; }

        .cert-plaque-category {
          display: block;
          font-family: Inter, sans-serif;
          font-size: 11px;
          color: #94a3b8;
          letter-spacing: 0.02em;
        }

        .cert-meta-row {
          display: flex;
          justify-content: center;
          gap: 36px;
          border-top: 1px solid rgba(148, 163, 184, 0.15);
          padding-top: 12px;
          max-width: 640px;
          margin: 0 auto;
        }

        .cert-meta-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .meta-label {
          font-family: Inter, sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          letter-spacing: 0.18em;
        }

        .meta-val {
          font-family: Inter, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .meta-val.code {
          font-family: monospace;
          color: #fbbf24;
          letter-spacing: 0.08em;
        }

        /* Footer & Signatures */
        .cert-footer {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 16px 20px 4px 20px;
          position: relative;
          z-index: 1;
        }

        /* Holographic Seal */
        .cert-seal-column {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cert-embossed-seal {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          background: radial-gradient(circle, #fde047 0%, #b45309 85%);
          box-shadow: 0 0 20px rgba(245, 158, 11, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.4);
          border: 3px double #fef08a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #451a03;
          position: relative;
          z-index: 2;
        }

        .seal-text-top, .seal-text-bottom {
          font-family: Inter, sans-serif;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.15em;
        }

        .seal-text-center {
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.2em;
          border-top: 1px solid #78350f;
          border-bottom: 1px solid #78350f;
          padding: 1px 0;
          margin: 1px 0;
        }

        .cert-seal-ribbon {
          position: absolute;
          width: 18px;
          height: 52px;
          background: #b45309;
          bottom: -16px;
          z-index: 1;
          clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);
        }
        .ribbon-left { left: 24px; transform: rotate(-15deg); }
        .ribbon-right { right: 24px; transform: rotate(15deg); }

        /* Signatures Grid */
        .cert-signatures-grid {
          display: flex;
          gap: 28px;
          flex: 1;
          justify-content: flex-end;
        }

        .cert-signature-block {
          text-align: center;
          width: 175px;
        }

        .sig-handwriting {
          font-family: "Brush Script MT", "Caveat", "Segoe Script", cursive;
          font-size: 21px;
          color: #fde047;
          min-height: 32px;
          line-height: 1.2;
          transform: rotate(-3deg);
          letter-spacing: 0.04em;
        }

        .sig-buraidi { color: #fde047; }
        .sig-omran { color: #38bdf8; }
        .sig-hamed { color: #34d399; }

        .sig-line {
          height: 1px;
          background: rgba(148, 163, 184, 0.4);
          margin: 4px 0 6px 0;
        }

        .sig-name {
          font-family: Inter, sans-serif;
          font-size: 11px;
          font-weight: 700;
          color: #f8fafc;
          letter-spacing: 0.03em;
        }

        .sig-role {
          font-family: Inter, sans-serif;
          font-size: 8.5px;
          color: #94a3b8;
          line-height: 1.3;
        }

        .sig-corp {
          font-family: Inter, sans-serif;
          font-size: 8px;
          color: #64748b;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        /* Bottom Security Strip */
        .cert-security-strip {
          text-align: center;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          padding-top: 8px;
          margin-top: 8px;
        }

        .security-text {
          font-family: monospace;
          font-size: 7.5px;
          color: #64748b;
          letter-spacing: 0.12em;
        }

        /* ========================================================= */
        /* PRINT SPECIFIC STYLES (@media print)                      */
        /* Strips everything except the pristine landscape certificate */
        /* ========================================================= */
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          .codeland-cert-modal-backdrop {
            position: absolute !important;
            inset: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            overflow: visible !important;
          }
          .codeland-cert-viewport {
            padding: 0 !important;
            margin: 0 !important;
          }
          .codeland-certificate-sheet,
          .codeland-certificate-sheet * {
            visibility: visible !important;
          }
          .codeland-certificate-sheet {
            width: 100vw !important;
            height: 100vh !important;
            max-width: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #090d1a !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
