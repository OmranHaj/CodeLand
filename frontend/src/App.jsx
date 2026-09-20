import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import ChoosePath from "./pages/ChoosePath/ChoosePath";

import StudentWorld from "./pages/StudentWorld/StudentWorld";

import CppWorld from "./pages/CppWorld/CppWorld";
import CppSyntaxCore from "./pages/CppSyntaxCore/CppSyntaxCore";
import CppDataCircuits from "./pages/CppDataCircuits/CppDataCircuits";
import CppLogicGates from "./pages/CppLogicGates/CppLogicGates";
import CppFunctionEngine from "./pages/CppFunctionEngine/CppFunctionEngine";
import CppArrayMatrix from "./pages/CppArrayMatrix/CppArrayMatrix";
import CppMemoryVault from "./pages/CppMemoryVault/CppMemoryVault";
import CppObjectForge from "./pages/CppObjectForge/CppObjectForge";
import CppStlCommand from "./pages/CppStlCommand/CppStlCommand";
import CppFinalSystem from "./pages/CppFinalSystem/CppFinalSystem";

import HTMLFoundations from "./pages/HTMLFoundations/HTMLFoundations";
import CSSStyling from "./pages/CSSStyling/CSSStyling";
import JavaScriptCore from "./pages/JavaScriptCore/JavaScriptCore";
import ReactNexus from "./pages/ReactNexus/ReactNexus";
import ProjectShowcase from "./pages/ProjectShowcase/ProjectShowcase";

function App() {
  return (
    <Routes>
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
    </Routes>
  );
}

export default App;
