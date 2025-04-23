// Layout.tsx

import React from "react";
import "./Layout.css";
import Sidebar from "./Sidebar";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <div className="layout">
    <div className="sidebar">
      <Sidebar />
    </div>
    <main className="main">{children}</main>
  </div>
);

export default Layout;
