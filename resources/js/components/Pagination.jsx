import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  // Calculate which page numbers to show
  const pageNumbers = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = startPage + maxPagesToShow - 1;
  
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <button 
        disabled={currentPage === 1} 
        onClick={() => onPageChange(currentPage - 1)}
        style={{ 
          padding: '8px', 
          borderRadius: '8px', 
          border: '1px solid var(--border)', 
          background: currentPage === 1 ? 'var(--bg-color)' : 'var(--surface)', 
          color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-main)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
        <ChevronLeft size={18} />
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            border: currentPage === number ? 'none' : '1px solid var(--border)',
            background: currentPage === number ? 'var(--primary)' : 'var(--surface)',
            color: currentPage === number ? '#ffffff' : 'var(--text-main)',
            fontWeight: currentPage === number ? '700' : '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '0.9rem'
          }}
        >
          {number}
        </button>
      ))}

      <button 
        disabled={currentPage === totalPages} 
        onClick={() => onPageChange(currentPage + 1)}
        style={{ 
          padding: '8px', 
          borderRadius: '8px', 
          border: '1px solid var(--border)', 
          background: currentPage === totalPages ? 'var(--bg-color)' : 'var(--surface)', 
          color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-main)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s'
        }}>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
