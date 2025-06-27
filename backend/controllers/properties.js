const Property = require('../models/property');
const { elasticClient } = require('../config/elasticsearch');
const cloudinary = require('cloudinary').v2;

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('agent', 'name email avatar');
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Search properties with Elasticsearch
// @route   POST /api/properties/search
// @access  Public
exports.searchProperties = async (req, res) => {
  const { query, filters } = req.body;

  try {
    const searchQuery = {
      index: 'properties',
      body: {
        query: {
          bool: {
            must: [],
            filter: [],
          },
        },
        sort: [
          { createdAt: { order: 'desc' } },
        ],
      },
    };

    // Text search
    if (query) {
      searchQuery.body.query.bool.must.push({
        multi_match: {
          query,
          fields: ['title', 'description', 'location.address', 'location.city'],
          fuzziness: 'AUTO',
        },
      });
    }

    // Price filter
    if (filters.priceRange) {
      searchQuery.body.query.bool.filter.push({
        range: {
          price: {
            gte: filters.priceRange.min,
            lte: filters.priceRange.max,
          },
        },
      });
    }

    // Property type filter
    if (filters.propertyType) {
      searchQuery.body.query.bool.filter.push({
        term: { propertyType: filters.propertyType },
      });
    }

    // Amenities filter
    if (filters.amenities && filters.amenities.length > 0) {
      searchQuery.body.query.bool.filter.push({
        terms: { amenities: filters.amenities },
      });
    }

    // Location filter (geo distance)
    if (filters.location && filters.location.lat && filters.location.lon) {
      searchQuery.body.query.bool.filter.push({
        geo_distance: {
          distance: filters.location.radius || '10km',
          'location': {
            lat: filters.location.lat,
            lon: filters.location.lon,
          },
        },
      });
    }

    const { body } = await elasticClient.search(searchQuery);
    const ids = body.hits.hits.map(hit => hit._id);

    // Get full property details from MongoDB
    const properties = await Property.find({
      _id: { $in: ids },
    }).populate('agent', 'name email avatar');

    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'agent',
      'name email avatar phone'
    );

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    res.status(500).send('Server error');
  }
};

// @desc    Create a property
// @route   POST /api/properties
// @access  Private (Agent/Admin)
exports.createProperty = async (req, res) => {
  const {
    title,
    description,
    price,
    address,
    city,
    state,
    zipcode,
    lat,
    lng,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    amenities,
  } = req.body;

  try {
    const newProperty = new Property({
      title,
      description,
      price,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address,
        city,
        state,
        zipcode,
      },
      propertyType,
      bedrooms,
      bathrooms,
      area,
      amenities: amenities ? amenities.split(',') : [],
      agent: req.user.id,
    });

    const property = await newProperty.save();

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Upload property images
// @route   PUT /api/properties/:id/images
// @access  Private (Agent/Admin)
exports.uploadImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check if user is property agent or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const uploader = async (path) => await cloudinary.uploader.upload(path, {
      folder: 'aashiyana-hub/properties',
    });

    const urls = [];
    const files = req.files;

    for (const file of files) {
      const { path } = file;
      const newPath = await uploader(path);
      urls.push({
        url: newPath.secure_url,
        public_id: newPath.public_id,
      });
    }

    property.images = [...property.images, ...urls];
    await property.save();

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:imageId
// @access  Private (Agent/Admin)
exports.deleteImage = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check if user is property agent or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const image = property.images.find(
      (img) => img.public_id === req.params.imageId
    );

    if (!image) {
      return res.status(404).json({ msg: 'Image not found' });
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // Remove from array
    property.images = property.images.filter(
      (img) => img.public_id !== req.params.imageId
    );

    await property.save();

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent/Admin)
exports.updateProperty = async (req, res) => {
  const {
    title,
    description,
    price,
    address,
    city,
    state,
    zipcode,
    lat,
    lng,
    propertyType,
    bedrooms,
    bathrooms,
    area,
    amenities,
    status,
  } = req.body;

  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check if user is property agent or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    property.title = title || property.title;
    property.description = description || property.description;
    property.price = price || property.price;
    property.propertyType = propertyType || property.propertyType;
    property.bedrooms = bedrooms || property.bedrooms;
    property.bathrooms = bathrooms || property.bathrooms;
    property.area = area || property.area;
    property.amenities = amenities ? amenities.split(',') : property.amenities;
    property.status = status || property.status;

    if (lat && lng) {
      property.location = {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address || property.location.address,
        city: city || property.location.city,
        state: state || property.location.state,
        zipcode: zipcode || property.location.zipcode,
      };
    }

    await property.save();

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent/Admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ msg: 'Property not found' });
    }

    // Check if user is property agent or admin
    if (property.agent.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Delete images from Cloudinary
    for (const image of property.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Delete from Elasticsearch
    try {
      await elasticClient.delete({
        index: 'properties',
        id: property._id.toString(),
      });
    } catch (elasticError) {
      console.error('Error deleting from Elasticsearch:', elasticError);
    }

    await property.remove();

    res.json({ msg: 'Property removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Property not found' });
    }
    res.status(500).send('Server error');
  }
};