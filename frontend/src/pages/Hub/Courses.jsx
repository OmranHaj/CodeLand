import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  Clock3,
  Compass,
  Search,
  SearchX,
} from "lucide-react";
import HubLayout from "../../components/Hub/HubLayout";
import { readStored, userKey, writeStored } from "../../services/learningHub";
import { getAllCourses, useAdminStore } from "../../services/adminLessonService";

export default function Courses() {
  const [params, setParams] = useSearchParams();
  const store = useAdminStore();

  const allCourses = useMemo(() => getAllCourses(), [store]);

  // Dynamically derive course groups from database courses (Web, C++, Algorithms) - mock Python commented out
  const courseGroups = useMemo(() => {
    const groups = ["All courses"];
    allCourses.forEach((c) => {
      if (c.group && !groups.includes(c.group)) {
        groups.push(c.group);
      }
    });
    // Add Saved tab at the end
    if (!groups.includes("Saved")) groups.push("Saved");
    return groups;
  }, [allCourses]);

  const filter = courseGroups.includes(params.get("path"))
    ? params.get("path")
    : "All courses";

  const query = params.get("q") || "";
  const key = `codeland_saved_${userKey()}`;
  const [saved, setSaved] = useState(() => {
    const data = readStored(key, []);
    return Array.isArray(data) ? data : [];
  });
  const [error, setError] = useState("");

  const update = (name, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    setParams(next, { replace: true });
  };

  const toggle = (id) => {
    const next = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    try {
      writeStored(key, next);
      setSaved(next);
      setError("");
    } catch {
      setError(
        "Your browser could not save this course. Please allow local storage and try again."
      );
    }
  };

  const visible = allCourses.filter(
    (course) =>
      (filter === "All courses" ||
        course.group === filter ||
        (filter === "Saved" && saved.includes(course.id))) &&
      `${course.title} ${course.description} ${course.group}`
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <HubLayout title="Explore courses">
      <div className="hub-heading">
        <div>
          <span className="hub-eyebrow">
            <Compass size={13} /> FOLLOW YOUR CURIOSITY
          </span>
          <h1>A world of possibilities.</h1>
          <p>Find your spark. Learn by doing. Build something that's yours.</p>
        </div>
        <Link className="hub-btn ghost" to="/student/choose-path">
          Explore learning paths <ArrowRight size={14} />
        </Link>
      </div>

      <div className="hub-toolbar">
        <div className="hub-tabs" aria-label="Filter courses">
          {courseGroups.map((item) => (
            <button
              key={item}
              aria-pressed={filter === item}
              onClick={() => update("path", item)}
            >
              {item}
              {item === "Saved" ? ` (${saved.length})` : ""}
            </button>
          ))}
        </div>
        <label className="hub-search">
          <Search size={17} />
          <input
            aria-label="Search courses"
            placeholder="Find your next skill..."
            value={query}
            onChange={(event) => update("q", event.target.value)}
          />
        </label>
      </div>

      <p className="hub-result-count" aria-live="polite">
        {visible.length} {visible.length === 1 ? "course" : "courses"} to explore ·
        Learn at your own pace
      </p>

      {error && (
        <p role="alert" className="hub-feedback">
          {error}
        </p>
      )}

      {visible.length ? (
        <div className="hub-catalog">
          {visible.map((course) => (
            <article
              key={course.id}
              className="hub-course"
              style={{ "--accent": course.accent }}
            >
              <div className="hub-course-art">
                <small>
                  {/* Mock Python commented out: course.group === "Python" ? "PYTHON EXPLORER" : */}
                  {course.group === "Algorithms"
                    ? "ALGORITHM MASTER"
                    : course.group === "C++"
                    ? "C++ DEVELOPER"
                    : "WEB CREATOR"}
                </small>
                <button
                  className="hub-course-save"
                  aria-label={`${
                    saved.includes(course.id) ? "Unsave" : "Save"
                  } ${course.title}`}
                  aria-pressed={saved.includes(course.id)}
                  onClick={() => toggle(course.id)}
                >
                  <Bookmark
                    size={15}
                    fill={saved.includes(course.id) ? "currentColor" : "none"}
                  />
                </button>
                <strong>{course.code}</strong>
              </div>

              <div className="hub-course-content">
                <span className="hub-course-label">
                  {course.group} · INTERACTIVE LEARNING
                </span>

                <h2>{course.title}</h2>
                <p>{course.description}</p>

                <div className="hub-course-meta">
                  <span>
                    <BookOpen size={12} />
                    {course.lessonCount}{" "}
                    {course.lessonCount === 1 ? "lesson" : "lessons"}
                  </span>
                  <span>
                    <Clock3 size={12} />
                    Self-paced
                  </span>
                </div>

                <Link className="hub-course-link" to={course.route}>
                  Explore course <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="hub-empty">
          <SearchX size={35} />
          <h2>
            {filter === "Saved" && !query
              ? "Your next discoveries, all in one place."
              : "No courses found."}
          </h2>
          <p>
            {filter === "Saved" && !query
              ? "Tap the bookmark on any course to add it to your personal collection."
              : "Try a different search or explore another learning path."}
          </p>
          <button className="hub-btn" onClick={() => setParams({})}>
            Explore all courses
          </button>
        </div>
      )}
    </HubLayout>
  );
}
