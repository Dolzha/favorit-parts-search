import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchBrands, fetchOffers } from './api';

export const searchBrands = createAsyncThunk('search/brands', (number, { signal }) =>
  fetchBrands(number, signal),
);

export const searchOffers = createAsyncThunk('search/offers', ({ number, brand }, { signal }) =>
  fetchOffers(number, brand, signal),
);

// status: idle | loading | done | error
const initialState = {
  query: '',
  brands: { status: 'idle', items: [], error: null, requestId: null },
  selected: null,
  offers: { status: 'idle', items: [], error: null, requestId: null },
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchBrands.pending, (state, action) => {
        state.query = action.meta.arg;
        state.brands = { status: 'loading', items: [], error: null, requestId: action.meta.requestId };
        state.selected = null;
        state.offers = initialState.offers;
      })
      .addCase(searchBrands.fulfilled, (state, action) => {
        // Ответ на устаревший запрос (пользователь уже ввёл другой номер) игнорируем
        if (state.brands.requestId !== action.meta.requestId) return;
        state.brands.status = 'done';
        state.brands.items = action.payload;
      })
      .addCase(searchBrands.rejected, (state, action) => {
        if (state.brands.requestId !== action.meta.requestId || action.meta.aborted) return;
        state.brands.status = 'error';
        state.brands.error = action.error.message;
      })
      .addCase(searchOffers.pending, (state, action) => {
        state.selected = action.meta.arg;
        state.offers = { status: 'loading', items: [], error: null, requestId: action.meta.requestId };
      })
      .addCase(searchOffers.fulfilled, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId) return;
        state.offers.status = 'done';
        state.offers.items = action.payload;
      })
      .addCase(searchOffers.rejected, (state, action) => {
        if (state.offers.requestId !== action.meta.requestId || action.meta.aborted) return;
        state.offers.status = 'error';
        state.offers.error = action.error.message;
      });
  },
});

export const { reset } = searchSlice.actions;

export const store = configureStore({
  reducer: { search: searchSlice.reducer },
});
