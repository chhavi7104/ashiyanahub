const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: String,
    city: String,
    state: String,
    zipcode: String,
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'condo', 'land', 'commercial'],
    required: true,
  },
  bedrooms: {
    type: Number,
  },
  bathrooms: {
    type: Number,
  },
  area: {
    type: Number,
  },
  amenities: [String],
  images: [
    {
      url: String,
      public_id: String,
    },
  ],
  floorPlan: {
    type: String,
  },
  virtualTour: {
    type: String,
  },
  status: {
    type: String,
    enum: ['available', 'pending', 'sold'],
    default: 'available',
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

PropertySchema.index({ location: '2dsphere' });

// Middleware to sync with Elasticsearch
PropertySchema.post('save', async function (doc) {
  try {
    const { elasticClient } = require('../config/elasticsearch');
    await elasticClient.index({
      index: 'properties',
      id: doc._id.toString(),
      body: {
        title: doc.title,
        description: doc.description,
        price: doc.price,
        location: {
          lat: doc.location.coordinates[1],
          lon: doc.location.coordinates[0],
        },
        amenities: doc.amenities,
        propertyType: doc.propertyType,
        createdAt: doc.createdAt,
      },
    });
  } catch (error) {
    console.error('Error indexing property in Elasticsearch:', error);
  }
});

module.exports = mongoose.model('Property', PropertySchema);