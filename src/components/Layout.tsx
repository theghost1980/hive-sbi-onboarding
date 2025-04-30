import React from "react";
import styled from "styled-components";
import Sidebar from "./Sidebar";

const StyledLayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const StyledMainContent = styled.main`
  flex: 1;
  background-color: #ecf0f1;
  padding: 0px;
  overflow-y: auto;
`;

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <StyledLayoutContainer>
    <Sidebar />
    <StyledMainContent>{children}</StyledMainContent>
  </StyledLayoutContainer>
);

export default Layout;
