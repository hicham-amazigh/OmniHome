# OmniHome Mobile App

A React Native Expo application that provides the same UI and functionality as the web frontend, consuming the same FastAPI backend.

## Features

- 🔐 **Authentication**: PIN code and biometric authentication
- 🛡️ **Security System**: Arm/disarm, garage control, door locks, panic alerts
- 🌡️ **Climate Control**: Temperature adjustment, fan speed, mode selection
- 🌿 **Garden & Utilities**: Irrigation zones, watering schedule, water tank management
- 💡 **Lighting Control**: Master switch, individual light control

## Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device
- FastAPI backend running on `http://localhost:3000`

## Installation

```bash
cd mobile
npm install
```

## Running the App

### Development Mode

```bash
npm start
```

Then scan the QR code with Expo Go app on your mobile device.

### iOS Simulator

```bash
npm run ios
```

### Android Emulator

```bash
npm run android
```

## Project Structure

```
mobile/
├── app.json                 # Expo configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── babel.config.js          # Babel configuration
├── src/
│   ├── app/
│   │   ├── _layout.tsx      # Root layout with AuthProvider
│   │   └── index.tsx        # Main app entry point
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── lib/
│   │   └── api.ts            # API client (uses AsyncStorage)
│   └── screens/
│       ├── AuthenticationScreen.tsx
│       ├── MainDashboard.tsx
│       ├── ClimateModal.tsx
│       ├── SecurityModal.tsx
│       └── GardenModal.tsx
└── assets/                  # App assets (icons, splash, etc.)
```

## API Configuration

The API base URL is configured in `src/lib/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:3000/api/v1';
```

For production, update this to your server's actual URL.

## Key Differences from Web Version

### Storage
- **Web**: Uses `localStorage`
- **Mobile**: Uses `@react-native-async-storage/async-storage`

### Styling
- **Web**: Uses Tailwind CSS
- **Mobile**: Uses React Native StyleSheet

### Icons
- **Web**: Uses `lucide-react`
- **Mobile**: Uses `lucide-react-native`

### Navigation
- **Web**: Uses conditional rendering
- **Mobile**: Uses `expo-router`

## Development Notes

1. **TypeScript Errors**: You may see TypeScript errors in your IDE until you run `npm install` to install dependencies.

2. **API Connection**: Make sure your FastAPI backend is running on `http://localhost:3000` before starting the app.

3. **Expo Go**: When running with Expo Go, ensure your device and development machine are on the same network.

4. **Hot Reload**: The app supports hot reload during development.

## Troubleshooting

### API Connection Issues
- Verify the backend is running: `curl http://localhost:3000/api/v1/dashboard`
- Check firewall settings if running on a different machine
- Update `API_BASE_URL` in `src/lib/api.ts` if needed

### Build Issues
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Expo CLI version: `expo --version`

## License

This project is part of the OmniHome smart home automation system.
