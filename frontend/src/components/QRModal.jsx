import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, ExternalLink, QrCode } from 'lucide-react';

export default function QRModal({ certificateId, isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificateId) return null;

  const verifyUrl = `${window.location.origin}/verify/${certificateId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">Certificate QR Code</h3>
          <p className="text-xs text-slate-500 mt-1">
            Scan to instantly verify certificate authenticity on the Polygon blockchain.
          </p>

          <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-xl inline-block shadow-inner">
            <QRCodeSVG
              value={verifyUrl}
              size={180}
              level="H"
              includeMargin={true}
              fgColor="#1e1b4b"
            />
          </div>

          <div className="bg-slate-100 p-2.5 rounded-lg text-xs font-mono text-slate-700 truncate mb-4">
            {certificateId}
          </div>

          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Link' : 'Copy Verification Link'}</span>
            </button>

            <a
              href={`/verify/${certificateId}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-xs transition shadow-sm"
            >
              <span>Verify Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
