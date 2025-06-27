import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProperties } from '../features/properties/propertySlice';

const Properties = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { properties, loading } = useSelector((state) => state.property);

  useEffect(() => {
    dispatch(getProperties());
  }, [dispatch]);

  // Filter properties to only show those owned by the current user
  const myProperties = properties.filter(
    (property) => property.agent?._id === user?._id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Properties</h1>
        <Link to="/add-property" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add New Property
        </Link>
      </div>

      {loading ? (
        <p>Loading your properties...</p>
      ) : myProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProperties.map((property) => (
            <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={property.images[0]?.url || '/placeholder-property.jpg'} 
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-gray-600 mb-2">${property.price.toLocaleString()}</p>
                <p className={`mb-2 ${
                  property.status === 'available' ? 'text-green-600' : 
                  property.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  Status: {property.status}
                </p>
                <div className="flex justify-between">
                  <Link 
                    to={`/property/${property._id}`} 
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                  <Link 
                    to={`/edit-property/${property._id}`}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl mb-4">You haven't listed any properties yet</p>
          <Link 
            to="/add-property" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
          >
            List Your First Property
          </Link>
        </div>
      )}
    </div>
  );
};

export default Properties;