-- Database Schema for Online Shopping Application

CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Users Table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE Addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Categories Table
CREATE TABLE Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- Products Table
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    category_id INT,
    image_url VARCHAR(500),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id) ON DELETE SET NULL,
    CONSTRAINT chk_no_garden_hose CHECK (name <> 'Garden Hose')
);

-- Orders Table
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('COD', 'CARD', 'UPI') NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    address_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (address_id) REFERENCES Addresses(address_id)
);

-- Order_Items Table
CREATE TABLE Order_Items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);

-- Reviews Table
CREATE TABLE Reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    UNIQUE (product_id, user_id)
);

-- Cart Table
CREATE TABLE Cart (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
    UNIQUE (user_id, product_id)
);

-- Indexes for performance
CREATE INDEX idx_products_category ON Products(category_id);
CREATE INDEX idx_orders_user ON Orders(user_id);
CREATE INDEX idx_order_items_order ON Order_Items(order_id);
CREATE INDEX idx_cart_user ON Cart(user_id);

-- Views
-- Top Products View
CREATE VIEW Top_Products AS
SELECT p.product_id, p.name, SUM(oi.quantity) AS total_sold
FROM Products p
JOIN Order_Items oi ON p.product_id = oi.product_id
GROUP BY p.product_id, p.name
ORDER BY total_sold DESC;

-- User Summary View
CREATE VIEW User_Summary AS
SELECT u.user_id, u.username, COUNT(o.order_id) AS total_orders, SUM(o.total_amount) AS total_spent
FROM Users u
LEFT JOIN Orders o ON u.user_id = o.user_id
GROUP BY u.user_id, u.username;

-- Stored Procedures
DELIMITER //

-- PlaceOrder Stored Procedure
CREATE PROCEDURE PlaceOrder(
    IN p_user_id INT,
    IN p_address_id INT,
    IN p_payment_method ENUM('COD', 'CARD', 'UPI')
)
BEGIN
    DECLARE total DECIMAL(10,2) DEFAULT 0;
    DECLARE order_id INT;
    
    -- Calculate total from cart
    SELECT SUM(c.quantity * p.price) INTO total
    FROM Cart c
    JOIN Products p ON c.product_id = p.product_id
    WHERE c.user_id = p_user_id;
    
    IF total IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cart is empty';
    END IF;

    IF p_payment_method IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Payment method is required';
    END IF;
    
    -- Insert order
    INSERT INTO Orders (user_id, total_amount, address_id, payment_method, status)
    VALUES (p_user_id, total, p_address_id, p_payment_method, 'confirmed');
    SET order_id = LAST_INSERT_ID();
    
    -- Insert order items from cart
    INSERT INTO Order_Items (order_id, product_id, quantity, price)
    SELECT order_id, c.product_id, c.quantity, p.price
    FROM Cart c
    JOIN Products p ON c.product_id = p.product_id
    WHERE c.user_id = p_user_id;
    
    -- Clear cart
    DELETE FROM Cart WHERE user_id = p_user_id;
    
    -- Return order_id
    SELECT order_id AS order_id;
END //

DELIMITER ;