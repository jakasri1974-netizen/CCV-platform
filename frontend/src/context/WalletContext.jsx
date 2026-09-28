import React, { createContext, useContext, useState } from 'react';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  // Application runs with Zero MetaMask dependency using backend RPC signer wallet
  const [account] = useState('Backend Wallet Signer (Polygon)');
  const [chainId] = useState('0x13882'); // 80002 Polygon Amoy Testnet
  const [balance] = useState('Active');
  const [isConnecting] = useState(false);

  const connectWallet = async () => {
    // No-op / Info notice - MetaMask is no longer required!
    console.log("MetaMask is not required. All transactions are signed server-side by backend RPC service.");
  };

  const switchNetwork = async () => {
    console.log("Network selection is managed by backend environment configuration.");
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        balance,
        signer: null,
        isConnecting,
        connectWallet,
        switchNetwork,
        isBackendSigner: true,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
