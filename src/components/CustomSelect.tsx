import React, { useState } from "react";
import { Option } from "../types/selectors.type";
import "./CustomSelect.css";

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  const displayContent = selectedOption ? (
    <>
      <span className={"icon"}>
        {selectedOption.icon && <selectedOption.icon />}
      </span>
      {selectedOption.label}
    </>
  ) : (
    <span className={"placeholder-text"}>Seleccione una opción</span>
  );

  return (
    <div className={`container ${isOpen ? "open" : ""}`}>
      <div className={"selected"} onClick={() => setIsOpen(!isOpen)}>
        {displayContent}
        <span className={"arrow-icon"}>&#9660;</span>
      </div>
      {isOpen && (
        <ul className={"options"}>
          {options.map((option) => (
            <li
              key={option.value}
              className={"option"}
              onClick={() => handleSelect(option)}
            >
              <span className={"icon"}>{option.icon && <option.icon />}</span>
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
