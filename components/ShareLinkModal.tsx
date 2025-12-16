import React, { useState } from 'react';
import { X, Copy, Check, QrCode, ExternalLink, Smartphone } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: () => void; // Added prop
}

const ShareLinkModal: React.FC<ShareLinkModalProps> = ({ isOpen, onClose, onSimulate }) => {
  const [copied, setCopied] = useState(false);
  
  // Link giả lập form đặt xe công khai
  const bookingLink = "https://vinfleet.vn/booking/shuttle-hanoi";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(bookingLink)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden relative">
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <QrCode size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 mb-2">Quét mã để đặt xe</h2>
            <p className="text-sm text-slate-500 mb-6 px-4">
                Gửi mã QR hoặc đường dẫn bên dưới cho khách hàng để họ tự đăng ký vé xe ghép.
            </p>

            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm mb-6">
                <img 
                    src={qrCodeUrl} 
                    alt="Booking QR Code" 
                    className="w-48 h-48 object-contain mix-blend-multiply"
                />
            </div>

            <div className="w-full relative group mb-4">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <ExternalLink size={16} className="text-slate-400" />
                </div>
                <input 
                    type="text" 
                    readOnly 
                    value={bookingLink}
                    className="w-full pl-10 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                />
                <button 
                    onClick={handleCopy}
                    className={`absolute right-1 top-1 bottom-1 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${copied ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'}`}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Đã chép' : 'Sao chép'}
                </button>
            </div>

            <button 
              onClick={onSimulate}
              className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <Smartphone size={18} />
              Xem thử giao diện khách
            </button>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
             <p className="text-xs text-slate-400">Form đăng ký công khai • Connected to Google Sheets</p>
        </div>
      </div>
    </div>
  );
};

export default ShareLinkModal;