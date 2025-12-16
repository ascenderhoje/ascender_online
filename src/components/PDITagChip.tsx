import { Hash } from 'lucide-react';

interface PDITagChipProps {
  name: string;
  small?: boolean;
  variant?: 'default' | 'primary' | 'success';
}

export const PDITagChip = ({ name, small = false, variant = 'default' }: PDITagChipProps) => {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${variants[variant]} ${
        small ? 'text-xs' : 'text-sm'
      }`}
    >
      <Hash size={small ? 12 : 14} />
      <span>{name}</span>
    </span>
  );
};
