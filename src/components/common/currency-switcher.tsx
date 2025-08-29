'use client';

import { useCurrency } from '@/context/currency-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();

  return (
    <Select
      value={currency}
      onValueChange={(value: 'USD' | 'BDT') => setCurrency(value)}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">USD ($)</SelectItem>
        <SelectItem value="BDT">BDT (৳)</SelectItem>
      </SelectContent>
    </Select>
  );
}
