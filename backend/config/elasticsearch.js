const { Client } = require('@elastic/elasticsearch');

const elasticClient = new Client({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

const createIndex = async (indexName) => {
  try {
    const { body: exists } = await elasticClient.indices.exists({ index: indexName });
    if (!exists) {
      await elasticClient.indices.create({ index: indexName });
      console.log(`Created index: ${indexName}`);
    }
  } catch (error) {
    console.error(`Error creating index ${indexName}:`, error);
  }
};

const setupPropertyMappings = async () => {
  try {
    await elasticClient.indices.putMapping({
      index: 'properties',
      body: {
        properties: {
          title: { type: 'text' },
          description: { type: 'text' },
          price: { type: 'double' },
          location: {
            type: 'geo_point',
          },
          amenities: { type: 'keyword' },
          propertyType: { type: 'keyword' },
          createdAt: { type: 'date' },
        },
      },
    });
    console.log('Property mappings created');
  } catch (error) {
    console.error('Error setting up property mappings:', error);
  }
};

module.exports = { elasticClient, createIndex, setupPropertyMappings };