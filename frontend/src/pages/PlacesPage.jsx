import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  Calendar,
  Eye,
  Scale,
  Map as MapIcon,
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Droplets
} from 'lucide-react';
import { getPlaces } from '../services/api';
import AndhraPradeshMap from '../components/AndhraPradeshMap';
import CityComparisonModal from '../components/CityComparisonModal';

export const PlacesPage = () => {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const fetchPlacesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPlaces();
      if (res && res.places) {
        setPlaces(res.places);
      }
    } catch (err) {
      console.error('[PlacesPage] Fetch error:', err);
      setError('Unable to load Andhra Pradesh regional water quality locations. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacesData();
  }, []);

  // Compute unique districts for filter dropdown
  const uniqueDistricts = useMemo(() => {
    const list = places.map((p) => p.district_name);
    return [...new Set(list)].sort();
  }, [places]);

  // Filter and sort places
  const filteredPlaces = useMemo(() => {
    let result = [...places];

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.city_name.toLowerCase().includes(q) ||
          p.district_name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // District filter
    if (districtFilter !== 'all') {
      result = result.filter((p) => p.district_name.toLowerCase() === districtFilter.toLowerCase());
    }

    // Availability filter
    if (availabilityFilter === 'available') {
      result = result.filter((p) => p.data_available);
    } else if (availabilityFilter === 'unavailable') {
      result = result.filter((p) => !p.data_available);
    }

    // Sorting
    if (sortOrder === 'name_asc') {
      result.sort((a, b) => a.city_name.localeCompare(b.city_name));
    } else if (sortOrder === 'name_desc') {
      result.sort((a, b) => b.city_name.localeCompare(a.city_name));
    } else if (sortOrder === 'latest_date') {
      result.sort((a, b) => {
        const da = a.latest_sample_date ? new Date(a.latest_sample_date).getTime() : 0;
        const db = b.latest_sample_date ? new Date(b.latest_sample_date).getTime() : 0;
        return db - da;
      });
    }

    return result;
  }, [places, searchTerm, districtFilter, availabilityFilter, sortOrder]);

  return (
    <div className="page-container" style={{ padding: '24px', maxWidth: '1560px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: 20
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Andhra Pradesh Water Quality Monitoring
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                Monitor water-quality measurements, historical trends, and monitoring-station information across selected locations in Andhra Pradesh.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View Mode Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '2px'
              }}
            >
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'grid' ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <LayoutGrid size={15} />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                title="Interactive Map View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: viewMode === 'map' ? 'var(--primary)' : 'transparent',
                  color: viewMode === 'map' ? '#FFFFFF' : 'var(--text-secondary)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <MapIcon size={15} />
                <span>Map</span>
              </button>
            </div>

            {/* Compare Cities Trigger */}
            <button
              onClick={() => setIsCompareOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              <Scale size={16} style={{ color: 'var(--primary)' }} />
              <span>Compare Cities</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={fetchPlacesData}
              title="Refresh Data"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xs)'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search city, district, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        {/* District Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Filter size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">All Districts ({places.length})</option>
            {uniqueDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Data Availability Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Droplets size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="all">All Availability Statuses</option>
            <option value="available">Data Available (10)</option>
            <option value="unavailable">No Data (0)</option>
          </select>
        </div>

        {/* Sort Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            <option value="name_asc">City Name (A - Z)</option>
            <option value="name_desc">City Name (Z - A)</option>
            <option value="latest_date">Latest Sample Date First</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {error && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-border)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={fetchPlacesData}
            style={{
              marginLeft: 'auto',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--danger)',
              backgroundColor: 'transparent',
              color: 'var(--danger)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Interactive Map View */}
      {viewMode === 'map' && (
        <AndhraPradeshMap
          locations={filteredPlaces}
          onSelectLocation={(id) => navigate(`/places/${id}`)}
        />
      )}

      {/* Location Cards Grid View */}
      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                height: 240,
                borderRadius: 'var(--radius-xl)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                opacity: 0.6,
                animation: 'pulse 1.5s infinite ease-in-out'
              }}
            />
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)'
          }}
        >
          <MapPin size={40} style={{ color: 'var(--text-muted)', marginBottom: 12, opacity: 0.4 }} />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            No locations found matching your criteria
          </h3>
          <p style={{ margin: '8px 0 16px 0', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Try resetting your search query or adjusting your district filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setDistrictFilter('all');
              setAvailabilityFilter('all');
            }}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20
          }}
        >
          {filteredPlaces.map((loc) => {
            const formattedDate = loc.latest_sample_date
              ? new Date(loc.latest_sample_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : 'Data Not Available';

            return (
              <div
                key={loc.location_id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-xl)',
                  border: '1px solid var(--border-color)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.borderColor = 'var(--primary-border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Card Header */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--primary)',
                        backgroundColor: 'var(--primary-subtle)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {loc.district_name}
                    </span>

                    {/* Data Availability Status Pill */}
                    {loc.data_available ? (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--success)',
                          backgroundColor: 'var(--success-bg)',
                          border: '1px solid var(--success-border)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <CheckCircle2 size={11} /> Data Available
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          color: 'var(--warning)',
                          backgroundColor: 'var(--warning-bg)',
                          border: '1px solid var(--warning-border)',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Clock size={11} /> Pending
                      </span>
                    )}
                  </div>

                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {loc.city_name}
                  </h3>

                  <p
                    style={{
                      margin: '6px 0 0 0',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.45,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {loc.description}
                  </p>
                </div>

                {/* Key Metadata Rows */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      <Building2 size={13} />
                      <span>Stations</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                      {loc.station_count} {loc.station_count === 1 ? 'Station' : 'Stations'}
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                      <Calendar size={13} />
                      <span>Latest Date</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                      {formattedDate}
                    </div>
                  </div>
                </div>

                {/* Bottom View Details Button */}
                <button
                  onClick={() => navigate(`/places/${loc.location_id}`)}
                  style={{
                    marginTop: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    padding: '10px 16px',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary-border)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                >
                  <Eye size={15} />
                  <span>View Details</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison Modal */}
      <CityComparisonModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        allLocations={places}
      />
    </div>
  );
};

export default PlacesPage;

