import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../features/properties/propertySlice';
import PropertyForm from '../components/properties/PropertyForm';

const AddProperty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.property);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createProperty(formData))
      .unwrap()
      .then(() => {
        navigate('/my-properties');
      })
      .catch((error) => {
        console.error('Error creating property:', error);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Property</h1>
      <PropertyForm 
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AddProperty;