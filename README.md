
# Within College Hardware/Software Complaint Management System - Backend

This is the backend server for the College Hardware Complaint Management System. It provides a RESTful API powered by **Node.js** and **Express**, securely managing data with **MongoDB**.

## 🚀 Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Validation:** Zod
- **Email Service:** Nodemailer & Brevo (@getbrevo/brevo)
- **Task Scheduling:** node-cron
- **File Uploads/Storage:** Multer & AWS S3 (@aws-sdk/client-s3)
- **Reporting:** exceljs (for generating Excel reports)
- **Security:** Helmet, express-rate-limit, cors

## 📂 Architecture & Structure

The backend follows an MVC-like pattern with a strong separation of concerns:

```
server/
├── src/
│   ├── config/      # Database connections and configuration
│   ├── controllers/ # Request handlers and business logic entry points
│   ├── middleware/  # Auth, Error handling, and Validation middleware
│   ├── models/      # Mongoose schemas (User, Complaint, etc.)
│   ├── routes/      # API endpoint definitions
│   ├── services/    # Core business logic and database queries
│   ├── utils/       # Helpers (Error classes, Email templates)
│   ├── validations/ # Zod schemas for request validation
│   ├── app.js       # Express app setup and middleware registration
│   └── server.js    # Entry point & server instantiation
└── package.json     # Project dependencies and scripts
```

## 🛠️ Key Features

- **Secure Authentication & Authorization:** Role-based access control (RBAC) ensuring Users, Managers, and Admins can only access relevant endpoints.
- **Complaint Lifecycle Management:** Create, track, escalate, and resolve hardware complaints.
- **Server-Side Pagination:** Optimized data fetching for dashboards handling large amounts of data.
- **Automated Email Notifications:** Triggered emails for account creation, complaint status updates, and resolutions.
- **Activity Tracking:** Logging changes, updates, and escalations associated with individual complaints.
- **Report Generation:** Generates departmental and user activity reports (exportable to Excel).

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)

### Environment Variables

Create a `.env` file in the `server` directory and add the necessary configurations (adjust values accordingly):

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=30d

# Email Services
BREVO_API_KEY=your_brevo_key
EMAIL_FROM=no-reply@yourcollege.edu

# AWS S3 (If configured)
AWS_REGION=your_aws_region
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name
```

### Installation

1. Navigate to the server folder.
2. Install dependencies:

```bash
npm install
```

### Running the Server

**Development Mode (with auto-reload):**

```bash
npm run dev
```

**Production Mode:**

```bash
npm start
```

The API will typically be accessible at `http://localhost:5000`.

## 📜 Error Handling

The application uses a centralized error-handling middleware (`errorMiddleware.js`) and a custom `AppError` class to provide consistent and formatted error responses.
