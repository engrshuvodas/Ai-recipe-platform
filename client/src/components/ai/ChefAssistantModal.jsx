import React, { useState } from 'react';
import Modal from '../common/Modal';
import { aiAPI } from '../../services/api';
import { Sparkles, Send, ChefHat, HelpCircle, Flame, HeartHandshake } from 'lucide-react';

const ChefAssistantModal = ({ isOpen, onClose, currentRecipe }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello! I'm your AI Culinary Assistant. Ask me anything about ingredient substitutions, wine or beverage pairings, cooking times, or emergency fixes for ${
        currentRecipe?.title ? `"${currentRecipe.title}"` : 'any recipe'
      }!`,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'What can I substitute for heavy cream?',
    'How do I fix a dish that is too salty?',
    'What beverage pairs best with this?',
    'Can I make this dairy-free?',
  ];

  const handleSend = async (textToSend) => {
    const q = textToSend || question;
    if (!q.trim() || loading) return;

    const userMsg = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await aiAPI.chefChat({
        question: q,
        currentRecipe: currentRecipe?.title || '',
      });
      const botMsg = { sender: 'bot', text: res.data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I ran into an issue finding that answer. Please try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Chef Assistant"
      subtitle="Instant culinary substitutions, pairings, and kitchen tips"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        {/* Chat History Container */}
        <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-2xl bg-stone-50 dark:bg-forest-950/60 border border-stone-200 dark:border-forest-800">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-xl bg-forest-900 text-gold-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ChefHat className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gold-500 text-forest-950 font-medium rounded-tr-none'
                    : 'bg-white dark:bg-forest-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-forest-800 rounded-tl-none shadow-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center text-xs text-stone-500 italic">
              <Sparkles className="w-4 h-4 text-gold-500 animate-spin" />
              <span>Chef is formulating advice...</span>
            </div>
          )}
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-1.5">
          {quickQuestions.map((qq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(qq)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-forest-900/50 hover:bg-gold-100 dark:hover:bg-gold-950/50 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-forest-800 transition-colors"
            >
              {qq}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 pt-2"
        >
          <input
            type="text"
            placeholder="Ask anything (e.g. substitution for garlic, wine pairing)..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="p-2.5 rounded-2xl bg-forest-900 text-gold-400 hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default ChefAssistantModal;
