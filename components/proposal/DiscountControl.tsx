import React from 'react';
import { Discount } from '@/lib/proposalUtils';
import { commonClasses } from '@/lib/design-system';

interface DiscountControlProps {
  id: string;
  label: string;
  discount: Discount;
  maxValue?: number;
  onChange: (value: number, type: 'percentage' | 'absolute') => void;
  className?: string;
}

const DiscountControl: React.FC<DiscountControlProps> = ({
  id,
  label,
  discount,
  maxValue = 0,
  onChange,
  className = '',
}) => {
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const limitedValue = discount.type === 'percentage' 
      ? Math.min(newValue, 100) 
      : (maxValue > 0 ? Math.min(newValue, maxValue) : newValue);
    
    onChange(limitedValue, discount.type);
  };

  const toggleDiscountType = () => {
    const newType = discount.type === 'percentage' ? 'absolute' : 'percentage';
    
    // When switching to absolute from percentage, convert the percentage to an absolute value
    // When switching to percentage from absolute, cap at 100%
    let newValue = discount.value;
    
    if (newType === 'absolute' && discount.type === 'percentage' && maxValue > 0) {
      // Convert percentage to absolute
      newValue = (maxValue * discount.value) / 100;
    } else if (newType === 'percentage' && discount.type === 'absolute' && maxValue > 0) {
      // Convert absolute to percentage
      newValue = (discount.value / maxValue) * 100;
      newValue = Math.min(newValue, 100);
    }
    
    onChange(Math.round(newValue * 100) / 100, newType);
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <label htmlFor={id} className={`${commonClasses.label}`}>
        {label}
      </label>
      <div className="flex items-center">
        <input
          id={id}
          type="number"
          min="0"
          max={discount.type === 'percentage' ? 100 : undefined}
          value={discount.value}
          onChange={handleValueChange}
          className={`w-20 ${commonClasses.input} rounded-md px-2 py-1 text-right focus:outline-none focus:ring-1 focus:ring-border-focus`}
        />
        <button
          type="button"
          onClick={toggleDiscountType}
          className="ml-2 bg-surface-interactive hover:bg-interactive-secondary-hover text-text-primary px-2 py-1 rounded transition-colors text-sm whitespace-nowrap min-w-14"
        >
          {discount.type === 'percentage' ? '%' : 'AED'}
        </button>
      </div>
    </div>
  );
};

export default DiscountControl;
