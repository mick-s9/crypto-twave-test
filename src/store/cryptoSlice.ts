import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface CryptoState {
  cryptos: any[];
  selectedCryptos: any[];
  priceHistories: { [key: string]: any };
}

const initialState: CryptoState = {
  cryptos: [],
  selectedCryptos: [],
  priceHistories: {},
};

const symbolToIdMap: { [key: string]: string } = {
  btc: 'bitcoin',
  eth: 'ethereum',
  xrp: 'ripple',
  ltc: 'litecoin',
  bch: 'bitcoin-cash',
  ada: 'cardano',
  dot: 'polkadot',
  doge: 'dogecoin',
  bnb: 'binancecoin',
  link: 'chainlink'
};

export const fetchCryptos = createAsyncThunk('crypto/fetchCryptos', async () => {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
    params: {
      vs_currency: 'usd',
      ids: Object.values(symbolToIdMap).join(','),
    },
  });
  return response.data.map((crypto: any) => ({
    symbol: crypto.symbol,
    name: crypto.name,
    current_price: crypto.current_price,
  }));
});

export const fetchPriceHistory = createAsyncThunk(
  'crypto/fetchPriceHistory',
  async (symbol: string) => {
    const id = symbolToIdMap[symbol.toLowerCase()];
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: '30',
      },
    });
    return { symbol, prices: response.data.prices };
  }
);

const cryptoSlice = createSlice({
  name: 'crypto',
  initialState,
  reducers: {
    selectCrypto(state, action) {
      const symbol = action.payload;
      const crypto = state.cryptos.find(c => c.symbol === symbol);
      if (crypto && !state.selectedCryptos.some(c => c.symbol === symbol)) {
        state.selectedCryptos.push(crypto);
      }
    },
    removeCrypto(state, action) {
      const symbol = action.payload;
      state.selectedCryptos = state.selectedCryptos.filter(c => c.symbol !== symbol);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCryptos.fulfilled, (state, action) => {
      state.cryptos = action.payload;
    });
    builder.addCase(fetchPriceHistory.fulfilled, (state, action) => {
      const { symbol, prices } = action.payload;
      state.priceHistories[symbol] = prices;
    });
  },
});

export const { selectCrypto, removeCrypto } = cryptoSlice.actions;

export default cryptoSlice.reducer;
