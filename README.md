# WorkConnect

[GitHub](https://github.com/bantupallisarath7/WorkConnect) • [Live](https://work-connect-seven.vercel.app/)

## Overview
WorkConnect is a role-based MERN stack web application that enables customers to book workers for same-day services. The platform supports three types of users: Customer, Connector, and Worker, ensuring seamless coordination even for workers without direct system access.

---

## Features

- **Customer**
  - Book workers for same-day services (no future booking)
  - View available workers

- **Connector**
  - Manage workers who don’t use the platform
  - Handle bookings on behalf of workers

- **Worker**
  - Manage personal bookings
  - Toggle daily availability

- **Authentication**
  - JWT-based authentication
  - OTP verification using Redis

---

## Tech Stack

- **Frontend:** React.js, Tailwind CSS  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB  
- **Authentication:** JWT + Redis (OTP)

---

## Key Highlights

- Role-based system (Customer, Connector, Worker)
- Same-day booking constraint (real-world use case)
- Availability toggling for workers
- Connector-managed workforce model
- Secure OTP authentication using Redis

---

## Installation

```bash
# Clone repo
git clone https://github.com/bantupallisarath7/WorkConnect.git

# Backend
cd backend
npm install
npm run dev

# Frontend
cd ../frontend
npm install
npm start
```
## Links
- GitHub: (https://github.com/bantupallisarath7/WorkConnect.git)
- Live: (https://work-connect-seven.vercel.app/)
