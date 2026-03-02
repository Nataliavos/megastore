-- ─────────────────────────────────────────
-- MEGASTORE - Relational Database Schema
-- Execute in order. The script is idempotent.
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- CREATE TABLES
-- ─────────────────────────────────────────

-- ─────────────────────────────────────────
-- 1. CUSTOMERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
	customer_id SERIAL PRIMARY KEY,
	customer_name VARCHAR(255) NOT NULL,
	customer_email VARCHAR(255) NOT NULL UNIQUE,
	customer_address VARCHAR(255) NOT NULL,
	customer_phone  VARCHAR(20) NOT NULL
);

-- ─────────────────────────────────────────
-- 2. SUPPLIERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
	supplier_id SERIAL PRIMARY KEY,
	supplier_name VARCHAR(255) NOT NULL,
	supplier_email VARCHAR(255) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- 3. CATEGORIES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
	category_id SERIAL PRIMARY KEY,
	category VARCHAR(255) NOT NULL UNIQUE
);

-- ─────────────────────────────────────────
-- 4. PRODUCTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
	product_sku VARCHAR(20) NOT NULL UNIQUE PRIMARY KEY,
	product_name VARCHAR(255) NOT NULL,
	unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
	category_id INTEGER NOT NULL REFERENCES categories(category_id)
);

-- ─────────────────────────────────────────
-- 5. TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
	transaction_id VARCHAR(20) NOT NULL UNIQUE,
	date DATE NOT NULL,
	customer_id INTEGER NOT NULL REFERENCES customers(customer_id),
	product_sku VARCHAR(20) NOT NULL REFERENCES products(product_sku),
	supplier_id INTEGER NOT NULL REFERENCES suppliers(supplier_id),
	quantity INTEGER NOT NULL,
	total_line_value NUMERIC(12, 2) NOT NULL CHECK (total_line_value >= 0)
);

-- ─────────────────────────────────────────
-- 6. STRATEGIC INDEXES
-- ─────────────────────────────────────────

-- Búsquedas frecuentes por email de cliente
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(customer_email);

-- Historial de transacciones por cliente
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);

-- Reporte de recaudación por proveedor
CREATE INDEX IF NOT EXISTS idx_transactions_supplier ON transactions(supplier_id);

-- Filtrado por rango de fechas
CREATE INDEX IF NOT EXISTS idx_transactions_date  ON transactions(date);

-- Búsqueda de proveedor por email
CREATE INDEX IF NOT EXISTS idx_suppliers_email  ON suppliers(supplier_email);