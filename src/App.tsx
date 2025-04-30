import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import BuscarUsuarios from "./pages/BuscarUsuarios";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import OnBoardUser from "./pages/OnboardUser";
import GlobalStyles from "./styles/GlobalStyles";

const App = () => (
  <>
    <GlobalStyles />
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* //Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboard-user" element={<OnBoardUser />} />
              <Route path="/buscar-usuarios" element={<BuscarUsuarios />} />
              {/* //TODO enable routes below when needed */}
              {/* <Route path="/chequear-hive-sbi" element={<ChequearHiveSBI />} /> */}
              {/* <Route path="/ultimos-agregados" element={<UltimosAgregados />} /> */}
            </Route>
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  </>
);

export default App;
