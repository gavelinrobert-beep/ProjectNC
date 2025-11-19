/**
 * Global Search Component with keyboard shortcut (Ctrl+K / Cmd+K).
 * Searches across vehicles, drivers, packages, and facilities with debounced API calls.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setResults(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`${api.baseURL}/api/search?q=${encodeURIComponent(query)}`, {
          headers: api.authHeaders(),
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!results) return;

    const allResults = getAllResults();
    const maxIndex = allResults.length - 1;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      e.preventDefault();
      handleResultClick(allResults[selectedIndex]);
    }
  };

  // Get all results in a flat array
  const getAllResults = () => {
    if (!results) return [];

    const allResults = [];
    if (results.vehicles) allResults.push(...results.vehicles.map(r => ({ ...r, type: 'vehicle' })));
    if (results.drivers) allResults.push(...results.drivers.map(r => ({ ...r, type: 'driver' })));
    if (results.packages) allResults.push(...results.packages.map(r => ({ ...r, type: 'package' })));
    if (results.facilities) allResults.push(...results.facilities.map(r => ({ ...r, type: 'facility' })));
    if (results.inventory) allResults.push(...results.inventory.map(r => ({ ...r, type: 'inventory' })));
    return allResults;
  };

  // Handle result click
  const handleResultClick = (result) => {
    setIsOpen(false);
    setQuery('');
    setResults(null);

    // Navigate based on type
    switch (result.type) {
      case 'vehicle':
        navigate(`/assets?id=${result.id}`);
        break;
      case 'driver':
        navigate(`/drivers?id=${result.id}`);
        break;
      case 'package':
        navigate(`/shipments?id=${result.id}`);
        break;
      case 'facility':
        navigate(`/operations?facility=${result.id}`);
        break;
      case 'inventory':
        navigate(`/inventory?id=${result.id}`);
        break;
      default:
        break;
    }
  };

  // Render result item
  const renderResultItem = (item, index, type, icon) => {
    const isSelected = index === selectedIndex;

    return (
      <motion.div
        key={`${type}-${item.id}`}
        onClick={() => handleResultClick({ ...item, type })}
        style={{
          padding: '12px 16px',
          background: isSelected ? 'rgba(33, 150, 243, 0.2)' : 'transparent',
          borderLeft: isSelected ? '3px solid #2196F3' : '3px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
        whileHover={{ background: 'rgba(33, 150, 243, 0.15)' }}
      >
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#e0e0e0', fontSize: '0.95rem', fontWeight: '500' }}>
            {item.name || item.tracking_number || item.id}
          </div>
          <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>
            {type === 'vehicle' && item.license_plate}
            {type === 'driver' && item.email}
            {type === 'package' && `${item.status} - ${item.recipient_name}`}
            {type === 'facility' && item.type}
            {type === 'inventory' && `${item.category} - ${item.quantity} ${item.unit}`}
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            padding: '100px 20px',
            overflowY: 'auto',
          }}
          onClick={() => {
            setIsOpen(false);
            setQuery('');
            setResults(null);
          }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            style={{
              width: '100%',
              maxWidth: '600px',
              background: '#1a1a1a',
              borderRadius: '12px',
              border: '1px solid #333',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div style={{ padding: '20px', borderBottom: '1px solid #333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>🔍</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Sök fordon, förare, paket, anläggningar..."
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#e0e0e0',
                    fontSize: '1.1rem',
                    padding: '8px 0',
                  }}
                />
                <kbd
                  style={{
                    background: '#2a2a2a',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    color: '#888',
                  }}
                >
                  ESC
                </kbd>
              </div>
            </div>

            {/* Results */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                  <p>Söker...</p>
                </div>
              ) : !query || query.length < 2 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                  <p>Skriv minst 2 tecken för att söka</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>
                    Använd <kbd style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: '3px' }}>↑</kbd>{' '}
                    <kbd style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: '3px' }}>↓</kbd> för att
                    navigera
                  </p>
                </div>
              ) : !results || getAllResults().length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
                  <p>Inga resultat hittades</p>
                </div>
              ) : (
                <>
                  {/* Vehicles */}
                  {results.vehicles && results.vehicles.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#222',
                          color: '#888',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Fordon ({results.vehicles.length})
                      </div>
                      {results.vehicles.map((item, index) =>
                        renderResultItem(item, index, 'vehicle', '🚗')
                      )}
                    </div>
                  )}

                  {/* Drivers */}
                  {results.drivers && results.drivers.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#222',
                          color: '#888',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Förare ({results.drivers.length})
                      </div>
                      {results.drivers.map((item, index) =>
                        renderResultItem(
                          item,
                          (results.vehicles?.length || 0) + index,
                          'driver',
                          '👤'
                        )
                      )}
                    </div>
                  )}

                  {/* Packages */}
                  {results.packages && results.packages.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#222',
                          color: '#888',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Paket ({results.packages.length})
                      </div>
                      {results.packages.map((item, index) =>
                        renderResultItem(
                          item,
                          (results.vehicles?.length || 0) + (results.drivers?.length || 0) + index,
                          'package',
                          '📦'
                        )
                      )}
                    </div>
                  )}

                  {/* Facilities */}
                  {results.facilities && results.facilities.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#222',
                          color: '#888',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Anläggningar ({results.facilities.length})
                      </div>
                      {results.facilities.map((item, index) =>
                        renderResultItem(
                          item,
                          (results.vehicles?.length || 0) +
                            (results.drivers?.length || 0) +
                            (results.packages?.length || 0) +
                            index,
                          'facility',
                          '🏢'
                        )
                      )}
                    </div>
                  )}

                  {/* Inventory */}
                  {results.inventory && results.inventory.length > 0 && (
                    <div>
                      <div
                        style={{
                          padding: '12px 16px',
                          background: '#222',
                          color: '#888',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}
                      >
                        Lager ({results.inventory.length})
                      </div>
                      {results.inventory.map((item, index) =>
                        renderResultItem(
                          item,
                          (results.vehicles?.length || 0) +
                            (results.drivers?.length || 0) +
                            (results.packages?.length || 0) +
                            (results.facilities?.length || 0) +
                            index,
                          'inventory',
                          '📦'
                        )
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
