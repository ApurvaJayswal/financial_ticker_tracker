const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function fetchCryptoPrice(coinId = 'bitcoin', vsCurrency = 'usd') {
  // Get detailed coin data
  const url = `${COINGECKO_BASE}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) {
    throw new Error('CoinGecko error');
  }

  const data = await res.json();
  const marketData = data?.market_data;

  if (!marketData || marketData.current_price?.[vsCurrency] == null) {
    throw new Error('CoinGecko price not found');
  }

  return {
    price: marketData.current_price[vsCurrency],
    openPrice: marketData.current_price[vsCurrency] - marketData.price_change_24h,
    highPrice: marketData.high_24h[vsCurrency],
    lowPrice: marketData.low_24h[vsCurrency],
    volume: marketData.total_volume[vsCurrency],
    marketCap: marketData.market_cap[vsCurrency],
    change: marketData.price_change_24h,
    changePercent: marketData.price_change_percentage_24h
  };
}
