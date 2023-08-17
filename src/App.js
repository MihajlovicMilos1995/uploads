import { Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Students from "./components/Students";
import Teachers from "./components/Teachers";
import Layout from "./components/Layout";
import Classes from "./components/Classes";
import RequireAuth from "./components/RequireAuth";
import LinkPage from "./components/LinkPage";
import Unauthorized from "./components/Unauthorized ";

function App() {
  const [currUser, setCurrUser] = useState({});
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/*Public access*/}
        <Route path="/" element={<LinkPage />} />
        <Route path="unauthorized" element={<Unauthorized />} />
        <Route path="login" element={<Login setCurrUser={setCurrUser}/>}></Route>

        {/*User and admin access*/}
        <Route element={<RequireAuth allowedRoles={["admin", "user"]} />}>
          <Route path="students" element={<Students />}></Route>
          <Route path="teachers" element={<Teachers />}></Route>
          <Route path="classes" element={<Classes />}></Route>
        </Route>

        {/*Admin access*/}
        <Route element={<RequireAuth allowedRoles={["admin"]} />}>
          <Route path="register" element={<Register />}></Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
