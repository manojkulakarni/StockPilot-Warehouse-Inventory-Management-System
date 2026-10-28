# StockPilot — Warehouse Inventory Management System

A portfolio-ready warehouse inventory application with a Spring Boot REST API, Hibernate/JPA persistence, MySQL, and a responsive React dashboard.

## Features
- Inventory dashboard with SKU count, units on hand, low-stock alerts and inventory valuation
- Product catalog with SKU uniqueness, categories, bin locations, reorder levels and search
- Stock-in / stock-out transactions with an audit trail and prevention of negative inventory
- Customer order processing that validates availability and reduces stock in a database transaction
- Recent movement feed, low-stock report, category chart, and CSV export
- Validation/error responses, demo seed data, and Swagger/OpenAPI documentation

## Stack
- Java 21, Spring Boot 3.4, Spring Web, Spring Data JPA, Hibernate, Bean Validation
- MySQL 8
- React, Vite, Recharts, Lucide icons, custom responsive CSS

## Requirements
Install Java 21+, Maven 3.9+, Node.js 20+, npm, and MySQL 8.

## 1. Start MySQL
Create a database if you prefer to do it manually:
```sql
CREATE DATABASE stockpilot;
```
The application also uses `createDatabaseIfNotExist=true` by default. Set your credentials using environment variables if they differ from the defaults:
- Windows PowerShell: `$env:DB_USERNAME="root"; $env:DB_PASSWORD="your-password"`
- macOS/Linux: `export DB_USERNAME=root; export DB_PASSWORD='your-password'`

## 2. Start the backend
```bash
cd backend
mvn spring-boot:run
```
API base URL: http://localhost:8080/api
Swagger UI: http://localhost:8080/swagger-ui/index.html

## 3. Start the frontend
Open another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL printed in the terminal (normally http://localhost:5173).

## API quick reference
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard` | KPIs and recent activity |
| GET | `/api/products?q=scanner` | Search products |
| POST | `/api/products` | Add product |
| GET | `/api/products/{id}` | Product details |
| PUT | `/api/products/{id}` | Update product details |
| DELETE | `/api/products/{id}` | Delete product when no movement history exists |
| POST | `/api/products/{id}/stock` | Record stock movement |
| GET | `/api/stock-movements` | Recent stock movement audit |
| GET | `/api/orders` | Recent orders |
| POST | `/api/orders` | Process an order and deduct stock atomically |
| GET | `/api/alerts/low-stock` | Low-stock products |

### Example requests
Add a product:
```json
POST /api/products
{
  "name": "USB Barcode Scanner",
  "sku": "WHS-2001",
  "category": "Equipment",
  "quantity": 25,
  "reorderLevel": 5,
  "unitPrice": 3200.00,
  "location": "A-04-02"
}
```
Receive 10 units:
```json
POST /api/products/1/stock
{ "type": "STOCK_IN", "quantity": 10, "note": "Purchase order PO-1001" }
```
Create an order:
```json
POST /api/orders
{ "customerName": "Northstar Retail", "items": [{ "productId": 1, "quantity": 2 }] }
```

## Database model
- `products`: SKU, description, category, stock balance, reorder threshold, unit price and location
- `stock_movements`: stock change type, quantity, resulting balance, note and timestamp
- `customer_orders`: customer/destination, status and timestamp
- `order_lines`: product and quantity for each order

## Business rules
1. SKU must be unique.
2. Stock quantity and order quantity cannot be negative or zero for a movement/order line.
3. Stock-out and order processing cannot reduce stock below zero.
4. Order stock deduction, movement creation, and order persistence run within a transaction.
5. Products with stock history cannot be deleted; retain their audit history instead.
6. A product is low-stock when `quantity <= reorderLevel`.

## Suggested next upgrades for production
- Add Spring Security, JWT authentication, and role-based permissions
- Add database migrations with Flyway instead of relying on `ddl-auto=update`
- Use optimistic/pessimistic locking for concurrent order allocation
- Add pagination, integration tests with Testcontainers, structured logging and monitoring
- Add suppliers, purchase orders, multi-warehouse stock, barcode scanning, and deployment to a cloud platform

## Important notes
This is a functional learning/demo baseline, not a production-hardened warehouse platform. The frontend's weekly chart uses clearly illustrative sample data; live KPIs, product lists, alerts, movements, and orders come from the backend. Configure credentials securely before sharing or deploying. Seed data is inserted only when the products table is empty.
