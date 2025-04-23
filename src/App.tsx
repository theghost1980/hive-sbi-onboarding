import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import BuscarUsuarios from "./pages/BuscarUsuarios";
import ChequearHiveSBI from "./pages/ChequearHiveSBI";
import Home from "./pages/Home";
import UltimosAgregados from "./pages/UltimosAgregados";

//TODO keep coding
// refs:
//  - https://api.hivesbi.com/v1/members/theghost1980/

//TODO to prevent abuse and misuse:
//  add login by Keychain + backend json same as index admins

const App = () => (
  <div>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/buscar-usuarios" element={<BuscarUsuarios />} />
          <Route path="/chequear-hive-sbi" element={<ChequearHiveSBI />} />
          <Route path="/ultimos-agregados" element={<UltimosAgregados />} />
        </Routes>
      </Layout>
    </Router>
  </div>
);

export default App;
