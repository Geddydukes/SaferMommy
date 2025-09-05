# SaferMommy - Recipe Management App

SaferMommy helps expecting and new parents instantly check food and household products for pregnancy safety — scan, search, and shop with confidence.

## 🌟 Features

### Core Functionality
- **Recipe Management**: Create, edit, and organize your favorite recipes
- **AI Recipe Scanning**: Upload photos of recipes to automatically extract ingredients and instructions
- **Smart Shopping Lists**: Generate shopping lists from recipes with intelligent ingredient consolidation
- **Recipe Video Generation**: Create engaging cooking videos from your recipes using AI
- **User Authentication**: Secure user accounts with Supabase authentication
- **Cross-Platform**: Works on iOS, Android, and Web

### Key Screens
- **Home**: Featured recipes and quick actions
- **Recipes**: Browse, search, and filter your recipe collection
- **Scan**: AI-powered recipe extraction from images
- **Shopping**: Categorized shopping lists with smart consolidation
- **Settings**: User preferences and account management

## 🛠 Tech Stack

### Frontend
- **React Native** with **Expo SDK 52**
- **Expo Router** for navigation
- **TypeScript** for type safety
- **Lucide React Native** for icons
- **Expo Image** for optimized image handling

### Backend & Services
- **Supabase** for database and authentication
- **Google Gemini AI** for recipe parsing and video generation
- **Row Level Security (RLS)** for data protection

### Development Tools
- **Expo CLI** for development workflow
- **TypeScript** for enhanced developer experience
- **ESLint** for code quality

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd safermommy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the migration files in `supabase/migrations/`
   - Configure authentication settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📱 Platform Support

- **Web**: Full functionality with responsive design
- **iOS**: Native iOS app (requires development build for AI features)
- **Android**: Native Android app (requires development build for AI features)

## 🏗 Project Structure

```
safermommy/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   ├── services/          # Business logic and API calls
│   └── utils/             # Utility functions
├── components/            # Reusable UI components
├── lib/                   # Configuration and setup
├── types/                 # TypeScript type definitions
├── supabase/             # Database migrations
└── docs/                 # Project documentation
```

## 🔧 Key Services

### AI Service (`services/ai.ts`)
- Recipe parsing from images using Google Gemini
- Video generation for recipes
- Ingredient categorization

### Authentication Service (`services/authService.ts`)
- User registration and login
- Session management
- Supabase integration

### Recipe Service (`services/recipeService.ts`)
- CRUD operations for recipes
- Database interactions
- Recipe data management

### Shopping Service (`services/shoppingService.ts`)
- Shopping list management
- Item consolidation
- Category organization

## 📊 Database Schema

The app uses Supabase with the following main tables:
- `profiles` - User profile information
- `recipes` - Recipe data and metadata
- `ingredients` - Recipe ingredients with amounts and categories
- `instructions` - Step-by-step cooking instructions
- `shopping_lists` - User shopping lists
- `shopping_items` - Individual shopping list items

## 🔐 Security

- **Row Level Security (RLS)** enabled on all tables
- **Authentication required** for all operations
- **User data isolation** - users can only access their own data
- **Secure API key management** through environment variables

## 🎨 Design System

- **Typography**: Inter and Space Grotesk fonts
- **Color Palette**: Modern, accessible color scheme with primary accent color #FF6B6B
- **Icons**: Lucide React Native icon library
- **Spacing**: 8px grid system
- **Components**: Consistent, reusable UI components

## 📝 Development Status

### ✅ Completed Features
- Basic navigation structure
- UI for all main screens
- Supabase integration setup
- Type definitions
- Service layer architecture

### 🚧 In Progress
- Database integration
- AI service implementation
- User authentication flow
- Recipe CRUD operations

### 📋 Planned Features
- Recipe sharing
- Meal planning
- Offline support
- Push notifications
- Recipe favorites
- Advanced search and filtering

## 🧪 Testing

Currently, the project uses manual testing. Planned testing implementation:
- Unit tests with Jest
- Integration tests
- E2E tests with Detox

## 🚀 Deployment

### Web Deployment
```bash
npm run build:web
```

### Mobile App Builds
The app uses Expo managed workflow. For production builds:
```bash
eas build --platform all
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the TODO.md for known issues
- Create an issue in the repository

## 🙏 Acknowledgments

- **Expo Team** for the excellent development platform
- **Supabase** for backend infrastructure
- **Google** for Gemini AI capabilities
- **Lucide** for the beautiful icon set

---

Built with ❤️ using React Native and Expo
