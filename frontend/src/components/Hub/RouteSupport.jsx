import { Component, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { getProfile } from "../../services/learningHub";
import soundEngine from "../../services/soundEngine";

export function RouteEffects() {
  const { pathname, hash } = useLocation();
  const isInitialRef = useRef(true);

  useEffect(() => {
    try {
      // Detect World Theme
      let theme = "hub";
      if (pathname.includes("cpp")) {
        theme = "cpp";
      } else if (
        pathname.includes("algorithm-lab") ||
        pathname.includes("python-world")
      ) {
        theme = "algorithm";
      } else if (
        pathname.includes("/student/world") ||
        pathname.includes("html") ||
        pathname.includes("css") ||
        pathname.includes("javascript") ||
        pathname.includes("react") ||
        pathname.includes("project-showcase")
      ) {
        theme = "web";
      }
      soundEngine?.setWorldTheme?.(theme);

      // Play subtle warp on world navigation (skip initial mount)
      if (!isInitialRef.current) {
        soundEngine?.playWarp?.();
      } else {
        isInitialRef.current = false;
      }
    } catch {
      // safe fallback
    }

    const titles = {
      "/": "Learn to Code. Build Your Future.",
      "/courses": "Explore Courses",
      "/student/dashboard": "Your Learning Space",
      "/parent/dashboard": "Family Observatory",
      "/parent/curriculum": "Curriculum Guide",
      "/parent/reports": "Monthly Reports",
      "/parent/guide": "Parent Guide & Safety",
      "/challenges": "Practice Arena",
      "/student/achievements": "Achievements",
      "/student/contest": "Weekly Sunday Arena",
      "/student/settings": "Your Preferences",
      "/student/python-world": "Algorithm & Data Structures",
      "/student/algorithm-lab": "Algorithm Lab",
      "/help": "Help & Support",
      "/login": "Welcome Back",
      "/register": "Start Your Adventure",
    };
    document.title = `${
      titles[pathname] ||
      (pathname.startsWith("/student/algorithm-lab")
        ? "Algorithm Lab"
        : "Your Coding Adventure")
    } | CodeLand`;
    document.documentElement.dataset.reducedMotion = String(
      getProfile().reducedMotion,
    );
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
    else {
      // Lazy routes may render their target section after the route effect runs.
      const scroll = () => {
        const element = document.getElementById(hash.slice(1));
        if (element) {
          element.scrollIntoView();
          return true;
        }
        return false;
      };
      if (!scroll()) {
        const observer = new MutationObserver(() => {
          if (scroll()) observer.disconnect();
        });
        observer.observe(document.getElementById("root"), {
          childList: true,
          subtree: true,
        });
        return () => observer.disconnect();
      }
    }
  }, [pathname, hash]);

  return ["/student/world", "/student/cpp-world", "/student/python-world"].includes(
    pathname,
  ) ? (
    <Link to="/student/dashboard" className="world-dashboard-link">
      ← My learning space
    </Link>
  ) : null;
}

export class RouteErrorBoundary extends Component {
  state = { failed: false, error: null };
  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("[RouteErrorBoundary] Caught error:", error, errorInfo);
  }
  handleResetStorage = () => {
    try {
      localStorage.removeItem("codeland_weekly_contest_v2");
      localStorage.removeItem("codeland_sunday_arena_progress_v2");
      localStorage.removeItem("codeland_student_contest_medals_v2");
    } catch {}
    this.setState({ failed: false, error: null });
    window.location.reload();
  };
  render() {
    if (this.state.failed)
      return (
        <main className="route-status">
          <span>CodeLand</span>
          <h1>This world needs a fresh start.</h1>
          <p>
            Something interrupted the page. Your saved progress is still on this
            browser.
          </p>
          {this.state.error && (
            <div
              style={{
                color: "#f87171",
                fontFamily: "monospace",
                fontSize: "12px",
                margin: "12px auto",
                maxWidth: "500px",
                textAlign: "left",
                background: "rgba(239, 68, 68, 0.1)",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {this.state.error?.message || String(this.state.error)}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => window.location.reload()}>Try again</button>
            <button
              onClick={this.handleResetStorage}
              style={{ background: "#475569" }}
            >
              Reset Session
            </button>
          </div>
          <Link
            to="/student/dashboard"
            onClick={() => this.setState({ failed: false, error: null })}
          >
            Back to your learning space
          </Link>
        </main>
      );
    return this.props.children;
  }
}
