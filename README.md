# WeRequest: Barangay Resident Management System

WeRequest is a modern, full-featured Barangay Resident Management System designed to streamline barangay operations, empower residents, and provide transparent, efficient, and accessible services for the community of Barangay San Andres.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Folder Structure](#folder-structure)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **Resident Management**: Register, update, and manage resident profiles and information.
- **Document Requests**: Residents can request barangay documents (e.g., Barangay Clearance, Certificate of Indigency, Business Permit, etc.) online.
- **Document Processing**: Admins can verify, approve, decline, and track document requests.
- **Business Registry**: Manage and monitor local businesses, including permit issuance and status tracking.
- **Announcement Board**: Post and view barangay-wide announcements for all users.
- **Blotter Management**: Record, update, and track blotter (incident) reports.
- **Dashboard & Analytics**: Visualize statistics and trends for requests, residents, and documents.
- **Authentication & Roles**: Secure login with role-based access (Super Admin, Admin, Resident).
- **Responsive UI**: Clean, modern, and mobile-friendly interface.

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Actions)
- **Frontend**: React, Tailwind CSS, React Icons
- **Backend**: Node.js, Next.js API routes
- **Database**: MongoDB (via [mongodb](https://www.npmjs.com/package/mongodb))
- **Authentication**: [next-auth](https://next-auth.js.org/)
- **PDF/Export**: html2canvas, jsPDF, @react-pdf/renderer
- **Charts/Analytics**: recharts, simple-statistics

## Modules
- **Resident**: Registration, profile management, resident listing
- **Document**: Request, approve, verify, decline, and export documents
- **Business**: Business registration, permit management, status tracking
- **Announcement**: Post, edit, delete, and view announcements
- **Blotter**: Incident reporting and management
- **Dashboard**: Analytics and statistics for admins

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun
- MongoDB instance (local or cloud)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd werequest
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in the required values (see below).

### Environment Variables
- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - Secret for next-auth

### Running the App
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure
- `app/` - Main Next.js app directory (pages, components, API routes)
- `app/components/` - Reusable React components (SideNavigation, Dashboard, Document, Announcement, etc.)
- `app/api/` - API route handlers (REST endpoints for resident, document, business, etc.)
- `app/lib/` - Utility libraries (e.g., MongoDB connection, authentication)
- `app/types/` - TypeScript types and interfaces
- `generate-documents/` - Scripts and data for generating test residents and documents

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## License
This project is licensed under the MIT License.

---

**WeRequest** - Empowering Barangay San Andres through digital transformation.
