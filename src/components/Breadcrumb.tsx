import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  link?: string; // Nếu không có link thì nó là trang hiện tại
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-gray-500 mb-4 flex items-center gap-1.5 flex-wrap ${className}`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1.5">
            {item.link ? (
              <Link 
                to={item.link} 
                onClick={item.onClick}
                className="hover:text-rose-600 transition-colors"
              >
                {item.label}
              </Link>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-rose-600 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {item.label}
              </span>
            )}
            
            {/* Nếu chưa phải item cuối cùng thì render dấu cách / */}
            {!isLast && (
              <span className="text-gray-300 select-none">/</span>
            )}
          </div>
        );
      })}
    </nav>
  );
}