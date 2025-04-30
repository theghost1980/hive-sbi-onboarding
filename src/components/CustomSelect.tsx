import React, { useState } from "react";
import styled from "styled-components";
import { Option } from "../types/selectors.type";

const StyledContainer = styled.div<{ $isOpen: boolean }>`
  position: relative;
  width: 100%;
  margin-bottom: 15px; /* Add some space below the select */
`;

const StyledSelected = styled.div`
  padding: 0.5rem 1rem; /* Increased padding slightly */
  border: 1px solid #ccc;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: #999;
  }
`;

const StyledArrowIcon = styled.span<{ $isOpen: boolean }>`
  margin-left: 1rem; /* Increased space */
  transition: transform 0.2s ease;
  transform: rotate(${(props) => (props.$isOpen ? "180deg" : "0deg")});
  color: #555; /* Color for the arrow */
`;

const StyledPlaceholder = styled.span`
  color: #888;
`;

const StyledOptions = styled.ul`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  list-style: none;
  margin: 0;
  padding: 0;
  z-index: 1000;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
`;

const StyledOption = styled.li`
  padding: 0.75rem 1rem; /* Adjusted padding */
  display: flex;
  align-items: center;
  cursor: pointer;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f0f0f0;
  }
`;

const StyledIcon = styled.span`
  margin-right: 0.75rem; /* Adjusted space */
  display: flex;

  svg {
    /* Style the SVG element rendered by react-icons */
    font-size: 1.1rem; /* Icon size */
    color: #555; /* Default icon color */
  }
`;

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
      <StyledIcon>{selectedOption.icon && <selectedOption.icon />}</StyledIcon>
      {selectedOption.label}
    </>
  ) : (
    <StyledPlaceholder>Seleccione una opción</StyledPlaceholder>
  );

  return (
    <StyledContainer $isOpen={isOpen}>
      <StyledSelected onClick={() => setIsOpen(!isOpen)}>
        {displayContent}
        <StyledArrowIcon $isOpen={isOpen}>&#9660;</StyledArrowIcon>
      </StyledSelected>
      {isOpen && (
        <StyledOptions>
          {options.map((option) => (
            <StyledOption
              key={option.value}
              onClick={() => handleSelect(option)}
            >
              <StyledIcon>{option.icon && <option.icon />}</StyledIcon>
              {option.label}
            </StyledOption>
          ))}
        </StyledOptions>
      )}
    </StyledContainer>
  );
};

export default CustomSelect;
