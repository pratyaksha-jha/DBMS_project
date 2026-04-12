import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

function SearchableSelect({ options = [], value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const repositionTimeoutRef = useRef(null);

  const filtered = (options || []).filter(o =>
    String(o).toLowerCase().includes(search.toLowerCase())
  );

  // Compute dropdown position from the trigger element's bounding rect
  const updateDropdownPosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      // Check if there's enough space below, otherwise show above
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const shouldShowAbove = spaceBelow < 320 && spaceAbove > 320;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        top: shouldShowAbove ? rect.top - 304 : rect.bottom + 4,
        width: rect.width,
        zIndex: 99999,
        background: '#1f2937',
        border: '1px solid #374151',
        borderRadius: 8,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        pointerEvents: 'auto',
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      // Use setTimeout to ensure the input is focused after rendering
      const focusTimeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(focusTimeout);
    }
  }, [isOpen]);

  // Reposition on scroll or resize (with debounce to prevent flickering)
  useEffect(() => {
    if (!isOpen) return;

    const handler = () => {
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
      repositionTimeoutRef.current = setTimeout(() => {
        updateDropdownPosition();
      }, 50);
    };

    window.addEventListener('scroll', handler, true);
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('scroll', handler, true);
      window.removeEventListener('resize', handler);
      if (repositionTimeoutRef.current) {
        clearTimeout(repositionTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        !document.getElementById('searchable-select-portal')?.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [isOpen]);

  const dropdown = isOpen
    ? ReactDOM.createPortal(
        <div id="searchable-select-portal" style={dropdownStyle}>
          <input
            ref={inputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Type to filter..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              border: 'none',
              borderBottom: '1px solid #374151',
              background: '#111827',
              color: 'white',
              outline: 'none',
              fontSize: 14,
            }}
          />
          <div
            style={{
              maxHeight: 300,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4b5563 #1f2937',
            }}
          >
            {filtered.length === 0 ? (
              <div style={{ padding: '12px', color: '#6b7280', fontSize: 13, textAlign: 'center' }}>
                No data found
              </div>
            ) : (
              filtered.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#374151')}
                  onMouseLeave={e => (e.currentTarget.style.background = opt === value ? '#2d3748' : 'transparent')}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    fontSize: 14,
                    background: opt === value ? '#2d3748' : 'transparent',
                    color: opt === value ? '#22d3ee' : 'white',
                    borderBottom: '1px solid #2d3748',
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%', minWidth: 220 }}>
      <div
        onClick={() => setIsOpen(o => !o)}
        style={{
          padding: '10px 14px',
          border: '1px solid #374151',
          borderRadius: 8,
          cursor: 'pointer',
          background: '#1f2937',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          transition: 'border-color 0.2s',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 14 }}>
          {value || placeholder}
        </span>
        <span style={{ fontSize: 10, color: '#9ca3af' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {dropdown}
    </div>
  );
}

export default SearchableSelect;