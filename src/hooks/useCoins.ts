'use client';

import { useState, useEffect, useCallback } from 'react';
import { Coin } from '@/types';

// Markup percentage (your profit margin)
const MARKUP_PERCENT = 5;

// Apply markup to rates
function applyMarkup(buyRate: number, sellRate: number) {
  return {
    buyRate: buyRate * (1 + MARKUP_PERCENT / 100),  // Client pays more
    sellRate: sellRate * (1 - MARKUP_PERCENT / 100), // Client receives less
  };
}

// Base rates (before markup)
const baseCoins = [
  // Active coins (shown on main page)
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', network: 'Bitcoin', logoUrl: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', buyRate: 67500, sellRate: 67000, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', buyRate: 3450, sellRate: 3400, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  // USDT in different networks
  { id: 'usdt-trc20', name: 'Tether (TRC20)', symbol: 'USDT', network: 'TRC20', logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', buyRate: 1.01, sellRate: 0.99, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'usdt-erc20', name: 'Tether (ERC20)', symbol: 'USDT', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', buyRate: 1.01, sellRate: 0.99, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'usdt-bep20', name: 'Tether (BEP20)', symbol: 'USDT', network: 'BEP20', logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', buyRate: 1.01, sellRate: 0.99, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  
  { id: 'bnb', name: 'BNB', symbol: 'BNB', network: 'BEP20', logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', buyRate: 590, sellRate: 585, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sol', name: 'Solana', symbol: 'SOL', network: 'Solana', logoUrl: 'https://assets.coingecko.com/coins/images/4128/small/solana.png', buyRate: 145, sellRate: 143, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', network: 'XRP Ledger', logoUrl: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', buyRate: 0.52, sellRate: 0.50, isActive: true, createdAt: new Date(), updatedAt: new Date() },

  // Fiat currencies (active)
  { id: 'rub-card', name: 'Рубль (Карта)', symbol: 'RUB', logoUrl: '', buyRate: 0.011, sellRate: 0.0105, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'rub-sbp', name: 'Рубль (СБП)', symbol: 'RUB', logoUrl: '', buyRate: 0.011, sellRate: 0.0105, isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'usd', name: 'Доллар США', symbol: 'USD', logoUrl: '', buyRate: 1.0, sellRate: 1.0, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cny', name: 'Китайский юань', symbol: 'CNY', logoUrl: '', buyRate: 0.14, sellRate: 0.135, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'uzs', name: 'Узбекский сум', symbol: 'UZS', logoUrl: '', buyRate: 0.000078, sellRate: 0.000075, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  
  // USDC in different networks
  { id: 'usdc-erc20', name: 'USD Coin (ERC20)', symbol: 'USDC', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', buyRate: 1.0, sellRate: 0.99, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'usdc-trc20', name: 'USD Coin (TRC20)', symbol: 'USDC', network: 'TRC20', logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', buyRate: 1.0, sellRate: 0.99, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'usdc-bep20', name: 'USD Coin (BEP20)', symbol: 'USDC', network: 'BEP20', logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', buyRate: 1.0, sellRate: 0.99, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  
  // Top 50 cryptocurrencies (inactive by default)
  { id: 'ada', name: 'Cardano', symbol: 'ADA', network: 'Cardano', logoUrl: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', buyRate: 0.45, sellRate: 0.44, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'avax', name: 'Avalanche', symbol: 'AVAX', network: 'Avalanche C-Chain', logoUrl: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', buyRate: 35, sellRate: 34, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', network: 'Dogecoin', logoUrl: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png', buyRate: 0.12, sellRate: 0.11, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'trx', name: 'TRON', symbol: 'TRX', network: 'TRC20', logoUrl: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png', buyRate: 0.12, sellRate: 0.11, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'dot', name: 'Polkadot', symbol: 'DOT', network: 'Polkadot', logoUrl: 'https://assets.coingecko.com/coins/images/12171/small/polkadot.png', buyRate: 7.2, sellRate: 7.0, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'matic', name: 'Polygon', symbol: 'MATIC', network: 'Polygon', logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', buyRate: 0.58, sellRate: 0.56, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'link', name: 'Chainlink', symbol: 'LINK', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', buyRate: 14.5, sellRate: 14.0, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'shib', name: 'Shiba Inu', symbol: 'SHIB', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png', buyRate: 0.000022, sellRate: 0.000021, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'ltc', name: 'Litecoin', symbol: 'LTC', network: 'Litecoin', logoUrl: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', buyRate: 85, sellRate: 83, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bch', name: 'Bitcoin Cash', symbol: 'BCH', network: 'Bitcoin Cash', logoUrl: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png', buyRate: 480, sellRate: 470, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'atom', name: 'Cosmos', symbol: 'ATOM', network: 'Cosmos', logoUrl: 'https://assets.coingecko.com/coins/images/1481/small/cosmos_hub.png', buyRate: 9.5, sellRate: 9.2, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'uni', name: 'Uniswap', symbol: 'UNI', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/12504/small/uni.jpg', buyRate: 7.8, sellRate: 7.5, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'xlm', name: 'Stellar', symbol: 'XLM', network: 'Stellar', logoUrl: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png', buyRate: 0.11, sellRate: 0.10, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'etc', name: 'Ethereum Classic', symbol: 'ETC', network: 'Ethereum Classic', logoUrl: 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png', buyRate: 27, sellRate: 26, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', network: 'NEAR', logoUrl: 'https://assets.coingecko.com/coins/images/10365/small/near.jpg', buyRate: 5.2, sellRate: 5.0, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'apt', name: 'Aptos', symbol: 'APT', network: 'Aptos', logoUrl: 'https://assets.coingecko.com/coins/images/26455/small/aptos_round.png', buyRate: 9.0, sellRate: 8.7, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'fil', name: 'Filecoin', symbol: 'FIL', network: 'Filecoin', logoUrl: 'https://assets.coingecko.com/coins/images/12817/small/filecoin.png', buyRate: 5.8, sellRate: 5.5, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'arb', name: 'Arbitrum', symbol: 'ARB', network: 'Arbitrum', logoUrl: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg', buyRate: 1.1, sellRate: 1.05, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'op', name: 'Optimism', symbol: 'OP', network: 'Optimism', logoUrl: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png', buyRate: 2.5, sellRate: 2.4, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'vet', name: 'VeChain', symbol: 'VET', network: 'VeChain', logoUrl: 'https://assets.coingecko.com/coins/images/1167/small/VET_Token_Icon.png', buyRate: 0.035, sellRate: 0.033, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'algo', name: 'Algorand', symbol: 'ALGO', network: 'Algorand', logoUrl: 'https://assets.coingecko.com/coins/images/4380/small/download.png', buyRate: 0.18, sellRate: 0.17, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'ftm', name: 'Fantom', symbol: 'FTM', network: 'Fantom', logoUrl: 'https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png', buyRate: 0.42, sellRate: 0.40, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'aave', name: 'Aave', symbol: 'AAVE', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/12645/small/AAVE.png', buyRate: 95, sellRate: 92, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'ton', name: 'Toncoin', symbol: 'TON', network: 'TON', logoUrl: 'https://assets.coingecko.com/coins/images/17980/small/ton_symbol.png', buyRate: 5.5, sellRate: 5.3, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sui', name: 'Sui', symbol: 'SUI', network: 'Sui', logoUrl: 'https://assets.coingecko.com/coins/images/26375/small/sui_asset.jpeg', buyRate: 1.2, sellRate: 1.15, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sei', name: 'Sei', symbol: 'SEI', network: 'Sei', logoUrl: 'https://assets.coingecko.com/coins/images/28205/small/Sei_Logo_-_Transparent.png', buyRate: 0.55, sellRate: 0.52, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'inj', name: 'Injective', symbol: 'INJ', network: 'Injective', logoUrl: 'https://assets.coingecko.com/coins/images/12882/small/Secondary_Symbol.png', buyRate: 25, sellRate: 24, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg', buyRate: 0.0000095, sellRate: 0.0000090, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'wif', name: 'dogwifhat', symbol: 'WIF', network: 'Solana', logoUrl: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg', buyRate: 2.5, sellRate: 2.4, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', network: 'Solana', logoUrl: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg', buyRate: 0.000025, sellRate: 0.000024, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'floki', name: 'FLOKI', symbol: 'FLOKI', network: 'BEP20', logoUrl: 'https://assets.coingecko.com/coins/images/16746/small/PNG_image.png', buyRate: 0.00018, sellRate: 0.00017, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mkr', name: 'Maker', symbol: 'MKR', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png', buyRate: 1450, sellRate: 1420, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'ldo', name: 'Lido DAO', symbol: 'LDO', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png', buyRate: 2.2, sellRate: 2.1, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'crv', name: 'Curve DAO', symbol: 'CRV', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/12124/small/Curve.png', buyRate: 0.52, sellRate: 0.50, isActive: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'grt', name: 'The Graph', symbol: 'GRT', network: 'ERC20', logoUrl: 'https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png', buyRate: 0.22, sellRate: 0.21, isActive: false, createdAt: new Date(), updatedAt: new Date() },
];

// Apply markup to all coins
const allCoins: Coin[] = baseCoins.map(coin => {
  const { buyRate, sellRate } = applyMarkup(coin.buyRate, coin.sellRate);
  return { ...coin, buyRate, sellRate };
});

const COINS_KEY = 'foxswap_coins';

function getStoredCoins(): Coin[] {
  if (typeof window === 'undefined') return allCoins;
  const stored = localStorage.getItem(COINS_KEY);
  if (stored) {
    try {
      const coins = JSON.parse(stored);
      return coins.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
      }));
    } catch {
      localStorage.setItem(COINS_KEY, JSON.stringify(allCoins));
      return allCoins;
    }
  }
  localStorage.setItem(COINS_KEY, JSON.stringify(allCoins));
  return allCoins;
}

function saveCoins(coins: Coin[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COINS_KEY, JSON.stringify(coins));
}

export function useCoins() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCoins = useCallback(() => {
    setCoins(getStoredCoins());
  }, []);

  useEffect(() => {
    refreshCoins();
    setLoading(false);
  }, [refreshCoins]);

  // Only return active coins for public use
  const activeCoins = coins.filter(c => c.isActive);

  const updateCoin = useCallback((id: string, data: Partial<Coin>) => {
    const updated = coins.map(c => c.id === id ? { ...c, ...data, updatedAt: new Date() } : c);
    setCoins(updated);
    saveCoins(updated);
  }, [coins]);

  const addCoin = useCallback((data: Omit<Coin, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCoin: Coin = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    const updated = [...coins, newCoin];
    setCoins(updated);
    saveCoins(updated);
    return newCoin;
  }, [coins]);

  const deleteCoin = useCallback((id: string) => {
    const updated = coins.filter(c => c.id !== id);
    setCoins(updated);
    saveCoins(updated);
  }, [coins]);

  const toggleActive = useCallback((id: string) => {
    const coin = coins.find(c => c.id === id);
    if (coin) updateCoin(id, { isActive: !coin.isActive });
  }, [coins, updateCoin]);

  // Reset to default coins
  const resetCoins = useCallback(() => {
    localStorage.removeItem(COINS_KEY);
    setCoins(allCoins);
    saveCoins(allCoins);
  }, []);

  return { 
    coins,           // All coins (for admin)
    activeCoins,     // Only active coins (for public pages)
    loading, 
    updateCoin, 
    addCoin, 
    deleteCoin, 
    toggleActive, 
    refreshCoins,
    resetCoins 
  };
}
