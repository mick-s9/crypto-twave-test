import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { ChartData, ChartOptions } from 'chart.js';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchPriceHistory } from '../store/cryptoSlice';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CryptoChartProps {
  symbol: string;
}

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

const CryptoChart: React.FC<CryptoChartProps> = ({ symbol }) => {
  const dispatch = useDispatch<AppDispatch>();
  const priceHistories = useSelector((state: RootState) => state.crypto.priceHistories);
  const [chartData, setChartData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [
      {
        label: 'Price',
        data: [],
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        tension: 0.1,
        pointBorderColor: 'rgba(0, 0, 0, 0)',
        pointBackgroundColor: 'rgba(75,192,192,1)',
        pointRadius: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const fetchData = async () => {
      if (priceHistories[symbol]) {
        const prices = priceHistories[symbol];
        const labels = prices.map((price: any) => new Date(price[0]).toLocaleDateString());
        const data = prices.map((price: any) => price[1]);

        setChartData({
          labels,
          datasets: [
            {
              label: 'Price',
              data,
              fill: false,
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
              tension: isMobile ? 0.4 : 0.1,
              pointBorderColor: 'rgba(0, 0, 0, 0)',
              pointBackgroundColor: 'rgba(75,192,192,1)',
              pointRadius: 1,
            },
          ],
        });
        setLoading(false);
      } else {
        setLoading(true);
        setError(null);
        try {
          const id = symbolToIdMap[symbol.toLowerCase()];
          if (!id) {
            throw new Error(`No ID found for symbol: ${symbol}`);
          }
          const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}/market_chart`, {
            params: {
              vs_currency: 'usd',
              days: '30',
            },
          });

          const prices = response.data.prices;
          const labels = prices.map((price: any) => new Date(price[0]).toLocaleDateString());
          const data = prices.map((price: any) => price[1]);

          setChartData({
            labels,
            datasets: [
              {
                label: 'Price',
                data,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 1,
                tension: isMobile ? 0.4 : 0.1,
                pointBorderColor: 'rgba(0, 0, 0, 0)',
                pointBackgroundColor: 'rgba(75,192,192,1)',
                pointRadius: 1,
              },
            ],
          });
          dispatch(fetchPriceHistory(symbol));
          setLoading(false);
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 429 || error.response?.status === 403) {
              setError('Too many requests or access forbidden. Data will be available soon.');
              setLoading(false);
              setRetry(true);
              setTimeout(() => {
                setRetry(false);
                fetchData();
              }, 60000);
            } else {
              setError('Error fetching price history. Please try again later.');
              setLoading(false);
              setRetry(true);
              setTimeout(() => {
                setRetry(false);
                fetchData();
              }, 60000);
            }
          } else {
            setError('Error fetching price history. Please try again later.');
            setLoading(false);
            setRetry(true);
            setTimeout(() => {
              setRetry(false);
              fetchData();
            }, 60000);
          }
        }
      }
    };

    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [symbol, retry, priceHistories, dispatch, isMobile]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date',
        },
        grid: {
          color: 'rgba(192, 192, 192, 0.2)'
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price (USD)',
        },
        grid: {
          color: 'rgba(192, 192, 192, 0.2)'
        },
      },
    },
    layout: {
      padding: {
        left: isMobile ? 10 : 20,
        right: isMobile ? 10 : 20,
        top: isMobile ? 10 : 20,
        bottom: isMobile ? 10 : 20,
      },
    },
  };

  if (loading || retry) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Alert severity="error">{error}</Alert>
        <span>Available soon</span>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: isMobile ? '300px' : '500px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default CryptoChart;