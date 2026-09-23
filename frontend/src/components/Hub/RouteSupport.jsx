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
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
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
          <button onClick={() => window.location.reload()}>Try again</button>
          <Link
            to="/student/dashboard"
            onClick={() => this.setState({ failed: false })}
          >
            Back to your learning space
          </Link>
        </main>
      );
    return this.props.children;
  }
}
