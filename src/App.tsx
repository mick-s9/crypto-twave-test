import React, { useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import store, { AppDispatch } from './store/store';
import { fetchCryptos } from './store/cryptoSlice';
import CryptoList from './components/CryptoList';
import './styles/App.css';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchCryptos());
    const intervalId = setInterval(() => {
      dispatch(fetchCryptos());
    }, 60000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  return (
    <Container>
      <Typography className='crypto-title-page' variant="h4" component="h1" gutterBottom>
        Cryptocurrency Price Tracker
      </Typography>
      <CryptoList />
    </Container>
  );
};

const RootApp: React.FC = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default RootApp;
