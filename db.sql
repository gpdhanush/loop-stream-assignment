-- Optional: create database
CREATE DATABASE IF NOT EXISTS currencydb;
USE currencydb;

-- Rates cache table
CREATE TABLE IF NOT EXISTS conversion_rates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  source_currency VARCHAR(3) NOT NULL,
  target_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(19,8) NOT NULL,
  fetched_at DATETIME NOT NULL,
  CONSTRAINT uk_source_target UNIQUE (source_currency, target_currency)
);

CREATE INDEX idx_source_target ON conversion_rates (source_currency, target_currency);