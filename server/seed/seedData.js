require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Community = require('../models/Community');
const CommunityPost = require('../models/CommunityPost');
const MealPlan = require('../models/MealPlan');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipe_companion';

const sampleUsers = [
  {
    name: 'Demo Gourmet',
    username: 'demouser',
    email: 'demo@recipecompanion.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Passionate home foodie exploring delicious global flavours and meal planning.',
    location: 'Mumbai, India',
    dietaryPreferences: ['Vegetarian', 'Healthy'],
    allergies: [],
    favoriteCuisines: ['Indian', 'Italian', 'Mexican'],
  },
  {
    name: 'Chef Aarav Sharma',
    username: 'chef.aarav',
    email: 'aarav@recipecompanion.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=400&q=80',
    bio: 'Executive Chef specializing in royal Indian culinary heritage, tandoor & regional slow-cooking.',
    location: 'Delhi, India',
    role: 'chef',
    dietaryPreferences: [],
    allergies: [],
    favoriteCuisines: ['Indian', 'Mughlai', 'Awadhi'],
  },
  {
    name: 'Elena Rossi',
    username: 'elena.rossi',
    email: 'elena@recipecompanion.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Italian pasta craftsman & wood-fired pizza purist. Sharing family heritage recipes from Tuscany.',
    location: 'Florence, Italy',
    role: 'chef',
    dietaryPreferences: [],
    allergies: [],
    favoriteCuisines: ['Italian', 'Mediterranean'],
  },
  {
    name: 'Priya Patel',
    username: 'priya.plants',
    email: 'priya@recipecompanion.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Certified nutritionist & plant-based recipe creator crafting vibrant nutrient-packed dishes.',
    location: 'Bengaluru, India',
    role: 'user',
    dietaryPreferences: ['Vegan', 'Gluten-Free', 'High-Protein'],
    allergies: ['Peanuts'],
    favoriteCuisines: ['South Indian', 'Thai', 'Mediterranean'],
  },
  {
    name: 'Chef Marcus Vance',
    username: 'marcus.vance',
    email: 'marcus@recipecompanion.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Artisan baker, dessert maestro & BBQ smoke master.',
    location: 'San Francisco, USA',
    role: 'chef',
    dietaryPreferences: [],
    allergies: [],
    favoriteCuisines: ['French', 'American', 'Bakery'],
  },
];

