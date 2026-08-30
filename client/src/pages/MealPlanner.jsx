import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mealPlanAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import AddMealModal from '../components/mealplan/AddMealModal';
import ShoppingListModal from '../components/mealplan/ShoppingListModal';
import confetti from 'canvas-confetti';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ShoppingBag,
  Sparkles,
  Utensils,
  Clock,
  CheckCircle,
} from 'lucide-react';

const MealPlanner = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [planType, setPlanType] = useState('weekly'); // 'weekly' | 'monthly'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSlotData, setSelectedSlotData] = useState(null);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);
  const [shoppingList, setShoppingList] = useState(null);
  const [loadingShoppingList, setLoadingShoppingList] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to manage your meal plans');
      navigate('/login');
      return;
    }
    fetchActivePlan();
  }, [currentDate, planType, isAuthenticated]);

  const formatDate = (d) => d.toISOString().split('T')[0];

  const getWeekRange = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
      startObj: start,
      endObj: end,
    };
  };

  const fetchActivePlan = async () => {
    try {
      setLoading(true);
      const { startDate } = getWeekRange(currentDate);
      const res = await mealPlanAPI.getActive({ planType, startDate });
      setActivePlan(res.data.plan);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - (planType === 'weekly' ? 7 : 30));
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + (planType === 'weekly' ? 7 : 30));
    setCurrentDate(next);
  };

  const handleOpenAddMeal = (dateStr, dayName, slot) => {
    const { startDate, endDate } = getWeekRange(currentDate);
    setSelectedSlotData({
      date: dateStr,
      dayOfWeek: dayName,
      slot,
      startDate,
      endDate,
    });
    setIsAddModalOpen(true);
  };

  const handleMealAdded = async (mealData) => {
    try {
      const { startDate, endDate } = getWeekRange(currentDate);
      const res = await mealPlanAPI.addMeal({
        ...mealData,
        planType,
        startDate,
        endDate,
      });
      setActivePlan(res.data.plan);
      toast.success('Meal added to schedule!');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    } catch (err) {
      toast.error('Failed to add meal');
    }
  };

  const handleRemoveMeal = async (dateStr, slot, mealItemId) => {
    if (!activePlan) return;
    try {
      const res = await mealPlanAPI.removeMeal({
        planId: activePlan._id,
        date: dateStr,
        slot,
        mealItemId,
      });
      setActivePlan(res.data.plan);
      toast.info('Meal removed');
    } catch (err) {
      toast.error('Failed to remove meal');
    }
  };

  const handleGenerateShoppingList = async () => {
    if (!activePlan) {
      toast.info('Please add meals to your planner first!');
      return;
    }
    try {
      setLoadingShoppingList(true);
      const res = await mealPlanAPI.getShoppingList(activePlan._id);
      setShoppingList(res.data);
      setIsShoppingListOpen(true);
    } catch (err) {
      toast.error('Failed to generate shopping list');
    } finally {
      setLoadingShoppingList(false);
    }
  };

  const { startDate, endDate, startObj } = getWeekRange(currentDate);

  // Generate 7 days structure for the week
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekDays = [];

  for (let i = 0; i < (planType === 'weekly' ? 7 : 14); i++) {
    const d = new Date(startObj);
    d.setDate(startObj.getDate() + i);
    const dateStr = formatDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });

    const existingDay = activePlan?.days?.find((day) => day.date === dateStr);

    weekDays.push({
      date: dateStr,
      dayOfWeek: dayName,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      breakfast: existingDay?.breakfast || [],
      lunch: existingDay?.lunch || [],
      dinner: existingDay?.dinner || [],
      snacks: existingDay?.snacks || [],
    });
  }

  const mealSlots = [
    { key: 'breakfast', label: '🍳 Breakfast', color: 'bg-amber-500/10 text-amber-900 dark:text-amber-300' },
    { key: 'lunch', label: '🥗 Lunch', color: 'bg-emerald-500/10 text-emerald-900 dark:text-emerald-300' },
    { key: 'dinner', label: '🍲 Dinner', color: 'bg-indigo-500/10 text-indigo-900 dark:text-indigo-300' },
    { key: 'snacks', label: '🥑 Snacks', color: 'bg-rose-500/10 text-rose-900 dark:text-rose-300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Grocery List Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-forest-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100 dark:bg-forest-900/80 text-forest-900 dark:text-gold-300 text-xs font-bold mb-1">
            <CalendarIcon className="w-3.5 h-3.5 text-gold-500" />
            <span>Smart Nutrition & Meal Schedule</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-forest-900 dark:text-cream-50">
            {t('plannerTitle', 'Weekly & Monthly Meal Planner')}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Organize breakfasts, lunches, dinners, and snacks. Generate 1-click shopping lists for Blinkit, Zepto, and BigBasket.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Plan Type Switcher */}
          <div className="flex rounded-2xl bg-stone-200 dark:bg-forest-950 p-1 border border-stone-300 dark:border-forest-800">
            <button
              onClick={() => setPlanType('weekly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                planType === 'weekly'
                  ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Weekly (7 Days)
            </button>
            <button
              onClick={() => setPlanType('monthly')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                planType === 'monthly'
                  ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 shadow-sm'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Extended (14 Days)
            </button>
          </div>

          {/* Grocery Button */}
          <button
            onClick={handleGenerateShoppingList}
            disabled={loadingShoppingList}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 font-bold text-xs shadow-md hover:scale-105 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{loadingShoppingList ? 'Calculating...' : 'Generate Grocery List'}</span>
          </button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-soft">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-xl bg-stone-100 dark:bg-forest-900 hover:bg-stone-200 dark:hover:bg-forest-800 text-stone-700 dark:text-stone-200 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-xs uppercase font-bold text-stone-400">Current Planning Window</p>
          <p className="text-base sm:text-lg font-serif font-bold text-forest-900 dark:text-cream-50">
            {startDate} to {endDate}
          </p>
        </div>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-xl bg-stone-100 dark:bg-forest-900 hover:bg-stone-200 dark:hover:bg-forest-800 text-stone-700 dark:text-stone-200 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {weekDays.map((day) => (
          <div
            key={day.date}
            className="flex flex-col justify-between rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200/90 dark:border-forest-800 shadow-soft overflow-hidden p-5 space-y-4"
          >
            {/* Day Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-forest-900">
              <div>
                <h3 className="font-serif font-bold text-base text-forest-900 dark:text-cream-50">
                  {day.dayOfWeek}
                </h3>
                <p className="text-[11px] font-mono text-stone-400">{day.displayDate}</p>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-forest-950 text-stone-600 dark:text-stone-300">
                4 Slots
              </span>
            </div>

            {/* 4 Meal Slots */}
            <div className="space-y-3 flex-1">
              {mealSlots.map((slot) => {
                const items = day[slot.key] || [];
                return (
                  <div key={slot.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-stone-600 dark:text-stone-300">{slot.label}</span>
                      <button
                        onClick={() => handleOpenAddMeal(day.date, day.dayOfWeek, slot.key)}
                        className="text-gold-600 dark:text-gold-400 hover:scale-110 transition-transform p-0.5"
                        title={`Add ${slot.label}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meal Items */}
                    {items.length === 0 ? (
                      <div
                        onClick={() => handleOpenAddMeal(day.date, day.dayOfWeek, slot.key)}
                        className="p-2 rounded-xl border border-dashed border-stone-200 dark:border-forest-900 text-stone-400 text-[10px] text-center cursor-pointer hover:border-gold-500/60 hover:text-stone-600 transition-colors"
                      >
                        + Add Dish
                      </div>
                    ) : (
                      items.map((meal, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-stone-50 dark:bg-forest-950/70 border border-stone-200 dark:border-forest-900 group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {meal.recipe?.images?.[0] ? (
                              <img
                                src={meal.recipe.images[0]}
                                alt={meal.recipe.title}
                                className="w-7 h-7 rounded-lg object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-forest-900 text-gold-400 flex items-center justify-center shrink-0">
                                <Utensils className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-stone-900 dark:text-cream-50 truncate">
                                {meal.recipe?.title || meal.customTitle || 'Planned Dish'}
                              </p>
                              {meal.notes && (
                                <p className="text-[9px] text-stone-400 truncate">{meal.notes}</p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveMeal(day.date, slot.key, meal._id)}
                            className="text-stone-400 hover:text-rose-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove meal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      {selectedSlotData && (
        <AddMealModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          date={selectedSlotData.date}
          dayOfWeek={selectedSlotData.dayOfWeek}
          slot={selectedSlotData.slot}
          onMealAdded={handleMealAdded}
        />
      )}

      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        shoppingList={shoppingList}
        planTitle={`${planType === 'monthly' ? 'Extended' : 'Weekly'} Meal Plan (${startDate})`}
      />
    </div>
  );
};

export default MealPlanner;
