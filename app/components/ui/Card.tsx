import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow ${
        padding ? 'p-6' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
