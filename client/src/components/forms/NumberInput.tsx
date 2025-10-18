// ODANET Revizyon – NumberInput bileşeni
// Artı/eksi stepper'ları olmayan, sadece sayısal giriş yapılabilen input
import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: string | number;
  onChange?: (value: string) => void;
  min?: number;
  max?: number;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value = "", onChange, min, max, className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Sadece rakam karakterlerine izin ver
      const numericValue = inputValue.replace(/[^0-9]/g, '');
      
      // Min/max kontrolü
      if (numericValue !== '') {
        const numValue = parseInt(numericValue, 10);
        if (min !== undefined && numValue < min) return;
        if (max !== undefined && numValue > max) return;
      }
      
      onChange?.(numericValue);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        className={className}
        {...props}
        data-testid={props['data-testid'] || 'number-input'}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export default NumberInput;
