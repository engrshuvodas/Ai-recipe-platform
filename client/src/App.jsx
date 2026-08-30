import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Home from './pages/Home';
import Explore from './pages/Explore';
import RegionalFoods from './pages/RegionalFoods';
import RecipeDetail from './pages/RecipeDetail';
import RecipeForm from './pages/RecipeForm';
import MealPlanner from './pages/MealPlanner';
import AIGenerator from './pages/AIGenerator';
import Community from './pages/Community';
import CommunityDetail from './pages/CommunityDetail';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <SocketProvider>
              <Router>
                <div className="flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/explore" element={<Explore />} />
                      <Route path="/regional" element={<RegionalFoods />} />
                      <Route path="/recipe/:id" element={<RecipeDetail />} />
                      <Route path="/recipe/new" element={<RecipeForm />} />
                      <Route path="/recipe/edit/:id" element={<RecipeForm />} />
                      <Route path="/meal-planner" element={<MealPlanner />} />
                      <Route path="/ai-studio" element={<AIGenerator />} />
                      <Route path="/community" element={<Community />} />
                      <Route path="/community/:id" element={<CommunityDetail />} />
                      <Route path="/chat" element={<Chat />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/user/:userId" element={<Profile />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </Router>
            </SocketProvider>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
