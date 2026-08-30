# 🍽️ Recipe Companion

> **A complete recipe website** — where you can search for recipes, upload your own recipes, generate new recipes using AI, plan meals, and chat with other food lovers.

![Version](https://img.shields.io/badge/Version-1.0.0-forestgreen?style=for-the-badge)
![AI](https://img.shields.io/badge/AI-GPT--4o%20via%20OpenRouter-blue?style=for-the-badge&logo=openai)
![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-orange?style=for-the-badge)

---

## 🌐 Launch Website (One Click)

> **Double-click the `run.bat` file** — everything else will happen automatically!

Go to your browser: **http://localhost:5173**

---

## 📖 What is this project? (In simple terms for Non-Coders)

**Recipe Companion** is a complete recipe platform — just like your own digital kitchen. It is built using three main parts:

| Part | Function |
|---|---|
| **Frontend (React)** | What you see — buttons, pages, images, forms |
| **Backend (Node.js)** | Behind the scenes work — login, data saving, API |
| **Database (MongoDB)** | Stores all data — recipes, users, chats |

---

## ✨ Complete Feature List

### 🔍 Search and View Recipes
- Browse thousands of recipes
- Filter by ingredients, cuisine, country, cooking time
- Regional Indian recipes (Punjab, Kerala, Rajasthan, Maharashtra...)
- Recipes from around the world (Italy, Mexico, Japan, Thailand...)

### 👤 User Accounts
- Sign up and login
- Update profile picture, bio, location
- View your own uploaded recipes
- View saved favorite recipes

### 📤 Upload Recipes
- Add your own recipes
- Add pictures, ingredients, and step-by-step instructions
- Set a kitchen timer for each step
- Serving scaler (scale a recipe for 2 people to 6 people)

### ❤️ Social Features
- Like, comment, and rate recipes
- Bookmark / save recipes
- Share any recipe

### 🤖 AI Recipe Generator (Powered by GPT-4o)
- Enter the ingredients you have
- Specify allergies (e.g., nuts, dairy, gluten)
- AI will instantly generate a complete recipe for you
- Includes professional tips from the AI Chef
- Save the recipe!

### 📅 Meal Planner
- Plan weekly and monthly meals
- Plan breakfast, lunch, dinner, and snacks separately
- Get a full week's grocery list in one click

### 🛒 Grocery Purchase Links
- Buy ingredients for any recipe directly
- **Blinkit**, **Zepto**, **BigBasket**, **Swiggy Instamart**, **Amazon Fresh** — in one click!

### 💬 Community Club
- Join the food community
- Post, discuss, comment
- Create your own community

### 🗨️ Real-time Chat
- Send direct messages to other users
- See online/offline status
- Share recipe tips

### 🌐 Multi-Language
- English, Hindi (हिंदी), Spanish (Español), French (Français), German (Deutsch)
- Switch languages from the navbar

### 🌙 Dark / Light Mode
- Change themes at any time

---

## 🚀 Project Launch Steps (Step by Step)

### Install required things first:
1. [Node.js 18+](https://nodejs.org/) — Download and install
2. [MongoDB Community Server](https://www.mongodb.com/try/download/community) — Download and install
3. MongoDB must be running (Check if `MongoDB` is running in Services)

### First time setup:

**Step 1 — Install Backend dependencies:**
```
e:\ProjectRecipe\server> npm install
```

**Step 2 — Install Frontend dependencies:**
```
e:\ProjectRecipe\client> npm install
```

**Step 3 — Load demo data (Only needs to be done once initially):**
```
e:\ProjectRecipe\server> node seed/seedData.js
```

**Step 4 — Start the project:**
```
Double-click the run.bat file ✅
```

---

## 🔑 Demo Accounts (Login and try)

| Name | Email | Password |
|---|---|---|
| 🍴 Demo Gourmet | `demo@recipecompanion.com` | `password123` |
| 👨‍🍳 Chef Aarav | `aarav@recipecompanion.com` | `password123` |
| 🇮🇹 Elena Rossi | `elena@recipecompanion.com` | `password123` |
| 🇮🇳 Priya Patel | `priya@recipecompanion.com` | `password123` |
| 🇺🇸 Marcus Vance | `marcus@recipecompanion.com` | `password123` |

> Click the **"Instant Demo Accounts"** button on the login page to autofill!

---

## 📁 Project Folder Structure

```
ProjectRecipe/
│
├── 📄 run.bat                    ← Double click this to start everything
├── 📄 README.md                  ← This file
│
├── 📂 server/                    ← Backend (Node.js + Express)
│   ├── config/db.js              ← MongoDB connection
│   ├── models/                   ← Data structures
│   │   ├── User.js               ← User data
│   │   ├── Recipe.js             ← Recipe data
│   │   ├── MealPlan.js           ← Meal plan
│   │   ├── Community.js          ← Community club
│   │   ├── CommunityPost.js      ← Community posts
│   │   ├── Conversation.js       ← Chat conversations
│   │   └── Message.js            ← Chat messages
│   ├── routes/                   ← API endpoints
│   │   ├── authRoutes.js         ← Login / Registration
│   │   ├── recipeRoutes.js       ← Recipes
│   │   ├── mealPlanRoutes.js     ← Meal planner
│   │   ├── aiRoutes.js           ← AI Recipe Generator (GPT-4o)
│   │   ├── communityRoutes.js    ← Community
│   │   ├── chatRoutes.js         ← Chat
│   │   └── groceryRoutes.js      ← Grocery links
│   ├── middleware/auth.js        ← JWT login protection
│   ├── socket/chatSocket.js      ← Real-time chat
│   ├── seed/seedData.js          ← Demo data loader
│   ├── .env                      ← API keys and settings (secret)
│   └── server.js                 ← Main server file
│
└── 📂 client/                    ← Frontend (React + Vite)
    ├── src/
    │   ├── pages/                ← Each page
    │   │   ├── Home.jsx          ← Home page
    │   │   ├── Explore.jsx       ← Explore recipes
    │   │   ├── RegionalFoods.jsx ← Country/Region based
    │   │   ├── RecipeDetail.jsx  ← Recipe details
    │   │   ├── RecipeForm.jsx    ← Upload recipe
    │   │   ├── MealPlanner.jsx   ← Meal planner
    │   │   ├── AIGenerator.jsx   ← AI Recipe Studio
    │   │   ├── Community.jsx     ← Community
    │   │   ├── CommunityDetail.jsx ← Community room
    │   │   ├── Chat.jsx          ← Direct chat
    │   │   ├── Profile.jsx       ← Profile
    │   │   ├── Login.jsx         ← Login
    │   │   └── Register.jsx      ← Registration
    │   ├── components/           ← Reusable UI parts
    │   ├── context/              ← Auth, Theme, Language, Socket
    │   ├── services/api.js       ← All API calls here
    │   ├── i18n/translations.js  ← 5 language translations
    │   └── styles/index.css      ← Design system
    └── index.html                ← Main HTML file
```

---

## 🤖 AI Features — How it works

```
You write: "spinach, paneer, garlic"
       ↓
Recipe Companion Server
       ↓
OpenRouter → GPT-4o (OpenAI's best model)
       ↓
Complete Recipe: Name + Ingredients + Steps + Nutrition + Chef Tips
       ↓
Visible on your screen! ✨
```

**What you can do with AI:**
- ✅ Create recipes with pantry ingredients
- ✅ Get safe recipes avoiding allergies
- ✅ Chef Chat — Answers to any cooking questions
- ✅ Weekly meal suggestions

---

## 🛒 Grocery Store Links

| Store | Link Pattern |
|---|---|
| 🟡 Blinkit | `https://blinkit.com/s/?q=<ingredient>` |
| 🔵 Zepto | `https://www.zepto.com/search?query=<ingredient>` |
| 🟢 BigBasket | `https://www.bigbasket.com/ps/?q=<ingredient>` |
| 🟠 Swiggy Instamart | `https://www.swiggy.com/instamart/search?query=<ingredient>` |
| 📦 Amazon Fresh | `https://www.amazon.in/s?k=<ingredient>&i=now-store` |

---

## 🔌 All API Endpoints

| Method | URL | Function |
|---|---|---|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | View own profile |
| GET | `/api/recipes` | View / filter all recipes |
| POST | `/api/recipes` | Upload new recipe |
| GET | `/api/recipes/:id` | Recipe details |
| POST | `/api/recipes/:id/like` | Give a like |
| POST | `/api/recipes/:id/rate` | Give a rating |
| POST | `/api/recipes/:id/bookmark` | Bookmark |
| GET | `/api/meal-plans/active` | Active meal plan |
| POST | `/api/meal-plans/add-meal` | Add meal |
| GET | `/api/meal-plans/:id/shopping-list` | Grocery list |
| **POST** | **`/api/ai/generate`** | **Generate recipe with GPT-4o** |
| **POST** | **`/api/ai/chef-chat`** | **Chat with AI Chef** |
| **POST** | **`/api/ai/meal-suggestions`** | **AI Weekly meal suggestions** |
| GET | `/api/communities` | Community list |
| POST | `/api/communities` | Create new community |
| GET | `/api/chat/conversations` | Chat list |
| POST | `/api/chat/messages` | Send message |
| POST | `/api/grocery/generate-links` | Get grocery links |

---

## 🎨 Design System

| Element | Description |
|---|---|
| **Primary Color** | Deep Forest Green `#0e3b2e` |
| **Accent Color** | Golden `#d4af37` |
| **Background** | Warm Cream `#faf8f5` |
| **Dark Mode BG** | Deep Forest `#071712` |
| **Heading Font** | Playfair Display (elegant serif) |
| **Body Font** | Plus Jakarta Sans (modern sans-serif) |
| **UI Style** | Glassmorphism + Rounded Cards + Micro Animations |

---

## ⚙️ Tech Stack (Technologies Used)

| Layer | Technology | Function |
|---|---|---|
| **Frontend** | React 18 + Vite | Interactive UI |
| **Styling** | Tailwind CSS v3 | Fast beautiful design |
| **Backend** | Node.js + Express.js | Server & API |
| **Database** | MongoDB + Mongoose | Data Storage |
| **Real-time** | Socket.io | Live chat |
| **Auth** | JWT + bcryptjs | Secure login |
| **AI** | OpenRouter → GPT-4o | Recipe generation |
| **HTTP Client** | Axios | API calls |
| **Icons** | Lucide React | Beautiful icons |
| **i18n** | Custom Context | 5 language support |

---

## ❓ FAQ — Frequently Asked Questions

### Q1. The website is not opening, what should I do?
> **A:** Double-click `run.bat`. If it still doesn't work:
> 1. Check if MongoDB is running (Windows Services → MongoDB)
> 2. Go to the `e:\ProjectRecipe\server` folder and run `npm install`
> 3. Go to the `e:\ProjectRecipe\client` folder and run `npm install`
> 4. Run `run.bat` again

### Q2. Why is the AI recipe not generating?
> **A:** Check if the OpenRouter API key is in the `.env` file:
> ```
> OPENROUTER_API_KEY=sk-or-v1-...your key...
> ```
> It will work even without the API key — the offline fallback engine will start.

### Q3. Why are recipes not saving?
> **A:** You need to be logged in. Login from the top navbar or use a demo account.

### Q4. Is the database not connecting?
> **A:** Ensure MongoDB is installed and running.
> - Windows: Start Menu → Services → MongoDB → Start
> - Or in cmd: `net start MongoDB`

### Q5. Getting "Port already in use" error?
> **A:** Close the previous server. In cmd:
> ```
> taskkill /IM node.exe /F
> ```
> Then run `run.bat` again.

### Q6. Cannot create a new user?
> **A:** Go to the Register page: `http://localhost:5173/register`
> Fill out all information and click "Create Account".

### Q7. How do I upload an image?
> **A:** In this version, you add it via an image URL. Upload any image to [imgbb.com](https://imgbb.com) or [postimages.org](https://postimages.org) and copy the URL.

### Q8. Chat is not working?
> **A:** You need two separate accounts for chat. Log in with `demo@recipecompanion.com` in one tab and `aarav@recipecompanion.com` in another. Then search for each other on the Chat page.

### Q9. Will it work on mobile?
> **A:** Yes! The website is fully responsive. If you are on the same WiFi network, go to the `http://192.168.1.4:5173` link.

### Q10. How many recipes are there by default?
> **A:** There are **14** authentic recipes in the seed data:
> Punjabi Butter Chicken, Masala Dosa, Hyderabadi Biryani, Kerala Fish Moilee, Rajasthani Dal Bati, Italian Pizza, Truffle Pasta, Mexican Tacos, Japanese Ramen, Thai Curry, Croissant, Lava Cake and more.

### Q11. What is the .env file? Why is it needed?
> **A:** `.env` is a secret settings file. It contains API keys, database addresses, and security keys. Never share this file on GitHub or with others.

### Q12. How do I host the project live on the internet?
> **A:** 
> - Frontend → Host for free on [Vercel](https://vercel.com) or [Netlify](https://netlify.com)
> - Backend → Host on [Railway](https://railway.app) or [Render](https://render.com)
> - Database → Get a free cloud database on [MongoDB Atlas](https://cloud.mongodb.com)

### Q13. How do I change the language?
> **A:** Click on the globe (🌐) icon on top of the navbar — choose English, Hindi, Spanish, French, German.

### Q14. How do I enable Dark Mode?
> **A:** Click on the moon 🌙 icon on top of the navbar.

### Q15. How do I ask the AI Chef cooking questions?
> **A:** There is an "Ask AI Chef" button on any recipe details page. Click it to ask GPT-4o any questions about cooking!

---

## 📞 Contact for Issues

If there is any issue in the project, open an issue or check the log files below:
- Backend logs: Server terminal window
- Frontend logs: Browser F12 → Console tab

---

## 📝 License

MIT © Recipe Companion 2026 — Open for everyone 🍳❤️
