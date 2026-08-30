import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ShoppingBag, CheckCircle, ExternalLink, CheckSquare, Square, Tag, Layers } from 'lucide-react';

const ShoppingListModal = ({ isOpen, onClose, shoppingList, planTitle = 'Weekly Meal Plan' }) => {
  const [checkedItems, setCheckedItems] = useState([]);

  if (!shoppingList) return null;

  const toggleCheck = (name) => {
    setCheckedItems((prev) =>
      prev.includes(name) ? prev.filter((i) => i !== name) : [...prev, name]
    );
  };

  const getStoreUrl = (store, query) => {
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
      default:
        return `https://www.google.com/search?q=buy+${encoded}`;
    }
  };

  const openStoreSearch = (store, itemName) => {
    window.open(getStoreUrl(store, itemName), '_blank', 'noopener,noreferrer');
  };

  const openFullCart = (store) => {
    const allNames = shoppingList.items.slice(0, 5).map((i) => i.name).join(' ');
    window.open(getStoreUrl(store, allNames), '_blank', 'noopener,noreferrer');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Consolidated Grocery Shopping List"
      subtitle={`Automatically calculated ingredients for all meals in ${planTitle}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Top summary & Quick Partner bar */}
        <div className="p-4 rounded-2xl bg-forest-900 text-cream-50 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
          <div>
            <p className="text-xs text-gold-300 font-bold uppercase tracking-wider">Total Unique Ingredients</p>
            <p className="text-2xl font-serif font-bold">{shoppingList.totalItems} Items</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-300 mr-1">Order Entire Cart:</span>
            <button
              onClick={() => openFullCart('blinkit')}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition-transform hover:scale-105"
            >
              ⚡ Blinkit
            </button>
            <button
              onClick={() => openFullCart('zepto')}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-transform hover:scale-105"
            >
              🚀 Zepto
            </button>
            <button
              onClick={() => openFullCart('bigbasket')}
              className="px-3 py-1.5 bg-lime-600 hover:bg-lime-700 text-white font-bold text-xs rounded-xl shadow-xs transition-transform hover:scale-105"
            >
              🧺 BigBasket
            </button>
          </div>
        </div>

        {/* Categorized List */}
        <div className="max-h-[55vh] overflow-y-auto space-y-6 pr-2">
          {Object.entries(shoppingList.categories || {}).map(([category, items]) => (
            <div key={category} className="space-y-2.5">
              <div className="flex items-center gap-2 pb-1 border-b border-stone-200 dark:border-forest-800">
                <Layers className="w-4 h-4 text-gold-500" />
                <h4 className="font-serif font-bold text-sm text-forest-900 dark:text-cream-50 uppercase tracking-wider">
                  {category} ({items.length})
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {items.map((item, idx) => {
                  const isChecked = checkedItems.includes(item.name);
                  return (
                    <div
                      key={idx}
                      className={`flex items-start justify-between p-3 rounded-2xl border transition-all ${
                        isChecked
                          ? 'bg-stone-100/50 dark:bg-forest-950/30 border-stone-200 dark:border-forest-900 opacity-60'
                          : 'bg-white dark:bg-forest-900/40 border-stone-200 dark:border-forest-800 shadow-xs'
                      }`}
                    >
                      <div
                        onClick={() => toggleCheck(item.name)}
                        className="flex items-start gap-2.5 cursor-pointer flex-1"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`text-xs font-bold ${
                              isChecked
                                ? 'line-through text-stone-400 dark:text-stone-500'
                                : 'text-stone-900 dark:text-white'
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="text-[11px] font-semibold text-gold-600 dark:text-gold-400">
                            {item.combinedQuantity}
                          </p>
                          {item.recipes && item.recipes.length > 0 && (
                            <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">
                              For: {item.recipes.join(', ')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Store Link */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => openStoreSearch('blinkit', item.name)}
                          className="p-1 rounded-md bg-amber-100 dark:bg-amber-950/60 text-[10px] font-bold text-amber-900 dark:text-amber-300 hover:scale-105"
                          title="Search on Blinkit"
                        >
                          ⚡
                        </button>
                        <button
                          onClick={() => openStoreSearch('zepto', item.name)}
                          className="p-1 rounded-md bg-purple-100 dark:bg-purple-950/60 text-[10px] font-bold text-purple-900 dark:text-purple-300 hover:scale-105"
                          title="Search on Zepto"
                        >
                          🚀
                        </button>
                        <button
                          onClick={() => openStoreSearch('bigbasket', item.name)}
                          className="p-1 rounded-md bg-lime-100 dark:bg-lime-950/60 text-[10px] font-bold text-lime-900 dark:text-lime-300 hover:scale-105"
                          title="Search on BigBasket"
                        >
                          🧺
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default ShoppingListModal;
