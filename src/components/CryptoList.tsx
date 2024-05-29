import React, { useState, useEffect } from 'react';
import { List, TextField, IconButton, ListItemText, Collapse, InputAdornment } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector, useDispatch } from 'react-redux';
import Marquee from 'react-fast-marquee';
import { RootState, AppDispatch } from '../store/store';
import { selectCrypto, removeCrypto, fetchCryptos, fetchPriceHistory } from '../store/cryptoSlice';
import CryptoItem from './CryptoItem';
import CryptoChart from './CryptoChart';
import '../styles/CryptoComponents.css';

const CryptoList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cryptos = useSelector((state: RootState) => state.crypto.cryptos);
  const selectedCryptos = useSelector((state: RootState) => state.crypto.selectedCryptos);
  const priceHistories = useSelector((state: RootState) => state.crypto.priceHistories);
  const [searchTerm, setSearchTerm] = useState('');
  const [openedCharts, setOpenedCharts] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    dispatch(fetchCryptos());
  }, [dispatch]);

  const handleSelectCrypto = (symbol: string) => {
    const isSelected = selectedCryptos.some(c => c.symbol === symbol);
    if (isSelected) {
      return;
    }
    dispatch(selectCrypto(symbol));
    if (!priceHistories[symbol]) {
      dispatch(fetchPriceHistory(symbol));
    }
    setOpenedCharts(prevState => ({
      ...prevState,
      [symbol]: true
    }));
  };

  const handleToggleChart = (symbol: string) => {
    setOpenedCharts(prevState => ({
      ...prevState,
      [symbol]: !prevState[symbol]
    }));
  };

  const filteredCryptos = cryptos.filter((crypto) =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="crypto-list">
      <div className='container-text-scrolling-prices'>
        <Marquee gradient={false} speed={50} direction="right">
          {cryptos.map((crypto) => (
            <div className="scrolling-text" key={crypto.symbol}>
              {` - ${crypto.name} (${crypto.symbol.toUpperCase()}): $${crypto.current_price} - `}
            </div>
          ))}
        </Marquee>
      </div>
      <div className='container-search-title'>
        <TextField
          label="Search"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: 'white' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            fontFamily: 'Chivo-Thin',
            width: '50%',
            '& .MuiInputLabel-root': {
              color: 'white',
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white',
              },
              '&:hover fieldset': {
                borderColor: 'white',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiOutlinedInput-input': {
              color: 'white',
            },
          }}
        />
        <div className='crypto-title'>Crypto</div>
      </div>
      <List className='crypto-list-items'>
        {filteredCryptos.map((crypto) => (
          <CryptoItem
            key={crypto.symbol}
            name={crypto.name}
            symbol={crypto.symbol}
            currentPrice={crypto.current_price}
            onSelect={() => handleSelectCrypto(crypto.symbol)}
          />
        ))}
      </List>
      <div className='container-crypto-selected'>
        {selectedCryptos.length > 0 && (
          <div className='title-crypto-selected'>My Crypto</div>
        )}
        {selectedCryptos.map((crypto) => {
          const currentCrypto = cryptos.find(c => c.symbol === crypto.symbol);
          return (
            <div key={crypto.symbol} className="crypto-item" style={{ border: '1px solid white' }}>
              <div className='crypto-item-selected-title' onClick={() => handleToggleChart(crypto.symbol)} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '10px 10px' }}>
                <ListItemText
                  primary={`${crypto.name} (${crypto.symbol.toUpperCase()})`}
                  secondary={`Current Price: $${currentCrypto ? currentCrypto.current_price : 'N/A'}`}
                  sx={{
                    fontFamily: 'Chivo-Thin',
                    color: 'white',
                    '& .MuiTypography-root': {
                      color: 'white',
                    },
                    '& .MuiTypography-body2': {
                      color: 'white',
                    },
                  }}
                />
                <IconButton
                  color="secondary"
                  onClick={(e) => { e.stopPropagation(); dispatch(removeCrypto(crypto.symbol)); }}
                  sx={{ fontFamily: 'Chivo-Thin', color: 'white' }}
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <Collapse in={openedCharts[crypto.symbol]} timeout="auto" unmountOnExit>
                <div style={{ paddingTop: '20px', paddingBottom: '20px' }} className="crypto-chart">
                  <CryptoChart symbol={crypto.symbol} />
                </div>
              </Collapse>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoList;
