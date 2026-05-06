# PharmaChain PWA

A comprehensive pharmaceutical supply chain management platform designed to streamline operations between Suppliers, Pharmacies (Clients), and Drivers.

## 🚀 Key Features

### 🏢 Supplier Dashboard
- **Inventory Management**: Track stock levels, batch numbers, and expiry dates.
- **Order Processing**: Approve or reject bulk orders from pharmacies.
- **Driver Assignment**: Coordinate last-mile logistics by assigning drivers to approved orders.
- **Analytics**: Visualize revenue and stock performance via Recharts.

### 🏥 Client (Pharmacy/Clinic) Dashboard
- **Live Catalog**: Search and browse medicines from verified suppliers.
- **Bulk Ordering**: Multi-item cart system for efficient procurement.
- **Track & Trace**: Real-time status updates on all active orders.

### 🚚 Driver Dashboard
- **Delivery Schedule**: View assigned routes and delivery details.
- **Proof of Delivery**: Digital confirmation once supplies are handed over.
- **History**: Complete record of all fulfilled deliveries.

## 🛠 Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Firebase (Auth & Firestore)
- **Animations**: Motion (formerly Framer Motion)
- **Icons**: Lucide React
- **Charts**: Recharts

## 🛡 Security
The project uses hardened Firestore Security Rules implementing:
- Role-based Access Control (RBAC)
- Attribute-based Access Control (ABAC)
- Strict schema validation
- Data isolation for PII (Personally Identifiable Information)

## 📦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Setup**:
   Ensure you have your `firebase-applet-config.json` in the root directory.

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
