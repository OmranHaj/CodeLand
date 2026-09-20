import { lazy, Suspense, useSyncExternalStore } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { RouteEffects, RouteErrorBoundary } from "./components/Hub/RouteSupport";

const Home = lazy(() => import("./pages/Home/Home"));
const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));

const ChoosePath = lazy(() => import("./pages/ChoosePath/ChoosePath"));

const StudentWorld = lazy(() => import("./pages/StudentWorld/StudentWorld"));

const CppWorld = lazy(() => import("./pages/CppWorld/CppWorld"));
const CppSyntaxCore = lazy(() => import("./pages/CppSyntaxCore/CppSyntaxCore"));
const CppDataCircuits = lazy(() => import("./pages/CppDataCircuits/CppDataCircuits"));
const CppLogicGates = lazy(() => import("./pages/CppLogicGates/CppLogicGates"));
const CppFunctionEngine = lazy(() => import("./pages/CppFunctionEngine/CppFunctionEngine"));
const CppArrayMatrix = lazy(() => import("./pages/CppArrayMatrix/CppArrayMatrix"));
const CppMemoryVault = lazy(() => import("./pages/CppMemoryVault/CppMemoryVault"));
const CppObjectForge = lazy(() => import("./pages/CppObjectForge/CppObjectForge"));
const CppStlCommand = lazy(() => import("./pages/CppStlCommand/CppStlCommand"));
const CppFinalSystem = lazy(() => import("./pages/CppFinalSystem/CppFinalSystem"));

const HTMLFoundations = lazy(() => import("./pages/HTMLFoundations/HTMLFoundations"));
const CSSStyling = lazy(() => import("./pages/CSSStyling/CSSStyling"));
const JavaScriptCore = lazy(() => import("./pages/JavaScriptCore/JavaScriptCore"));
const ReactNexus = lazy(() => import("./pages/ReactNexus/ReactNexus"));
const ProjectShowcase = lazy(() => import("./pages/ProjectShowcase/ProjectShowcase"));

const Dashboard = lazy(() => import("./pages/Hub/Dashboard"));
const Courses = lazy(() => import("./pages/Hub/Courses"));
const Challenges = lazy(() => import("./pages/Hub/Challenges"));
const Achievements = lazy(() => import("./pages/Hub/Achievements"));
const Settings = lazy(() => import("./pages/Hub/Settings"));
const PythonWorld = lazy(() => import("./pages/Hub/PythonWorld"));
const AlgorithmLab = lazy(() => import("./pages/Hub/AlgorithmLab"));
const ParentDashboard = lazy(() => import("./pages/Hub/ParentDashboard"));
const ParentCurriculum = lazy(() => import("./pages/Hub/ParentCurriculum"));
const ParentReports = lazy(() => import("./pages/Hub/ParentReports"));
const ParentGuide = lazy(() => import("./pages/Hub/ParentGuide"));
const Help = lazy(() => import("./pages/Hub/Help"));
const NotFound = lazy(() => import("./pages/Hub/NotFound"));

function subscribeSession(callback) {
  window.addEventListener("codeland:update", callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener("codeland:update", callback); window.removeEventListener("storage", callback); };
}
function getSessionSnapshot() {
  try { return localStorage.getItem("codeland_current_user") || "guest"; } catch { return "guest"; }
}

function App() {
  const location = useLocation();
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot);
  return (
    <><RouteEffects /><RouteErrorBoundary key={`${location.pathname}:${session}`}><Suspense fallback={<div className="route-status" role="status"><span className="route-spinner" /><p>Opening your next adventure…</p></div>}><Routes>
      <Route path="/student/dashboard" element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/challenges" element={<Challenges key="arena" />} />
      <Route path="/challenges/:challengeId" element={<Challenges key={location.pathname} />} />
      <Route path="/student/achievements" element={<Achievements />} />
      <Route path="/student/settings" element={<Settings />} />
      <Route path="/student/profile" element={<Settings />} />
      <Route path="/student/python-world" element={<PythonWorld key={location.search} />} />
      <Route path="/student/algorithm-lab/:sectorId" element={<AlgorithmLab />} />
      <Route path="/student/algorithm-lab" element={<AlgorithmLab />} />
      <Route path="/parent/dashboard" element={<ParentDashboard />} />
      <Route path="/parent/curriculum" element={<ParentCurriculum />} />
      <Route path="/parent/reports" element={<ParentReports />} />
      <Route path="/parent/guide" element={<ParentGuide />} />
      <Route path="/help" element={<Help />} />
      <Route path="/forgot-password" element={<Help />} />
      <Route path="*" element={<NotFound />} />
      {/* PUBLIC */}
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      {/* PATH SELECTION */}
      <Route path="/student/choose-path" element={<ChoosePath />} />

      {/* WEB CREATOR */}
      <Route path="/student/world" element={<StudentWorld />} />

      <Route
        path="/student/level/html-foundations"
        element={<HTMLFoundations />}
      />

      <Route path="/student/level/css-styling" element={<CSSStyling />} />

      <Route
        path="/student/level/javascript-core"
        element={<JavaScriptCore />}
      />

      <Route path="/student/level/react-nexus" element={<ReactNexus />} />

      <Route
        path="/student/level/project-showcase"
        element={<ProjectShowcase />}
      />

      {/* C++ CORE */}
      <Route path="/student/cpp-world" element={<CppWorld />} />

      <Route
        path="/student/level/cpp-syntax-core"
        element={<CppSyntaxCore />}
      />

      <Route
        path="/student/level/cpp-data-circuits"
        element={<CppDataCircuits />}
      />

      <Route
        path="/student/level/cpp-logic-gates"
        element={<CppLogicGates />}
      />

      <Route
        path="/student/level/cpp-function-engine"
        element={<CppFunctionEngine />}
      />

      <Route
        path="/student/level/cpp-array-matrix"
        element={<CppArrayMatrix />}
      />

      <Route
        path="/student/level/cpp-memory-vault"
        element={<CppMemoryVault />}
      />
      <Route
        path="/student/level/cpp-object-forge"
        element={<CppObjectForge />}
      />
      <Route
        path="/student/level/cpp-stl-command"
        element={<CppStlCommand />}
      />
      <Route
        path="/student/level/cpp-final-system"
        element={<CppFinalSystem />}
      />
    </Routes></Suspense></RouteErrorBoundary></>
  );
}

export default App;
