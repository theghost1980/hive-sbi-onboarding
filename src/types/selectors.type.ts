export interface Option {
  value: string;
  label: string;
  icon: React.ElementType;
}

export interface SearchTypeSelectorProps {
  options: Option[];
  onChange: (value: string) => void;
  value: string;
}
