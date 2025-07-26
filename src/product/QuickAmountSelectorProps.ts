
export interface QuickAmountSelectorProps {
  amounts?: string[];
  selectedAmount?: string;
  onSelect: (amount: string) => void;
}
