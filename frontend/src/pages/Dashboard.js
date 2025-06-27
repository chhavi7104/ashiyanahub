import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProperties } from '../features/properties/propertySlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { properties, loading } = useSelector((state) => state.property);

  useEffect(() => {
    dispatch(getProperties());
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        {['admin', 'agent'].includes(user?.role) && (
          <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add Property
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading properties...</p>
        ) : properties?.length > 0 ? (
          properties.map((property) => (
            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={property.images[0]?.url || '/placeholder-property.jpg'} 
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">${property.price.toLocaleString()}</p>
                <div className="flex justify-between items-center">
                  <Link 
                    to={`/property/${property._id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                  {user?._id === property.agent?._id && (
                    <Link 
                      to={`/edit-property/${property._id}`}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Edit
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No properties found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;