import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

// Định nghĩa Interface cho Props của Pagination
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Khai báo kiểu trả về cho mảng chứa số trang và dấu '...'
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5; // Max page buttons to show
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust range
      if (currentPage <= 2) {
        end = Math.min(4, totalPages - 1);
      }
      if (currentPage >= totalPages - 1) {
        start = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center items-center mt-10 mb-6">
      <ul className="flex items-center gap-1.5">
        {/* Previous Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === 1
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
            aria-label="Trang trước"
          >
            <BsChevronLeft className="w-4 h-4" />
          </button>
        </li>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-10 h-10 text-gray-400 text-sm">
                ...
              </span>
            ) : (
              <button
                // TypeScript sẽ tự hiểu page ở đây là number vì đã check === '...' ở trên
                onClick={() => onPageChange(page as number)} 
                className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                  currentPage === page
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {page}
              </button>
            )}
          </li>
        ))}

        {/* Next Button */}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? 'text-gray-300 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
            }`}
            aria-label="Trang sau"
          >
            <BsChevronRight className="w-4 h-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}