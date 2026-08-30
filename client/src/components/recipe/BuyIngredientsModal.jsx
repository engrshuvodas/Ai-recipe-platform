import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ShoppingBag, CheckSquare, Square, ExternalLink, Zap, Package, ShoppingCart } from 'lucide-react';

const BuyIngredientsModal = ({ isOpen, onClose, ingredients = [], recipeTitle = '' }) => {
  const [selectedItems, setSelectedItems] = useState(() => {
    return ingredients.map((ing) => ing.name);
  });

  const toggleItem = (name) => {
    setSelectedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const toggleAll = () => {
    if (selectedItems.length === ingredients.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(ingredients.map((ing) => ing.name));
    }
  };

  const getSearchUrl = (store, query) => {
    const encoded = encodeURIComponent(query.trim());
    switch (store) {
      case 'blinkit':
        return `https://blinkit.com/s/?q=${encoded}`;
      case 'zepto':
        return `https://www.zepto.com/search?query=${encoded}`;
      case 'bigbasket':
        return `https://www.bigbasket.com/ps/?q=${encoded}`;
      case 'instamart':
        return `https://www.swiggy.com/instamart/search?query=${encoded}`;
      case 'amazonFresh':
        return `https://www.amazon.in/s?k=${encoded}&i=now-store`;
      default:
        return `https://www.google.com/search?q=buy+${encoded}+grocery`;
    }
  };

  const openBundleStore = (storeKey) => {
    if (selectedItems.length === 0) return;
    const query = selectedItems.slice(0, 4).join(' ');
    const url = getSearchUrl(storeKey, query);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openSingleItem = (storeKey, itemName) => {
    const url = getSearchUrl(storeKey, itemName);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const stores = [
    {
      id: 'blinkit',
      name: 'Blinkit',
      icon: '⚡',
      badge: '10 Mins Delivery',
      btnClass: 'bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold border border-amber-500/50',
    },
    {
      id: 'zepto',
      name: 'Zepto',
      icon: '🚀',
      badge: 'Superfast Delivery',
      btnClass: 'bg-purple-700 hover:bg-purple-800 text-white font-bold',
    },
    {
      id: 'bigbasket',
      name: 'BigBasket',
      icon: '🧺',
      badge: 'Fresh & Organic',
      btnClass: 'bg-lime-600 hover:bg-lime-700 text-white font-bold',
    },
    {
      id: 'instamart',
      name: 'Swiggy Instamart',
      icon: '🛍️',
      badge: 'Instant Delivery',
      btnClass: 'bg-orange-600 hover:bg-orange-700 text-white font-bold',
    },
    {
      id: 'amazonFresh',
      name: 'Amazon Fresh',
      icon: '📦',
      badge: 'Scheduled Delivery',
      btnClass: 'bg-slate-900 hover:bg-black text-white font-bold border border-slate-700',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buy Fresh Ingredients"
      subtitle={`Select items for "${recipeTitle}" and order directly from popular grocery apps`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-forest-800">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-xs font-bold text-forest-800 dark:text-gold-400 hover:underline"
          >
            {selectedItems.length === ingredients.length ? (
              <>
                <CheckSquare className="w-4 h-4 text-gold-500" />
                <span>Deselect All</span>
              </>
            ) : (
              <>
                <Square className="w-4 h-4 text-stone-400" />
                <span>Select All ({ingredients.length} items)</span>
              </>
            )}
          </button>

          <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            {selectedItems.length} of {ingredients.length} selected
          </span>
        </div>

        {/* Ingredients Checklist with quick buy links */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {ingredients.map((ing, index) => {
            const isChecked = selectedItems.includes(ing.name);
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isChecked
                    ? 'bg-forest-50/70 dark:bg-forest-900/40 border-forest-300 dark:border-forest-700/80'
                    : 'bg-stone-50/60 dark:bg-forest-950/40 border-stone-200 dark:border-forest-900 text-stone-400'
                }`}
              >
                <div
                  onClick={() => toggleItem(ing.name)}
                  className="flex items-center gap-3 cursor-pointer flex-1"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {ing.name}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400 ml-2 font-medium">
                      ({ing.quantity} {ing.unit})
                    </span>
                    {ing.note && <span className="text-[11px] text-stone-400 ml-1 italic">- {ing.note}</span>}
                  </div>
                </div>

                {/* Quick single-item store buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => openSingleItem('blinkit', ing.name)}
                    className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-[11px] font-bold text-amber-900 dark:text-amber-300 hover:scale-105"
                    title={`Buy ${ing.name} on Blinkit`}
                  >
                    ⚡ Blinkit
                  </button>
                  <button
                    onClick={() => openSingleItem('zepto', ing.name)}
                    className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-[11px] font-bold text-purple-900 dark:text-purple-300 hover:scale-105"
                    title={`Buy ${ing.name} on Zepto`}
                  >
                    🚀 Zepto
                  </button>
                  <button
                    onClick={() => openSingleItem('bigbasket', ing.name)}
                    className="p-1.5 rounded-lg bg-lime-100 dark:bg-lime-950/60 text-[11px] font-bold text-lime-900 dark:text-lime-300 hover:scale-105"
                    title={`Buy ${ing.name} on BigBasket`}
                  >
                    🧺 BigBasket
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Multi-Item Order Section */}
        <div className="pt-4 border-t border-stone-200 dark:border-forest-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-gold-500" />
              <span>Order Selected Bundle on Grocery Partner</span>
            </h4>
            <span className="text-xs text-stone-500">Opens direct search query</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {stores.map((store) => (
              <button
                key={store.id}
                onClick={() => openBundleStore(store.id)}
                disabled={selectedItems.length === 0}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${store.btnClass}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{store.icon}</span>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">{store.name}</p>
                    <p className="text-[10px] opacity-80 font-normal">{store.badge}</p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BuyIngredientsModal;
