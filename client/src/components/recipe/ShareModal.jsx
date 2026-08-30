import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Copy, Check, Share2, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ShareModal = ({ isOpen, onClose, recipe }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!recipe) return null;

  const url = window.location.href;
  const title = `Check out this delicious recipe: ${recipe.title} on Recipe Companion!`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Recipe link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank');
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url,
        });
      } catch (e) {
        // Share cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share this Recipe" subtitle="Spread culinary inspiration with friends and family" maxWidth="max-w-md">
      <div className="space-y-5">
        {/* Quick Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:scale-[1.02] transition-all"
          >
            <Send className="w-4 h-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleTwitter}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-stone-900 dark:bg-stone-800 hover:bg-black text-white font-bold text-xs shadow-sm hover:scale-[1.02] transition-all"
          >
            <span>Twitter / X</span>
          </button>
        </div>

        {/* Native Web Share */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-forest-900 text-cream-50 font-bold text-xs shadow-sm hover:bg-forest-800 transition-all"
          >
            <Share2 className="w-4 h-4 text-gold-400" />
            <span>More Sharing Options</span>
          </button>
        )}

        {/* Copy Link Input Bar */}
        <div className="pt-3 border-t border-stone-200 dark:border-forest-800">
          <p className="text-xs font-semibold text-stone-500 mb-2">Or copy direct link:</p>
          <div className="flex items-center gap-2 p-2 rounded-2xl bg-stone-100 dark:bg-forest-950 border border-stone-200 dark:border-forest-800">
            <input
              type="text"
              readOnly
              value={url}
              className="bg-transparent text-xs text-stone-700 dark:text-stone-300 px-2 flex-1 focus:outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs rounded-xl shadow-xs transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
