import { Box, Stack } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { ChakraNavLink } from "./ChakraNavLink";

const Sidebar = () => (
  <Box
    position="fixed"
    left={0}
    top={0}
    w="200px"
    h="100vh"
    bg="gray.100"
    p={4}
  >
    <Stack gap={4} alignItems="stretch" direction="column">
      <ChakraNavLink as={NavLink} to="/buscar-usuarios">
        Buscar nuevos usuarios
      </ChakraNavLink>
      <ChakraNavLink as={NavLink} to="/chequear-hive-sbi">
        Chequear usuario en Hive SBI
      </ChakraNavLink>
      <ChakraNavLink as={NavLink} to="/ultimos-agregados">
        Mostrar últimos agregados en HSBI
      </ChakraNavLink>
    </Stack>
  </Box>
);

export default Sidebar;
