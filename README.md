# BadgerBase Mobile App

A React Native mobile application for UW-Madison students to search and filter courses with instructor ratings and GPA information.

## Features

- **Smart Search**: Search courses by course code, name, or instructor
- **Advanced Filtering**: Filter by availability, instruction mode, credits, GPA, and more
- **Instructor Ratings**: View Rate My Professor ratings and difficulty levels
- **Real-time Data**: Up-to-date course availability and enrollment information
- **Grade Distribution**: Visual charts showing grade distributions for courses
- **Mobile Optimized**: Native mobile experience with smooth navigation

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd badgerbase-mobile
```

2. Install dependencies:
```bash
npm install
```

3. Configure API endpoint:
   - Open `src/services/apiService.ts`
   - Replace `API_BASE_URL` with your actual API endpoint
   - Replace `CLIENT_SECRET` with your actual client secret

4. Start the development server:
```bash
npm start
```

5. Run on your preferred platform:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CourseCard.tsx
│   ├── CourseList.tsx
│   ├── GradeChart.tsx
│   ├── SearchFilters.tsx
│   └── SectionCard.tsx
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   └── AboutScreen.tsx
├── services/           # API and external services
│   └── apiService.ts
├── theme/              # Theme and styling
│   └── theme.ts
└── types/              # TypeScript type definitions
    └── Course.ts
```

## Key Components

- **HomeScreen**: Main search interface with course listings
- **AboutScreen**: Information about the app and its features
- **CourseCard**: Expandable card showing course details
- **SearchFilters**: Comprehensive filtering interface
- **GradeChart**: Visual representation of grade distributions

## API Integration

The app integrates with the BadgerBase API to fetch:
- Course information and descriptions
- Section details and availability
- Instructor ratings from Rate My Professor
- Grade distribution data from Madgrades

## Customization

### Theming
Modify `src/theme/theme.ts` to customize colors and styling throughout the app.

### API Configuration
Update `src/services/apiService.ts` to configure API endpoints and authentication.

## Building for Production

1. Build the app:
```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

2. Follow Expo's documentation for publishing to app stores.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

This project is for educational purposes only and is not affiliated with UW-Madison.

## Data Sources

- UW-Madison Course Catalog
- Rate My Professor
- Madgrades