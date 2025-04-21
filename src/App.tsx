import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BuscarUsuarios from "./pages/BuscarUsuarios";
import ChequearHiveSBI from "./pages/ChequearHiveSBI";
import UltimosAgregados from "./pages/UltimosAgregados";

//TODO keep coding
// refs:
//  - https://api.hivesbi.com/v1/members/theghost1980/

const App = () => (
  <ChakraProvider value={defaultSystem}>
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/buscar-usuarios" element={<BuscarUsuarios />} />
        <Route path="/chequear-hive-sbi" element={<ChequearHiveSBI />} />
        <Route path="/ultimos-agregados" element={<UltimosAgregados />} />
      </Routes>
    </Router>
  </ChakraProvider>
);

export default App;
