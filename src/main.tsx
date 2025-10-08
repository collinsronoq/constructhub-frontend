import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "./index.css"

import DashboardLayout from "./layouts/DashboardLayout"
import Dashboard from "./pages/BuilderDashboard"
import Vendors from "./pages/Vendors"
import Projects from "./pages/Projects"
import AIChat from "./pages/AIChat"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Layout routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/ai" element={<AIChat />} />
          
          {/* <Route path="/settings" element={<div>Settings Page</div>} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

