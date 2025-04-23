import { useEffect, useState } from "react";
import { FaAccessibleIcon, FaBaby } from "react-icons/fa";
import CustomSelect from "../components/CustomSelect";
import { Option } from "../types/selectors.type";

interface Account {
  name: string;
  created: Date;
}

const options: Option[] = [
  { value: "name", label: "Registrados en las ultimas 24 horas", icon: FaBaby },
  {
    value: "email",
    label: "Registrados desde hace 30 dias - Sin muchos votos",
    icon: FaAccessibleIcon,
  },
];

const BuscarUsuarios = () => {
  const [selectedValue, setSelectedValue] = useState<string>("");

  const handleChange = (value: string) => {
    console.log({ value });
    setSelectedValue(value);
  };

  useEffect(() => {
    tryFind();
  }, []);

  const tryFind = async () => {};

  return (
    <div>
      <h1>Buscar nuevos usuarios</h1>
      <CustomSelect
        options={options}
        value={selectedValue}
        onChange={handleChange}
      />
    </div>
  );
};

export default BuscarUsuarios;
