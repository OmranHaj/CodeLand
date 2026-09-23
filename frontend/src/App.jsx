import { lazy, Suspense, useSyncExternalStore } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { RouteEffects, RouteErrorBoundary } from "./components/Hub/RouteSupport";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

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
  return () => {
    window.removeEventListener("codeland:update", callback);
    window.removeEventListener("storage", callback);
  };
}

function getSessionSnapshot() {
  try {
    return localStorage.getItem("codeland_current_user") || "guest";
  } catch {
    return "guest";
  }
}

function App() {
  const location = useLocation();
  const session = useSyncExternalStore(subscribeSession, getSessionSnapshot);

  return (
    <>
      <RouteEffects />
      <RouteErrorBoundary key={`${location.pathname}:${session}`}>
        <Suspense
          fallback={
            <div className="route-status" role="status">
              <span className="route-spinner" />
              <p>Opening your next adventure…</p>
            </div>
          }
        >
          <Routes>
            {/* ================================================= */}
            {/* PUBLIC ROUTES */}
            {/* ================================================= */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/help" element={<Help />} />
            <Route path="/forgot-password" element={<Help />} />

            {/* ================================================= */}
            {/* AUTHENTICATED ROUTES (STUDENT & PARENT) */}
            {/* ================================================= */}
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Courses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges"
              element={
                <ProtectedRoute>
                  <Challenges key="arena" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/challenges/:challengeId"
              element={
                <ProtectedRoute>
                  <Challenges key={location.pathname} />
                </ProtectedRoute>
              }
            />

            {/* ================================================= */}
            {/* STUDENT ONLY ROUTES */}
            {/* ================================================= */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/achievements"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Achievements />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/settings"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/python-world"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <PythonWorld key={location.search} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/algorithm-lab/:sectorId"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <AlgorithmLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/algorithm-lab"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <AlgorithmLab />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/choose-path"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ChoosePath />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/world"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentWorld />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/html-foundations"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <HTMLFoundations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/css-styling"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CSSStyling />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/javascript-core"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <JavaScriptCore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/react-nexus"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ReactNexus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/project-showcase"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <ProjectShowcase />
                </ProtectedRoute>
              }
            />

            {/* C++ WORLD */}
            <Route
              path="/student/cpp-world"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppWorld />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-syntax-core"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppSyntaxCore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-data-circuits"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppDataCircuits />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-logic-gates"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppLogicGates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-function-engine"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppFunctionEngine />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-array-matrix"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppArrayMatrix />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-memory-vault"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppMemoryVault />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-object-forge"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppObjectForge />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-stl-command"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppStlCommand />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/level/cpp-final-system"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <CppFinalSystem />
                </ProtectedRoute>
              }
            />

            {/* ================================================= */}
            {/* PARENT ONLY ROUTES */}
            {/* ================================================= */}
            <Route
              path="/parent/dashboard"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/curriculum"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentCurriculum />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/reports"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/guide"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentGuide />
                </ProtectedRoute>
              }
            />

            {/* ================================================= */}
            {/* 404 NOT FOUND */}
            {/* ================================================= */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </>
  );
}

export default App;