const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] MongoDB Connected.');

    // Clear existing collections
    await User.deleteMany({});
    await Recipe.deleteMany({});
    await Community.deleteMany({});
    await CommunityPost.deleteMany({});
    await MealPlan.deleteMany({});

    console.log('[Seed] Cleaned database collections.');

    // Create users (using save() so pre-save password hash hook runs)
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`[Seed] Created ${createdUsers.length} users.`);

    const [demoUser, chefAarav, elenaRossi, priyaPatel, marcusVance] = createdUsers;

    // Comprehensive Recipe Dataset
    const recipesData = [
      // 1. Butter Chicken (Murgh Makhani) - Punjab, India
      {
        title: 'Authentic Punjabi Butter Chicken (Murgh Makhani)',
        description: 'Tender tandoori-marinated chicken simmered in a velvety, buttery tomato gravy infused with kasuri methi, aromatic garam masala, and rich fresh cream.',
        images: [
          'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80'
        ],
        author: chefAarav._id,
        category: 'Dinner',
        cuisine: 'Indian',
        country: 'India',
        state: 'Punjab',
        prepTime: 25,
        cookTime: 35,
        servings: 4,
        difficulty: 'Medium',
        dietary: ['High-Protein', 'Gluten-Free'],
        isFeatured: true,
        ingredients: [
          { name: 'Boneless Chicken Thighs', quantity: '700', unit: 'g', note: 'Cut into bite sized cubes', category: 'Meat & Seafood' },
          { name: 'Greek Yogurt / Thick Curd', quantity: '1/2', unit: 'cup', note: 'For marinade', category: 'Dairy & Eggs' },
          { name: 'Butter', quantity: '50', unit: 'g', note: 'Unsalted pure dairy butter', category: 'Dairy & Eggs' },
          { name: 'Fresh Heavy Cream', quantity: '1/2', unit: 'cup', note: 'Whisked gently', category: 'Dairy & Eggs' },
          { name: 'Ripe Vine Tomatoes Pureed', quantity: '5', unit: 'large', note: 'Freshly blended', category: 'Produce' },
          { name: 'Ginger Garlic Paste', quantity: '2', unit: 'tbsp', note: 'Freshly ground', category: 'Produce' },
          { name: 'Kashmiri Red Chilli Powder', quantity: '2', unit: 'tsp', note: 'For vibrant red color & mild heat', category: 'Pantry & Spices' },
          { name: 'Kasuri Methi (Dried Fenugreek)', quantity: '1', unit: 'tbsp', note: 'Lightly crushed between palms', category: 'Pantry & Spices' },
          { name: 'Garam Masala', quantity: '1', unit: 'tsp', note: 'Royal spice blend', category: 'Pantry & Spices' },
          { name: 'Honey / Sugar', quantity: '1', unit: 'tsp', note: 'To balance acidity', category: 'Pantry & Spices' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Yogurt Spice Marinade', text: 'Mix chicken cubes with yogurt, 1 tbsp ginger garlic paste, 1 tsp Kashmiri chilli powder, and salt. Marinate in refrigerator for at least 30 minutes.', timerMinutes: 30 },
          { stepNumber: 2, title: 'Sear Chicken to Perfection', text: 'Heat 1 tbsp butter in a heavy pan. Sear marinated chicken on high heat for 6-8 minutes until golden charred edges develop. Set chicken aside.', timerMinutes: 8 },
          { stepNumber: 3, title: 'Silky Makhani Sauce', text: 'In the same pan, melt remaining butter. Add ginger garlic paste, sauté for 1 minute. Pour tomato puree, cover and cook on medium flame for 15 minutes until fat separates.', timerMinutes: 15 },
          { stepNumber: 4, title: 'Simmer Chicken & Infuse Aromatics', text: 'Add seared chicken, garam masala, crushed kasuri methi, honey, and heavy cream. Simmer gently on low flame for 10 minutes.', timerMinutes: 10 },
          { stepNumber: 5, title: 'Royal Garnish & Serve', text: 'Drizzle with extra fresh cream, garnish with julienned ginger, and serve steaming hot with garlic butter naan or basmati rice.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 520, protein: 42, carbs: 14, fat: 34, fiber: 3 },
        averageRating: 4.9,
        ratingCount: 28,
        views: 1420,
      },

      // 2. Palak Paneer - Punjab, India
      {
        title: 'Creamy Golden Palak Paneer',
        description: 'Vibrant fresh spinach gravy simmered with velvety Indian cottage cheese cubes, garlic, toasted cumin, and rich spices.',
        images: [
          'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80'
        ],
        author: chefAarav._id,
        category: 'Dinner',
        cuisine: 'Indian',
        country: 'India',
        state: 'Punjab',
        prepTime: 20,
        cookTime: 20,
        servings: 4,
        difficulty: 'Easy',
        dietary: ['Vegetarian', 'Gluten-Free', 'High-Protein'],
        isFeatured: true,
        ingredients: [
          { name: 'Fresh Spinach (Palak)', quantity: '500', unit: 'g', note: 'Washed thoroughly', category: 'Produce' },
          { name: 'Paneer (Cottage Cheese)', quantity: '300', unit: 'g', note: 'Cut into 1-inch cubes', category: 'Dairy & Eggs' },
          { name: 'Onions Finely Chopped', quantity: '2', unit: 'medium', note: 'Finely minced', category: 'Produce' },
          { name: 'Tomatoes Chopped', quantity: '2', unit: 'medium', note: 'Freshly diced', category: 'Produce' },
          { name: 'Garlic Cloves', quantity: '8', unit: 'cloves', note: 'Finely sliced', category: 'Produce' },
          { name: 'Green Chillies', quantity: '2', unit: 'pieces', note: 'Slit lengthwise', category: 'Produce' },
          { name: 'Cumin Seeds', quantity: '1', unit: 'tsp', note: 'Whole', category: 'Pantry & Spices' },
          { name: 'Fresh Cream', quantity: '2', unit: 'tbsp', note: 'For final swirl', category: 'Dairy & Eggs' },
          { name: 'Ghee or Butter', quantity: '2', unit: 'tbsp', note: 'Pure clarified butter', category: 'Dairy & Eggs' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Blanch Spinach in Ice Water', text: 'Boil spinach leaves in salted water for 2 minutes. Immediately transfer to iced water to lock in the bright emerald green color. Blend to smooth puree.', timerMinutes: 3 },
          { stepNumber: 2, title: 'Temper Garlic & Spices', text: 'Heat ghee in a pan. Add cumin seeds and let them sizzle. Add sliced garlic and sauté until fragrant and golden.', timerMinutes: 2 },
          { stepNumber: 3, title: 'Cook Masala Base', text: 'Add chopped onions and green chillies. Sauté until translucent. Add tomatoes, coriander powder, turmeric and salt. Cook until mushy.', timerMinutes: 6 },
          { stepNumber: 4, title: 'Combine Puree & Paneer', text: 'Pour in blended spinach puree and 1/4 cup water. Simmer on low heat for 5 minutes. Gently fold in soft paneer cubes.', timerMinutes: 5 },
          { stepNumber: 5, title: 'Finish with Cream & Ghee Tadka', text: 'Swirl in fresh cream and a final pinch of garam masala. Serve hot with tandoori roti.', timerMinutes: 1 }
        ],
        nutritionFacts: { calories: 340, protein: 18, carbs: 12, fat: 26, fiber: 5 },
        averageRating: 4.8,
        ratingCount: 19,
        views: 980,
      },

      // 3. Masala Dosa with Sambar - Tamil Nadu, India
      {
        title: 'Crispy South Indian Masala Dosa with Drumstick Sambar',
        description: 'Golden crispy fermented rice and lentil crepe stuffed with aromatic spiced mustard-potato filling, served alongside piping hot lentil sambar and fresh coconut chutney.',
        images: [
          'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80'
        ],
        author: priyaPatel._id,
        category: 'Breakfast',
        cuisine: 'South Indian',
        country: 'India',
        state: 'Tamil Nadu',
        prepTime: 20,
        cookTime: 25,
        servings: 4,
        difficulty: 'Medium',
        dietary: ['Vegetarian', 'Vegan', 'Gluten-Free'],
        isFeatured: true,
        ingredients: [
          { name: 'Fermented Dosa Batter', quantity: '3', unit: 'cups', note: 'Rice & urad dal blend', category: 'Pantry & Spices' },
          { name: 'Boiled Potatoes', quantity: '4', unit: 'medium', note: 'Peeled and roughly mashed', category: 'Produce' },
          { name: 'Mustard Seeds & Curry Leaves', quantity: '1', unit: 'tbsp', note: 'For tempering', category: 'Pantry & Spices' },
          { name: 'Onions Sliced', quantity: '2', unit: 'medium', note: 'Thinly sliced', category: 'Produce' },
          { name: 'Turmeric & Green Chillies', quantity: '1', unit: 'tsp', note: 'For color and zest', category: 'Pantry & Spices' },
          { name: 'Coconut Chutney & Sambar', quantity: '1', unit: 'cup', note: 'For serving', category: 'Produce' },
          { name: 'Cold Pressed Sesame Oil or Ghee', quantity: '3', unit: 'tbsp', note: 'For roasting dosa', category: 'Oils & Sauces' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Spiced Potato Masala', text: 'Heat oil in a pan. Sputter mustard seeds, chana dal, curry leaves, and ginger. Sauté sliced onions and green chillies until soft. Add mashed potatoes, turmeric, salt, and 3 tbsp water. Mix well to a spreadable texture.', timerMinutes: 8 },
          { stepNumber: 2, title: 'Heat the Cast Iron Tawa', text: 'Heat a seasoned cast-iron flat tawa over medium-high heat. Sprinkle a few drops of water; it should sizzle and evaporate instantly. Wipe clean with a cloth.', timerMinutes: 2 },
          { stepNumber: 3, title: 'Pour & Swirl Dosa', text: 'Pour a ladle of batter in the center. Using circular motions from inside out, spread into a thin round crepe. Drizzle oil or ghee along the perimeter.', timerMinutes: 3 },
          { stepNumber: 4, title: 'Fill & Crisp', text: 'When the bottom turns deep golden and edges lift effortlessly, spoon 3 tbsp potato masala in the center. Fold into a neat cylinder or triangle.', timerMinutes: 2 },
          { stepNumber: 5, title: 'Platter Presentation', text: 'Serve immediately with spicy tomato chutney, creamy coconut chutney, and steaming bowl of drumstick sambar.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 310, protein: 9, carbs: 54, fat: 8, fiber: 6 },
        averageRating: 5.0,
        ratingCount: 34,
        views: 1850,
      },

      // 4. Hyderabadi Dum Biryani - Telangana, India
      {
        title: 'Royal Hyderabadi Kacchi Dum Biryani',
        description: 'Layers of long-grain fragrant basmati rice, saffron milk, caramelized fried onions (birista), and slow-cooked marinated spice meats sealed with dough for authentic dum aroma.',
        images: [
          'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=80'
        ],
        author: chefAarav._id,
        category: 'Lunch',
        cuisine: 'Indian',
        country: 'India',
        state: 'Telangana',
        prepTime: 40,
        cookTime: 50,
        servings: 6,
        difficulty: 'Hard',
        dietary: ['High-Protein'],
        isFeatured: true,
        ingredients: [
          { name: 'Aged Basmati Rice', quantity: '500', unit: 'g', note: 'Soaked for 45 minutes', category: 'Grains & Pasta' },
          { name: 'Chicken or Mutton Pieces', quantity: '800', unit: 'g', note: 'Bone-in cuts', category: 'Meat & Seafood' },
          { name: 'Golden Fried Onions (Birista)', quantity: '1.5', unit: 'cups', note: 'Crispy fried', category: 'Produce' },
          { name: 'Saffron Strands in Warm Milk', quantity: '1/4', unit: 'cup', note: 'Infused saffron', category: 'Dairy & Eggs' },
          { name: 'Fresh Mint & Coriander Leaves', quantity: '1', unit: 'bunch', note: 'Chopped', category: 'Produce' },
          { name: 'Whole Shahi Garam Masala', quantity: '2', unit: 'tbsp', note: 'Star anise, green cardamom, mace, cinnamon', category: 'Pantry & Spices' },
          { name: 'Ghee & Rose Water', quantity: '3', unit: 'tbsp', note: 'For royal aroma', category: 'Dairy & Eggs' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Marination with Royal Aromatics', text: 'Marinate meat with yogurt, ginger-garlic paste, red chilli, turmeric, shahi biryani masala, half of the fried onions, mint, and lemon juice for 1 hour.', timerMinutes: 60 },
          { stepNumber: 2, title: 'Parboil Basmati Rice', text: 'In a large pot with boiling water infused with whole spices and salt, cook soaked basmati rice until exactly 70% done (still has a slight bite). Drain immediately.', timerMinutes: 7 },
          { stepNumber: 3, title: 'Layering in Handi', text: 'Spread marinated meat at the base of a heavy bottomed pot. Layer parboiled hot rice on top. Scatter fresh mint, coriander, fried onions, saffron milk, ghee, and rose water.', timerMinutes: 5 },
          { stepNumber: 4, title: 'Dum Cooking with Sealed Lid', text: 'Seal pot rim with wheat dough and heavy lid. Cook on high flame for 10 minutes, then place on a heavy tawa on low flame for 30 minutes for slow dum infusion.', timerMinutes: 40 },
          { stepNumber: 5, title: 'Royal Unveiling', text: 'Rest for 10 minutes before slicing through the layers with a flat spatula. Serve with cold cucumber mint raita and Mirchi ka Salan.', timerMinutes: 10 }
        ],
        nutritionFacts: { calories: 680, protein: 38, carbs: 75, fat: 24, fiber: 4 },
        averageRating: 4.9,
        ratingCount: 42,
        views: 2600,
      },

      // 5. Kerala Coconut Fish Curry (Meen Moilee) - Kerala, India
      {
        title: 'Kerala Style Coconut Meen Moilee Curry',
        description: 'Delicate king fish steak poached in a fragrant coconut milk broth infused with mustard seeds, fresh curry leaves, raw mango, and ginger slivers.',
        images: [
          'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=1000&q=80'
        ],
        author: chefAarav._id,
        category: 'Dinner',
        cuisine: 'South Indian',
        country: 'India',
        state: 'Kerala',
        prepTime: 15,
        cookTime: 20,
        servings: 3,
        difficulty: 'Medium',
        dietary: ['Dairy-Free', 'Gluten-Free', 'High-Protein'],
        isFeatured: false,
        ingredients: [
          { name: 'Fresh King Fish / Pomfret Steaks', quantity: '500', unit: 'g', note: 'Cleaned & cut into steaks', category: 'Meat & Seafood' },
          { name: 'Thick & Thin Coconut Milk', quantity: '2', unit: 'cups', note: 'Freshly extracted', category: 'Pantry & Spices' },
          { name: 'Coconut Oil', quantity: '2', unit: 'tbsp', note: 'Cold pressed virgin', category: 'Oils & Sauces' },
          { name: 'Curry Leaves & Green Chillies', quantity: '3', unit: 'sprigs', note: 'Fresh aroma', category: 'Produce' },
          { name: 'Ginger & Garlic Juliennes', quantity: '2', unit: 'tbsp', note: 'Finely sliced', category: 'Produce' },
          { name: 'Shallots (Small Madras Onions)', quantity: '10', unit: 'pieces', note: 'Sliced', category: 'Produce' },
          { name: 'Raw Green Mango or Tomatoes', quantity: '1/2', unit: 'cup', note: 'For natural tartness', category: 'Produce' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Light Fish Marinade', text: 'Rub fish steaks with turmeric, black pepper, lemon juice, and a pinch of salt. Set aside for 10 minutes.', timerMinutes: 10 },
          { stepNumber: 2, title: 'Aromatic Coconut Tempering', text: 'Heat pure coconut oil in an earthenware pot (Manchatti). Sputter mustard seeds, add shallots, ginger, garlic, green chillies, and fresh curry leaves until soft.', timerMinutes: 4 },
          { stepNumber: 3, title: 'Thin Coconut Milk Simmer', text: 'Pour in thin coconut milk, add raw mango slices and turmeric powder. Bring to a gentle boil.', timerMinutes: 5 },
          { stepNumber: 4, title: 'Poach Fish & Add Thick Coconut Cream', text: 'Gently slide in fish steaks. Cook on low flame for 6-7 minutes. Pour in thick coconut cream, swirl the pot gently without breaking the fish. Heat through for 2 minutes without boiling.', timerMinutes: 8 },
          { stepNumber: 5, title: 'Serve with Appams', text: 'Garnish with fresh curry leaves and serve alongside piping hot, lace-edged Kerala Appams or Steamed Rice.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 410, protein: 34, carbs: 11, fat: 27, fiber: 2 },
        averageRating: 4.8,
        ratingCount: 16,
        views: 870,
      },

      // 6. Rajasthani Dal Baati Churma - Rajasthan, India
      {
        title: 'Authentic Rajasthani Dal Baati Churma Platter',
        description: 'Hard whole wheat dumplings baked golden over charcoal, soaked in pure desi ghee, served with panchmel mixed lentil dal, garlic chutney, and sweet cardamom churma.',
        images: [
          'https://images.unsplash.com/photo-1626132647523-66f5bf380027?auto=format&fit=crop&w=1000&q=80'
        ],
        author: chefAarav._id,
        category: 'Lunch',
        cuisine: 'Indian',
        country: 'India',
        state: 'Rajasthan',
        prepTime: 30,
        cookTime: 40,
        servings: 4,
        difficulty: 'Hard',
        dietary: ['Vegetarian'],
        isFeatured: true,
        ingredients: [
          { name: 'Coarse Whole Wheat Flour (Atta)', quantity: '2.5', unit: 'cups', note: 'For Baati', category: 'Grains & Pasta' },
          { name: 'Semolina (Sooji / Rava)', quantity: '1/2', unit: 'cup', note: 'For crispness', category: 'Grains & Pasta' },
          { name: 'Pure Desi Ghee', quantity: '1', unit: 'cup', note: 'Clarified butter for dipping & dough', category: 'Dairy & Eggs' },
          { name: 'Mixed 5 Lentils (Panchmel Dal)', quantity: '1.5', unit: 'cups', note: 'Toor, Moong, Chana, Urad, Masoor', category: 'Pantry & Spices' },
          { name: 'Jaggery & Cardamom Powder', quantity: '1/2', unit: 'cup', note: 'For sweet Churma', category: 'Pantry & Spices' },
          { name: 'Spicy Garlic & Red Chilli Chutney', quantity: '3', unit: 'tbsp', note: 'For fiery side', category: 'Produce' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Knead Baati Dough', text: 'Mix coarse wheat flour, semolina, carom seeds (ajwain), salt, and 1/4 cup melted ghee. Knead into a firm, stiff dough with warm water. Roll into smooth round balls with a slight cross slit on top.', timerMinutes: 10 },
          { stepNumber: 2, title: 'Bake Baati Dumplings', text: 'Bake in a preheated oven or tandoor oven at 200°C (400°F) for 25-30 minutes, turning every 10 minutes until evenly golden and cracked.', timerMinutes: 30 },
          { stepNumber: 3, title: 'Panchmel Dal Tadka', text: 'Pressure cook the 5 lentils with turmeric and salt. In a pan, heat ghee, add cumin, cloves, dry red chillies, hing, ginger, tomatoes, and red chilli powder. Pour over the dal and simmer.', timerMinutes: 15 },
          { stepNumber: 4, title: 'Crush & Sweeten Churma', text: 'Crush 3 baked warm baatis into fine crumbs. Mix with powdered jaggery/sugar, cardamom powder, chopped almonds, and warm ghee.', timerMinutes: 5 },
          { stepNumber: 5, title: 'Traditional Ghee Bath', text: 'Lightly crush the remaining hot baatis and submerge completely in warm desi ghee for 1 minute. Serve on a traditional thali with dal, churma, and garlic chutney.', timerMinutes: 2 }
        ],
        nutritionFacts: { calories: 690, protein: 22, carbs: 88, fat: 31, fiber: 9 },
        averageRating: 4.9,
        ratingCount: 22,
        views: 1100,
      },

      // 7. Neapolitan Margherita Pizza - Italy
      {
        title: 'Artisan Neapolitan Pizza Margherita',
        description: 'Classic wood-fired style pizza featuring 48-hour fermented thin crust dough, San Marzano tomato sauce, fresh buffalo mozzarella, and fragrant Genovese basil leaves.',
        images: [
          'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=80'
        ],
        author: elenaRossi._id,
        category: 'Dinner',
        cuisine: 'Italian',
        country: 'Italy',
        state: 'Campania',
        prepTime: 20,
        cookTime: 10,
        servings: 2,
        difficulty: 'Medium',
        dietary: ['Vegetarian'],
        isFeatured: true,
        ingredients: [
          { name: 'Tipo 00 Pizza Flour', quantity: '300', unit: 'g', note: 'High protein Italian flour', category: 'Bakery' },
          { name: 'San Marzano D.O.P. Crushed Tomatoes', quantity: '1', unit: 'cup', note: 'Hand crushed with sea salt', category: 'Pantry & Spices' },
          { name: 'Fresh Buffalo Mozzarella', quantity: '150', unit: 'g', note: 'Torn into chunks & drained', category: 'Dairy & Eggs' },
          { name: 'Fresh Sweet Basil Leaves', quantity: '8', unit: 'leaves', note: 'Hand picked', category: 'Produce' },
          { name: 'Extra Virgin Olive Oil', quantity: '2', unit: 'tbsp', note: 'Cold pressed Italian', category: 'Oils & Sauces' },
          { name: 'Active Dry Yeast & Sea Salt', quantity: '1', unit: 'tsp', note: 'For dough fermentation', category: 'Bakery' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Dough Stretching by Hand', text: 'Gently stretch rested pizza dough ball by hand on a floured counter from center outwards, preserving the airy crust rim (cornicione). Do not use a rolling pin.', timerMinutes: 5 },
          { stepNumber: 2, title: 'Sauce & Cheese Topping', text: 'Spoon hand-crushed San Marzano tomatoes evenly over the base. Distribute pieces of fresh buffalo mozzarella and a drizzle of extra virgin olive oil.', timerMinutes: 3 },
          { stepNumber: 3, title: 'Bake at Maximum Heat', text: 'Slide onto a preheated baking steel or pizza stone at 250°C (485°F) for 7-9 minutes until crust is charred with leopard spots and cheese is bubbling.', timerMinutes: 8 },
          { stepNumber: 4, title: 'Fresh Basil Finish', text: 'Scatter fresh sweet basil leaves immediately upon removal. Slice and enjoy hot.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 480, protein: 21, carbs: 62, fat: 16, fiber: 4 },
        averageRating: 4.9,
        ratingCount: 38,
        views: 2100,
      },

      // 8. Creamy Wild Mushroom Truffle Pasta - Italy
      {
        title: 'Handcrafted Truffle & Wild Mushroom Fettuccine',
        description: 'Silky egg fettuccine tossed with sautéed cremini & shiitake mushrooms, white wine, garlic, aged Parmigiano Reggiano, and black truffle oil.',
        images: [
          'https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=1000&q=80'
        ],
        author: elenaRossi._id,
        category: 'Dinner',
        cuisine: 'Italian',
        country: 'Italy',
        state: 'Tuscany',
        prepTime: 15,
        cookTime: 15,
        servings: 2,
        difficulty: 'Easy',
        dietary: ['Vegetarian'],
        isFeatured: false,
        ingredients: [
          { name: 'Fresh Egg Fettuccine Pasta', quantity: '250', unit: 'g', note: 'Hand rolled or bronze die', category: 'Grains & Pasta' },
          { name: 'Wild Mushrooms (Cremini & Shiitake)', quantity: '250', unit: 'g', note: 'Cleaned and sliced', category: 'Produce' },
          { name: 'Black Truffle Infused Olive Oil', quantity: '1.5', unit: 'tbsp', note: 'For finishing', category: 'Oils & Sauces' },
          { name: 'Aged Parmigiano Reggiano', quantity: '1/2', unit: 'cup', note: 'Freshly grated', category: 'Dairy & Eggs' },
          { name: 'Butter & Garlic', quantity: '2', unit: 'tbsp', note: 'Minced garlic cloves', category: 'Dairy & Eggs' },
          { name: 'Dry White Wine', quantity: '1/4', unit: 'cup', note: 'For deglazing', category: 'Pantry & Spices' },
          { name: 'Fresh Italian Flat Leaf Parsley', quantity: '2', unit: 'tbsp', note: 'Finely chopped', category: 'Produce' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Sear Mushrooms in Brown Butter', text: 'Heat butter and olive oil in a wide skillet over high heat. Add sliced wild mushrooms without overcrowding. Sear for 5 minutes until deeply browned.', timerMinutes: 5 },
          { stepNumber: 2, title: 'Aromatics & Deglaze', text: 'Add minced garlic and thyme. Sauté for 1 minute. Deglaze pan with white wine and reduce until almost dry.', timerMinutes: 3 },
          { stepNumber: 3, title: 'Cook Pasta al Dente', text: 'Boil fresh fettuccine in heavily salted water for 3 minutes until al dente. Reserve 1/2 cup of starchy pasta water.', timerMinutes: 3 },
          { stepNumber: 4, title: 'Emulsify Sauce', text: 'Transfer pasta directly into the mushroom skillet. Add grated parmesan and pasta cooking water. Toss vigorously to create a silky, glossy emulsion.', timerMinutes: 2 },
          { stepNumber: 5, title: 'Truffle Drizzle & Plating', text: 'Drizzle aromatic black truffle oil, crack fresh black pepper, and garnish with parsley. Serve immediately.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 510, protein: 19, carbs: 58, fat: 22, fiber: 5 },
        averageRating: 4.8,
        ratingCount: 25,
        views: 1250,
      },

      // 9. Mexican Street Tacos al Pastor - Mexico
      {
        title: 'Smoky Mexican Street Tacos al Pastor',
        description: 'Tender marinated pork or mushroom strips infused with achiote, chipotle, citrus, and roasted sweet pineapple in warm handmade corn tortillas.',
        images: [
          'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=80'
        ],
        author: priyaPatel._id,
        category: 'Dinner',
        cuisine: 'Mexican',
        country: 'Mexico',
        state: 'Oaxaca',
        prepTime: 20,
        cookTime: 20,
        servings: 4,
        difficulty: 'Medium',
        dietary: ['Dairy-Free', 'Gluten-Free'],
        isFeatured: false,
        ingredients: [
          { name: 'Thin Pork Strips or King Oyster Mushroom', quantity: '500', unit: 'g', note: 'Sliced thin', category: 'Produce' },
          { name: 'Achiote Paste & Chipotle Peppers', quantity: '2', unit: 'tbsp', note: 'Mexican spiced paste', category: 'Pantry & Spices' },
          { name: 'Fresh Pineapple Slices', quantity: '1', unit: 'cup', note: 'Grilled & diced', category: 'Produce' },
          { name: 'Small Corn Tortillas', quantity: '8', unit: 'pieces', note: 'Warmed', category: 'Bakery' },
          { name: 'White Onion & Cilantro', quantity: '1/2', unit: 'cup', note: 'Finely minced', category: 'Produce' },
          { name: 'Lime Wedges & Salsa Verde', quantity: '4', unit: 'wedges', note: 'For serving', category: 'Produce' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Adobo Marinade', text: 'Blend achiote paste, chipotle peppers in adobo, orange juice, vinegar, garlic, oregano, and cumin to a smooth marinade. Coat meat/mushroom for 30 minutes.', timerMinutes: 30 },
          { stepNumber: 2, title: 'High Heat Skillet Char', text: 'Sear the marinated slices on a smoking hot skillet with pineapple chunks until nicely caramelized and lightly charred.', timerMinutes: 8 },
          { stepNumber: 3, title: 'Warm Tortillas', text: 'Heat corn tortillas on a dry skillet for 30 seconds each side until pliable and fragrant.', timerMinutes: 2 },
          { stepNumber: 4, title: 'Assemble Tacos', text: 'Double stack tortillas, load with seared spiced filling, grilled pineapple chunks, minced onion, fresh cilantro, and a generous squeeze of fresh lime juice.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 390, protein: 26, carbs: 42, fat: 12, fiber: 5 },
        averageRating: 4.8,
        ratingCount: 20,
        views: 1120,
      },

      // 10. Japanese Shoyu Ramen - Japan
      {
        title: 'Authentic Tokyo Shoyu Ramen with Ajitsuke Tamago',
        description: 'Steaming umami broth infused with dashi and soy tare, springy ramen noodles, soft-boiled marinated jammy egg, nori seaweed, and bamboo shoots.',
        images: [
          'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80'
        ],
        author: chefAarav._id,
        category: 'Dinner',
        cuisine: 'Japanese',
        country: 'Japan',
        state: 'Tokyo',
        prepTime: 25,
        cookTime: 35,
        servings: 2,
        difficulty: 'Medium',
        dietary: ['High-Protein'],
        isFeatured: true,
        ingredients: [
          { name: 'Fresh Japanese Ramen Noodles', quantity: '250', unit: 'g', note: 'Springy wheat noodles', category: 'Grains & Pasta' },
          { name: 'Dashi Stock & Chicken/Vegetable Broth', quantity: '4', unit: 'cups', note: 'Simmered with kombu and ginger', category: 'Pantry & Spices' },
          { name: 'Japanese Soy Sauce (Shoyu) & Mirin', quantity: '3', unit: 'tbsp', note: 'Tare seasoning base', category: 'Oils & Sauces' },
          { name: 'Ajitsuke Tamago (Marinated Soft Eggs)', quantity: '2', unit: 'pieces', note: 'Jammy yolks', category: 'Dairy & Eggs' },
          { name: 'Nori Sheets & Menma Bamboo Shoots', quantity: '2', unit: 'sheets', note: 'For garnish', category: 'Pantry & Spices' },
          { name: 'Scallions / Spring Onions', quantity: '1/2', unit: 'cup', note: 'Finely sliced', category: 'Produce' },
          { name: 'Toasted Sesame Oil & Chilli Oil', quantity: '1', unit: 'tsp', note: 'Aromatics', category: 'Oils & Sauces' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Simmer Umami Broth', text: 'In a saucepan, combine broth, soy sauce tare, mirin, smashed garlic, and sliced ginger. Simmer gently for 20 minutes to concentrate flavors.', timerMinutes: 20 },
          { stepNumber: 2, title: 'Boil Springy Noodles', text: 'In a separate pot of rapidly boiling water, cook fresh ramen noodles for exactly 90-120 seconds. Drain thoroughly.', timerMinutes: 2 },
          { stepNumber: 3, title: 'Warm the Ramen Bowls', text: 'Pour piping hot broth into deep warmed ceramic ramen bowls.', timerMinutes: 1 },
          { stepNumber: 4, title: 'Fold Noodles & Garnish', text: 'Slide noodles into broth using chopsticks in a folded motion. Top with halved marinated eggs, nori sheets, bamboo shoots, scallions, and a drizzle of toasted sesame oil.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 460, protein: 22, carbs: 64, fat: 14, fiber: 4 },
        averageRating: 5.0,
        ratingCount: 31,
        views: 1980,
      },

      // 11. Thai Coconut Green Curry - Thailand
      {
        title: 'Fragrant Thai Coconut Green Curry with Jasmine Rice',
        description: 'Vibrant green curry paste simmered with silky coconut milk, bamboo shoots, Thai eggplant, kaffir lime leaves, and sweet Thai basil.',
        images: [
          'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=1000&q=80'
        ],
        author: priyaPatel._id,
        category: 'Dinner',
        cuisine: 'Thai',
        country: 'Thailand',
        state: 'Bangkok',
        prepTime: 15,
        cookTime: 20,
        servings: 3,
        difficulty: 'Easy',
        dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free'],
        isFeatured: false,
        ingredients: [
          { name: 'Authentic Thai Green Curry Paste', quantity: '3', unit: 'tbsp', note: 'Fresh lemongrass & green chilli blend', category: 'Pantry & Spices' },
          { name: 'Coconut Milk (Full Fat)', quantity: '400', unit: 'ml', note: 'Creamy canned coconut milk', category: 'Pantry & Spices' },
          { name: 'Tofu Cubes or Protein of choice', quantity: '250', unit: 'g', note: 'Pan fried', category: 'Produce' },
          { name: 'Thai Eggplant & Bell Peppers', quantity: '1', unit: 'cup', note: 'Quartered', category: 'Produce' },
          { name: 'Kaffir Lime Leaves & Thai Sweet Basil', quantity: '1', unit: 'handful', note: 'Torn fresh', category: 'Produce' },
          { name: 'Fragrant Steamed Jasmine Rice', quantity: '2', unit: 'cups', note: 'For serving', category: 'Grains & Pasta' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Crack Coconut Cream', text: 'Heat 3 tbsp thick coconut cream in a wok over medium flame until the oil begins to separate.', timerMinutes: 3 },
          { stepNumber: 2, title: 'Fry Curry Paste', text: 'Add green curry paste and sauté for 2 minutes until intensely fragrant.', timerMinutes: 2 },
          { stepNumber: 3, title: 'Simmer Vegetables', text: 'Pour in remaining coconut milk and 1/2 cup water. Add eggplant, bamboo shoots, and bell peppers. Simmer for 8 minutes until tender.', timerMinutes: 8 },
          { stepNumber: 4, title: 'Tofu & Basil Finish', text: 'Fold in tofu cubes, torn kaffir lime leaves, palm sugar, and fresh Thai basil. Turn off heat immediately and serve with Jasmine rice.', timerMinutes: 2 }
        ],
        nutritionFacts: { calories: 420, protein: 14, carbs: 48, fat: 21, fiber: 6 },
        averageRating: 4.8,
        ratingCount: 18,
        views: 950,
      },

      // 12. Avocado Sourdough Toast with Poached Egg - Healthy Breakfast
      {
        title: 'Gourmet Avocado Sourdough Toast with Soft Poached Egg',
        description: 'Thick toasted artisan sourdough crowned with mashed Hass avocado, lime zest, microgreens, everything bagel seasoning, and a runny poached farm egg.',
        images: [
          'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1000&q=80'
        ],
        author: priyaPatel._id,
        category: 'Breakfast',
        cuisine: 'Healthy / Modern',
        country: 'USA',
        state: 'California',
        prepTime: 10,
        cookTime: 5,
        servings: 1,
        difficulty: 'Easy',
        dietary: ['Vegetarian', 'Healthy', 'High-Protein', 'Low-Calorie'],
        isFeatured: true,
        ingredients: [
          { name: 'Artisan Sourdough Bread', quantity: '2', unit: 'slices', note: 'Thick cut & toasted', category: 'Bakery' },
          { name: 'Ripe Hass Avocado', quantity: '1', unit: 'medium', note: 'Mashed with lime juice and sea salt', category: 'Produce' },
          { name: 'Fresh Organic Eggs', quantity: '2', unit: 'large', note: 'Poached soft', category: 'Dairy & Eggs' },
          { name: 'Chilli Flakes & Everything Bagel Seasoning', quantity: '1', unit: 'tsp', note: 'For crunch', category: 'Pantry & Spices' },
          { name: 'Radish Slices & Microgreens', quantity: '2', unit: 'tbsp', note: 'Garnish', category: 'Produce' },
          { name: 'Extra Virgin Olive Oil', quantity: '1', unit: 'tsp', note: 'Finishing drizzle', category: 'Oils & Sauces' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Toast Sourdough', text: 'Toast sourdough slices until crispy and golden brown.', timerMinutes: 3 },
          { stepNumber: 2, title: 'Poach Egg', text: 'Create a gentle whirlpool in a pot of simmering water with 1 tbsp vinegar. Drop the cracked egg in center and cook for 3 minutes for a runny center.', timerMinutes: 3 },
          { stepNumber: 3, title: 'Assemble', text: 'Spread creamy seasoned avocado generously over the toast. Place warm poached egg on top. Dust with everything bagel spice and microgreens.', timerMinutes: 1 }
        ],
        nutritionFacts: { calories: 340, protein: 16, carbs: 28, fat: 19, fiber: 7 },
        averageRating: 4.9,
        ratingCount: 45,
        views: 2200,
      },

      // 13. French Croissants - France Bakery
      {
        title: 'Golden Flaky French Butter Croissants',
        description: 'Traditional laminated pastry with dozens of crisp, buttery golden layers and a delicate honeycomb interior.',
        images: [
          'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=80'
        ],
        author: marcusVance._id,
        category: 'Bakery',
        cuisine: 'French',
        country: 'France',
        state: 'Île-de-France',
        prepTime: 60,
        cookTime: 20,
        servings: 8,
        difficulty: 'Hard',
        dietary: ['Vegetarian'],
        isFeatured: false,
        ingredients: [
          { name: 'High-Grade Bread Flour', quantity: '500', unit: 'g', note: 'Fine French T55 or strong bread flour', category: 'Bakery' },
          { name: 'European Style Unsalted Butter (82% fat)', quantity: '250', unit: 'g', note: 'For butter block', category: 'Dairy & Eggs' },
          { name: 'Whole Milk & Water', quantity: '280', unit: 'ml', note: 'Chilled', category: 'Dairy & Eggs' },
          { name: 'Instant Yeast & Sugar', quantity: '2', unit: 'tsp', note: 'Fermentation', category: 'Bakery' },
          { name: 'Egg Wash', quantity: '1', unit: 'egg', note: 'Beaten with pinch of salt', category: 'Dairy & Eggs' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Détrempe Dough & Butter Block', text: 'Knead flour, milk, sugar, yeast and salt into a supple dough. Chill overnight. Shape butter into a uniform 18x18cm square block.', timerMinutes: 20 },
          { stepNumber: 2, title: 'Lamination Turns', text: 'Encase butter block inside dough. Perform 3 sets of letter folds (tri-folds) with 45 minutes resting in the fridge between turns.', timerMinutes: 45 },
          { stepNumber: 3, title: 'Shape & Proof', text: 'Roll out dough to 4mm thickness. Cut into elongated triangles and roll tightly into crescent crescents. Proof for 2 hours until jiggly.', timerMinutes: 120 },
          { stepNumber: 4, title: 'Bake to Deep Amber', text: 'Brush lightly with egg wash. Bake at 200°C (390°F) for 18-20 minutes until deeply golden brown and flaky.', timerMinutes: 20 }
        ],
        nutritionFacts: { calories: 310, protein: 6, carbs: 32, fat: 18, fiber: 2 },
        averageRating: 4.9,
        ratingCount: 29,
        views: 1650,
      },

      // 14. Molten Chocolate Lava Cake - Dessert
      {
        title: 'Decadent Dark Chocolate Molten Lava Cake',
        description: 'Rich warm chocolate individual cake with a decadent, gooey liquid chocolate truffle center, served with vanilla bean gelato and fresh berries.',
        images: [
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1000&q=80'
        ],
        author: marcusVance._id,
        category: 'Dessert',
        cuisine: 'French',
        country: 'France',
        state: 'Paris',
        prepTime: 15,
        cookTime: 12,
        servings: 2,
        difficulty: 'Easy',
        dietary: ['Vegetarian'],
        isFeatured: true,
        ingredients: [
          { name: '70% Dark Bittersweet Chocolate', quantity: '120', unit: 'g', note: 'High quality baking chocolate', category: 'Pantry & Spices' },
          { name: 'Unsalted Butter', quantity: '60', unit: 'g', note: 'Melted with chocolate', category: 'Dairy & Eggs' },
          { name: 'Whole Eggs & Egg Yolks', quantity: '2', unit: 'eggs + 1 yolk', note: 'Room temperature', category: 'Dairy & Eggs' },
          { name: 'Powdered Sugar & Flour', quantity: '3', unit: 'tbsp', note: 'Sifted', category: 'Bakery' },
          { name: 'Pure Vanilla Extract & Espresso Powder', quantity: '1', unit: 'tsp', note: 'Flavor boosters', category: 'Pantry & Spices' },
        ],
        instructions: [
          { stepNumber: 1, title: 'Melt Chocolate & Butter', text: 'Melt dark chocolate and butter together in a heatproof bowl set over a pot of simmering water until glossy and smooth.', timerMinutes: 5 },
          { stepNumber: 2, title: 'Whip Eggs and Sugar', text: 'Whisk eggs, egg yolk, vanilla, and powdered sugar vigorously for 2 minutes until pale and slightly frothy.', timerMinutes: 2 },
          { stepNumber: 3, title: 'Fold and Pour', text: 'Fold melted chocolate into egg mixture, then gently fold in flour. Pour into buttered and cocoa-dusted ramekins.', timerMinutes: 3 },
          { stepNumber: 4, title: 'Bake for Molten Center', text: 'Bake at 220°C (425°F) for exactly 11-12 minutes until sides are set but center remains soft and jiggling.', timerMinutes: 12 },
          { stepNumber: 5, title: 'Invert & Serve', text: 'Let stand 1 minute. Run a knife around edge and invert onto dessert plates. Dust with cocoa and serve with ice cream.', timerMinutes: 0 }
        ],
        nutritionFacts: { calories: 430, protein: 7, carbs: 46, fat: 26, fiber: 4 },
        averageRating: 5.0,
        ratingCount: 52,
        views: 2900,
      },
    ];

    const createdRecipes = [];
    for (const recipeData of recipesData) {
      // Add sample ratings and comments
      recipeData.likes = [demoUser._id, priyaPatel._id];
      recipeData.ratings = [
        {
          user: demoUser._id,
          rating: 5,
          comment: 'Cooked this for family dinner last night and it was absolutely magnificent! The flavors were so balanced.',
          createdAt: new Date(),
        },
        {
          user: priyaPatel._id,
          rating: 5,
          comment: 'Super easy to follow instructions. The timer features made cooking stress-free!',
          createdAt: new Date(),
        },
      ];
      const recipe = new Recipe(recipeData);
      await recipe.save();
      createdRecipes.push(recipe);
    }
    console.log(`[Seed] Created ${createdRecipes.length} rich recipes.`);

    // Bookmark some recipes for demoUser
    demoUser.savedRecipes = [createdRecipes[0]._id, createdRecipes[2]._id, createdRecipes[6]._id, createdRecipes[11]._id];
    await demoUser.save();

    // Create Food Communities
    const sampleCommunities = [
      {
        name: 'Spice Masters & Heritage Indian Cooking',
        slug: 'spice-masters-indian-cooking',
        description: 'A vibrant community celebrating regional Indian spices, slow-cooking techniques, dum biryanis, and heritage family recipes.',
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
        category: 'Regional Indian',
        creator: chefAarav._id,
        members: [chefAarav._id, demoUser._id, priyaPatel._id],
        rules: [
          'Share your authentic cooking techniques & spice proportions.',
          'Respect traditional culinary heritage while welcoming modern twists.',
          'Be helpful and answer beginner questions with enthusiasm.'
        ],
      },
      {
        name: 'Artisan Baking & Dessert Guild',
        slug: 'artisan-baking-dessert-guild',
        description: 'For passionate sourdough bakers, flaky croissant artisans, and dessert dreamers perfecting their crumb and lamination.',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1200&q=80',
        category: 'Bakery & Desserts',
        creator: marcusVance._id,
        members: [marcusVance._id, demoUser._id, elenaRossi._id],
      },
      {
        name: 'Plant-Based & Healthy Living',
        slug: 'plant-based-healthy-living',
        description: 'Nutritious vegan, vegetarian, and wholesome meal prep ideas to nourish your body with vibrant natural ingredients.',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
        category: 'Healthy & Vegan',
        creator: priyaPatel._id,
        members: [priyaPatel._id, demoUser._id],
      },
      {
        name: '15-Minute Weeknight Dinners',
        slug: '15-minute-weeknight-dinners',
        description: 'Quick, delicious, and stress-free meals for busy food lovers that deliver maximum flavor in under 20 minutes.',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
        banner: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80',
        category: 'Quick Meals',
        creator: elenaRossi._id,
        members: [elenaRossi._id, demoUser._id, chefAarav._id],
      },
    ];

    const createdCommunities = [];
    for (const commData of sampleCommunities) {
      const comm = new Community(commData);
      await comm.save();
      createdCommunities.push(comm);
    }
    console.log(`[Seed] Created ${createdCommunities.length} communities.`);

    // Create Community Posts
    const samplePosts = [
      {
        community: createdCommunities[0]._id,
        author: chefAarav._id,
        title: 'The Secret to achieving silky smooth Butter Chicken gravy',
        content: 'Many home cooks struggle with gritty tomato gravy. The secret is double-straining your tomato puree after cooking and adding chilled cubes of butter off the flame at the very end to emulsify with the cream! Try it with our Butter Chicken recipe.',
        sharedRecipe: createdRecipes[0]._id,
        likes: [demoUser._id, priyaPatel._id],
        comments: [
          {
            author: demoUser._id,
            content: 'This trick completely changed my curry game! Restaurant quality at home.',
            createdAt: new Date(),
          },
        ],
      },
      {
        community: createdCommunities[1]._id,
        author: marcusVance._id,
        title: 'Croissant Honeycomb Crumb structure experiment',
        content: 'Tested 3 vs 4 single turns with 82% European dry butter. 3 letter folds consistently gave the most open and airy honeycomb interior. Keep your dough cold at 4°C during lamination!',
        sharedRecipe: createdRecipes[12]._id,
        likes: [elenaRossi._id, demoUser._id],
        comments: [],
      },
    ];

    for (const postData of samplePosts) {
      const post = new CommunityPost(postData);
      await post.save();
    }
    console.log('[Seed] Created community posts.');

    // Create a pre-seeded Weekly Meal Plan for demoUser
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const formatDate = (d) => d.toISOString().split('T')[0];

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekDays = [];

    for (let i = 0; i < 7; i++) {
      const currentDayDate = new Date(startOfWeek);
      currentDayDate.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDate(currentDayDate);

      weekDays.push({
        date: dateStr,
        dayOfWeek: daysOfWeek[i],
        breakfast: [
          { recipe: i % 2 === 0 ? createdRecipes[2]._id : createdRecipes[11]._id, customTitle: '', notes: 'Energizing start' }
        ],
        lunch: [
          { recipe: i % 3 === 0 ? createdRecipes[3]._id : createdRecipes[5]._id, customTitle: '', notes: 'Nutritious mid-day meal' }
        ],
        dinner: [
          { recipe: i % 2 === 0 ? createdRecipes[0]._id : createdRecipes[6]._id, customTitle: '', notes: 'Wholesome dinner' }
        ],
        snacks: [
          { recipe: createdRecipes[13]._id, customTitle: 'Green Tea & Roasted Almonds', notes: 'Guilt-free snack' }
        ],
      });
    }

    const demoMealPlan = new MealPlan({
      user: demoUser._id,
      planType: 'weekly',
      title: 'Energizing Gourmet Weekly Schedule',
      startDate: formatDate(startOfWeek),
      endDate: formatDate(endOfWeek),
      days: weekDays,
      notes: 'Focus on balanced macros and vibrant regional flavors this week.',
    });

    await demoMealPlan.save();
    console.log('[Seed] Created default weekly meal plan for demo user.');

    console.log('====================================================');
    console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
    console.log(`Demo Account: demo@recipecompanion.com / password123`);
    console.log(`Chef Account: aarav@recipecompanion.com / password123`);
    console.log('====================================================');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
