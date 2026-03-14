# Citronics (EventHub)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

Citronics is an open-source event management platform built with Next.js, Material-UI (MUI), and PostgreSQL. It provides a comprehensive suite of tools for managing events, tickets, venues, and attendees, complete with role-based access control (RBAC) and Progressive Web App (PWA) capabilities.

## 🚀 Features

- **Event Management**: Create, update, and manage events with ease.
- **Role-Based Access Control (RBAC)**: Granular permissions using CASL.
- **Authentication**: Secure login and session management via NextAuth.js.
- **Progressive Web App (PWA)**: Offline support and installable on mobile/desktop.
- **Interactive Calendar**: FullCalendar integration for event scheduling.
- **Localization**: Built-in i18n support.
- **Modern UI**: Responsive and accessible design powered by MUI v6.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (Pages Router)
- **UI Library**: MUI v6 + Emotion
- **State Management**: Redux Toolkit
- **Authentication**: NextAuth v4
- **Permissions**: CASL
- **Database**: PostgreSQL (via pg-promise)
- **Forms & Validation**: React Hook Form + Zod

## 📦 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **yarn** (recommended package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/NexEvent/citronics.git
   cd citronics
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   Copy the example environment file and configure your variables:
   ```bash
   cp .env.example .env.local
   ```
   *Make sure to update the database credentials and NextAuth secrets in your `.env` file.*

4. **Database Setup**
   Initialize your PostgreSQL database with the provided schema:
   ```bash
   psql -U postgres -f schema.sql
   ```

5. **Start the Development Server**
   ```bash
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 📖 Documentation

Detailed documentation for developers can be found in the [`docs/`](./docs) directory:

- [File Structure](./docs/file-structure.md)
- [Database Setup & Patterns](./docs/database.md)
- [API Conventions](./docs/api-conventions.md)
- [Component Guidelines](./docs/components.md)
- [State Management](./docs/state-management.md)
- [Authentication & ACL](./docs/auth-and-acl.md)
- [PWA Setup](./docs/pwa.md)

## 🤝 Contributing

We welcome contributions from the community! Whether it's a bug fix, new feature, or documentation improvement, your help is appreciated.

Please read our [Contributing Guidelines](CONTRIBUTING.md) to get started.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please also review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

