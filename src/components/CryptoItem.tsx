import React from 'react';
import { ListItem, ListItemText } from '@mui/material';
import '../styles/CryptoComponents.css';

interface CryptoItemProps {
  name: string;
  symbol: string;
  currentPrice: number;
  onSelect: () => void;
}

const CryptoItem: React.FC<CryptoItemProps> = ({ name, symbol, currentPrice, onSelect }) => {
  return (
    <ListItem className='crypto-item-table' button onClick={onSelect}>
      <ListItemText 
        className='crypto-item-price' 
        sx={{ color: 'white' }} 
        primary={`${name} (${symbol.toUpperCase()})`} 
      />
      <div>{`${currentPrice.toFixed(2)}`}</div>
    </ListItem>
  );
};

export default React.memo(CryptoItem);
