import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty, updateProperty } from '../features/properties/propertySlice';
import PropertyForm from '../components/properties/PropertyForm';

const EditProperty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { property, isLoading } = useSelector((state) => state.property);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    lat: '',
    lng: '',
    propertyType: 'house',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: [],
  });

  useEffect(() => {
    dispatch(getProperty(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        price: property.price,
        address: property.location?.address || '',
        city: property.location?.city || '',
        state: property.location?.state || '',
        zipcode: property.location?.zipcode || '',
        lat: property.location?.coordinates[1] || '',
        lng: property.location?.coordinates[0] || '',
        propertyType: property.propertyType,
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area: property.area || '',
        amenities: property.amenities || [],
      });
    }
  }, [property]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProperty({ id, formData }))
      .unwrap()
      .then(() => {
        navigate(`/property/${id}`);
      })
      .catch((error) => {
        console.error('Error updating property:', error);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Property</h1>
      {property ? (
        <PropertyForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditMode={true}
        />
      ) : (
        <p>Loading property details...</p>
      )}
    </div>
  );
};

export default EditProperty;