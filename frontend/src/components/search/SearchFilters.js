import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchProperties } from '../../features/properties/propertySlice';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const SearchFilters = () => {
  const dispatch = useDispatch();
  const { loading, properties } = useSelector((state) => state.property);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: { min: 0, max: 1000000 },
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    amenities: [],
    location: null,
    radius: 10,
  });

  const propertyTypes = ['house', 'apartment', 'condo', 'land', 'commercial'];
  const amenitiesList = [
    'parking',
    'gym',
    'pool',
    'garden',
    'security',
    'furnished',
    'wifi',
    'air conditioning',
  ];

  const handleSearch = () => {
    dispatch(searchProperties({ query: searchQuery, filters }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setFilters((prev) => ({
          ...prev,
          location: {
            lat: e.latlng.lat,
            lon: e.latlng.lng,
            radius: prev.radius,
          },
        }));
      },
    });

    return filters.location ? (
      <Marker
        position={[filters.location.lat, filters.location.lon]}
        icon={L.icon({
          iconUrl: '/marker-icon.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })}
      />
    ) : null;
  };

  useEffect(() => {
    if (searchQuery || Object.values(filters).some((val) => val !== '' && val !== null)) {
      handleSearch();
    }
  }, [filters]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Search Properties</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by location, property type, etc."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Price Range</h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={filters.priceRange.min}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: {
                      ...filters.priceRange,
                      min: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
              <span>${filters.priceRange.min.toLocaleString()}</span>
              <span>-</span>
              <span>${filters.priceRange.max.toLocaleString()}</span>
              <input
                type="range"
                min="0"
                max="1000000"
                step="10000"
                value={filters.priceRange.max}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: {
                      ...filters.priceRange,
                      max: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      propertyType: filters.propertyType === type ? '' : type,
                    })
                  }
                  className={`px-4 py-2 rounded-full text-sm ${
                    filters.propertyType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Amenities</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={filters.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="mr-2"
                  />
                  <label htmlFor={amenity}>
                    {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <h3 className="text-lg font-semibold mb-3">Location</h3>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapContainer
              center={[20.5937, 78.9629]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
            </MapContainer>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium mb-1">Radius (km)</label>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.radius}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  radius: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
            <span>{filters.radius} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;