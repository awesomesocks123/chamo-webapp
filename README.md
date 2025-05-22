# Chamo Chat

Chamo Chat is a modern real-time messaging application built with Next.js, React, and Tailwind CSS. It provides a seamless and intuitive chat experience with features like real-time messaging, topic exploration, user settings, and more.

![Chamo Chat Screenshot](https://via.placeholder.com/800x450.png?text=Chamo+Chat+Screenshot)

## Features

- **Real-time Messaging**: Communicate with other users instantly
- **User Authentication**: Secure login with Google authentication
- **Explore Page**: Discover and join topic-based chat rooms
- **Topic Creation**: Create your own topics for discussion
- **Settings Management**: Customize your profile and application preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Toggle between light and dark themes

## Pages

### Chat Page
- Real-time messaging interface
- Chat session management
- User search functionality

### Explore Page
- Browse available topics
- Create new topics with descriptions and images
- Search and sort topics

### Settings Page
- Profile customization
- Help request submission
- FAQ section
- User blocklist management
- Privacy policy information

## Tech Stack

- **Frontend**: React, Next.js 15
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Authentication
- **Real-time Communication**: Socket.io
- **State Management**: Zustand
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/chamo-chat.git
   cd chamo-chat
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
chamo-webapp/
├── public/             # Static files
├── src/
│   ├── app/            # Next.js app router
│   │   ├── auth/       # Authentication pages
│   │   ├── chat/       # Chat interface
│   │   ├── components/ # Shared components
│   │   ├── context/    # React context providers
│   │   ├── explore/    # Topic exploration
│   │   ├── lib/        # Utility functions
│   │   ├── settings/   # User settings
│   │   ├── globals.css # Global styles
│   │   └── layout.tsx  # Root layout
├── .env.local         # Environment variables (create this)
├── next.config.js     # Next.js configuration
├── package.json       # Dependencies
├── postcss.config.mjs # PostCSS configuration
└── README.md          # Project documentation
```

## Styling

The application uses Tailwind CSS for styling with a custom color palette defined in the global CSS file. The styling approach is modular and component-based, making it easy to maintain and extend.

## Authentication

User authentication is handled through Firebase Authentication, supporting Google sign-in. The authentication state is persisted in localStorage to prevent users from being logged out on page refresh.

## Deployment

The application can be deployed to various platforms:

### Vercel (Recommended)

```bash
npm run build
vercel deploy
```

### Netlify

```bash
npm run build
# Deploy using Netlify CLI or connect your GitHub repository
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Firebase for authentication services
- All open-source contributors whose libraries made this project possible
