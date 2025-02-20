# The Master Key

A reflection system to track your personal progress across different aspects of life.

## Features

- Track 5 key aspects of personal development:
  - Mental Product
  - Health
  - Time Efficiency
  - Creative Power
  - Concentration
- Daily progress logging
- Progress visualization
- Meditation guide
- Local data storage

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/the-master-key.git
cd the-master-key
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

For development mode:
```bash
npm run dev
```

## Usage

1. Use the sliders to rate your current levels in each category (0-100%)
2. Click "Save Entry" to log your daily progress
3. View your history in the logs table
4. Follow the meditation steps for daily practice

## Project Structure

```
the-master-key/
├── src/
│   ├── main/           # Main process files
│   ├── renderer/       # Renderer process files
│   │   ├── assets/    # Images and icons
│   │   ├── components/# UI components
│   │   ├── styles/    # CSS files
│   │   └── pages/     # Page templates
│   └── database/      # Database operations
├── package.json
└── README.md
```

## Technologies Used

- Electron.js
- SQLite3
- Tailwind CSS
- Chart.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 