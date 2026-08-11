import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, AlertTriangle, CheckCircle2, ExternalLink } from 'lucide-react';
import { formatAddress } from '../utils/hashUtils';

export default function MetaMaskConnect() {
  const { account, chainId, balance, isConnecting, connectWallet, switchNetwork } = useWallet();

  // Target Chain ID: 31337 (0x7a69) or 80002 (0x13882)
  const isHardhat = chainId === '0x7a69' || chainId === '31337';
  const isAmoy = chainId === '0x13882' || chainId === '80002';
  const isPolygonMainnet = chainId === '0x89' || chainId === '137';

  const isCorrectNetwork = isHardhat || isAmoy || isPolygonMainnet;

  const getNetworkName = () => {
    if (isHardhat) return 'Hardhat Local (31337)';
    if (isAmoy) return 'Polygon Amoy (80002)';
    if (isPolygonMainnet) return 'Polygon Mainnet';
    return 'Wrong Network';
  };

  return (
    <div className="flex items-center gap-3">
      {account ? (
        <div className="flex items-center gap-2">
          {/* Network Badge */}
          <button
            onClick={() => switchNetwork('0x13882')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
              isCorrectNetwork
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title="Click to Switch Network"
          >
            {isCorrectNetwork ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
            )}
            <span>{getNetworkName()}</span>
          </button>

          {/* Wallet Address & Balance Pill */}
          <div className="flex items-center bg-slate-900 text-white rounded-full px-3 py-1 text-xs font-medium border border-slate-800 shadow-sm">
            <span className="text-slate-400 mr-2 border-r border-slate-700 pr-2">
              {balance} POL/ETH
            </span>
            <span className="font-mono text-indigo-300">{formatAddress(account)}</span>
          </div>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50"
        >
          <Wallet className="w-4 h-4" />
          <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
        </button>
      )}
    </div>
  );
}
