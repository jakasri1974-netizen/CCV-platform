import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      checkIfWalletIsConnected();

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setSigner(null);
      setBalance('0');
    } else {
      setAccount(accounts[0]);
      updateWalletDetails(accounts[0]);
    }
  };

  const handleChainChanged = (_chainId) => {
    setChainId(_chainId);
    window.location.reload();
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_accounts', []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await updateWalletDetails(accounts[0], provider);
      }
      const network = await provider.getNetwork();
      setChainId('0x' + Number(network.chainId).toString(16));
    } catch (err) {
      console.warn("Wallet check error:", err.message);
    }
  };

  const updateWalletDetails = async (address, customProvider = null) => {
    try {
      const provider = customProvider || new ethers.BrowserProvider(window.ethereum);
      const currentSigner = await provider.getSigner();
      setSigner(currentSigner);

      const rawBalance = await provider.getBalance(address);
      setBalance(Number(ethers.formatEther(rawBalance)).toFixed(4));

      const network = await provider.getNetwork();
      setChainId('0x' + Number(network.chainId).toString(16));
    } catch (err) {
      console.warn("Update wallet details error:", err.message);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask browser extension is not installed. Please install MetaMask to connect your wallet.");
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await updateWalletDetails(accounts[0], provider);
      }
    } catch (err) {
      console.error("Connect wallet error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (targetChainIdHex = '0x13882') => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: targetChainIdHex }],
      });
    } catch (switchError) {
      // 4902 error code means network is not added to MetaMask
      if (switchError.code === 4902) {
        try {
          if (targetChainIdHex === '0x13882') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x13882',
                  chainName: 'Polygon Amoy Testnet',
                  rpcUrls: ['https://rpc-amoy.polygon.technology'],
                  nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
                },
              ],
            });
          } else if (targetChainIdHex === '0x7a69') {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7a69',
                  chainName: 'Hardhat Localhost',
                  rpcUrls: ['http://127.0.0.1:8545'],
                  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                },
              ],
            });
          }
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        balance,
        signer,
        isConnecting,
        connectWallet,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
