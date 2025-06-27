import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  properties: [],
  property: null,
  loading: false,
  error: null,
  filtered: false,
};

// Get all properties
export const getProperties = createAsyncThunk(
  'property/getProperties',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/properties');
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Search properties
export const searchProperties = createAsyncThunk(
  'property/searchProperties',
  async (searchData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const res = await axios.post('/api/properties/search', searchData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Get single property
export const getProperty = createAsyncThunk(
  'property/getProperty',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/properties/${id}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Create property
export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      const res = await axios.post('/api/properties', formData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update property
export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ id, formData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
      };

      const res = await axios.put(`/api/properties/${id}`, formData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Upload property images
export const uploadImages = createAsyncThunk(
  'property/uploadImages',
  async ({ id, images }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token,
        },
      };

      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const res = await axios.put(`/api/properties/${id}/images`, formData, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Delete property image
export const deleteImage = createAsyncThunk(
  'property/deleteImage',
  async ({ id, imageId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      const res = await axios.delete(`/api/properties/${id}/images/${imageId}`, config);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Delete property
export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;

      const config = {
        headers: {
          'x-auth-token': token,
        },
      };

      await axios.delete(`/api/properties/${id}`, config);
      return id;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    clearProperty: (state) => {
      state.property = null;
      state.loading = false;
      state.error = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProperties.pending, (state) => {
        state.loading = true;
        state.filtered = false;
      })
      .addCase(getProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
        state.filtered = false;
      })
      .addCase(getProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(searchProperties.pending, (state) => {
        state.loading = true;
        state.filtered = true;
      })
      .addCase(searchProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload;
        state.filtered = true;
      })
      .addCase(searchProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload;
      })
      .addCase(getProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = [action.payload, ...state.properties];
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.map((property) =>
          property._id === action.payload._id ? action.payload : property
        );
        state.property = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadImages.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadImages.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload;
      })
      .addCase(uploadImages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteImage.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = state.properties.filter(
          (property) => property._id !== action.payload
        );
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProperty, clearErrors } = propertySlice.actions;
export default propertySlice.reducer;