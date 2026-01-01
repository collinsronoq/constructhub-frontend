import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import "./index.css"
import DashboardLayout from "./layouts/DashboardLayout"
import Dashboard from "./pages/BuilderDashboard"
import VendorProfile from "./pages/VendorProfile"
import Estimates from "./pages/Estimates"
import GetEstimate from "./pages/GetEstimate"
import TechnicianDirectory from "./pages/TechnicianDirectory"
import AIChat from "./pages/AIChat"
import Login from "./pages/Login"
import SignUp from "./pages/SignUp"
import TechnicianProfile from "./pages/TechnicianProfile"
import Marketplace from "./pages/MarketPlace"
import EstimateDetail from "./pages/EstimateDetail"
import VendorDirectory from "./pages/VendorDirectory"
import ArticlesPage from "./pages/Articles"
import ArticleDetailsPage from "./pages/ArticleDetailsPage"
import AdminArticlesPage from "./pages/AdminArticles"


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
          <Route path="/estimates" element={<Estimates />} />
          <Route path="/estimate" element={<GetEstimate />} />
          <Route path="/estimation/:id" element={<EstimateDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/technicians" element={<TechnicianDirectory />} />
          <Route path="/vendors" element={<VendorDirectory />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailsPage />} />
          <Route path="/admin/articles" element={<AdminArticlesPage />} />
          <Route path="/vendor/profile" element={<VendorProfile />} />
          <Route path="/technician/profile" element = {<TechnicianProfile />} />
          
          {/* <Route path="/settings" element={<div>Settings Page</div>} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
