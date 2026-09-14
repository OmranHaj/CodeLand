import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import ChoosePath from "./pages/ChoosePath/ChoosePath";
import StudentWorld from "./pages/StudentWorld/StudentWorld";

import HTMLFoundations from "./pages/HTMLFoundations/HTMLFoundations";
import CSSStyling from "./pages/CSSStyling/CSSStyling";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/student/choose-path" element={<ChoosePath />} />

      <Route path="/student/world" element={<StudentWorld />} />

      <Route
        path="/student/level/html-foundations"
        element={<HTMLFoundations />}
      />

      <Route path="/student/level/css-styling" element={<CSSStyling />} />
    </Routes>
  );
}

export default App;
