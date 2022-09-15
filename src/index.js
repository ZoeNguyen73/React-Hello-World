import React from "react";
import ReactDOM from "react-dom/client";
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import LoginGrid from './components/login-grid/LoginGrid';
import "./index.css";
import App from "./App";

const baseUrl = 'http://localhost:8800';

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="register" element={<LoginGrid baseUrl={baseUrl} />} />
      </Route>
    </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
