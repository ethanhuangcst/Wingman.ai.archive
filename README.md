# Wingman.ai

Wingman AI Assistant for Mac - A menu bar application that embeds a web-based AI assistant.

## Project Structure

- **Wingman/**: Mac client code (Swift/SwiftUI)
- **Wingman/Sources/WingmanWeb/**: Web app (Next.js + TypeScript)
- **Documentation/**: Project documentation

## Tech Stack

### Mac Client
- Swift/SwiftUI
- WKWebView for web integration
- Menu bar integration

### Web App
- Next.js 14 + TypeScript
- Ant Design UI library
- Tailwind CSS
- MySQL database

### Backend
- Next.js API Routes (MVP)
- NestJS (planned for production)
- JWT authentication

## Key Features

- Menu bar integration with context-aware behavior
- Internet connectivity testing and offline mode
- WingmanPanel window with fixed size (1200x800px)
- Web app embedding with JavaScript bridge
- User authentication and account management
- Chat functionality and prompt management

## Development

### Mac Client
```bash
# Build and run
swift build
swift run
```

### Web App
```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment

- Mac app: Notarized macOS application
- Web app: AliCloud ECS or Serverless
- Database: AliCloud RDS MySQL
