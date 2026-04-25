-- Sample Data for Online Shopping Application

USE ecommerce;

-- Insert Categories
INSERT INTO Categories (name, description) VALUES
('Electronics', 'Electronic gadgets and devices'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and publications');

-- Insert Products
INSERT INTO Products (name, description, price, category_id, image_url) VALUES
('Laptop', 'High-performance laptop', 83000.00, 1, 'laptop.jpg'),
('T-Shirt', 'Cotton t-shirt', 1660.00, 2, 'tshirt.jpg'),
('Novel Book', 'Bestselling novel', 1250.00, 3, 'novel.jpg'),
('Smartphone', 'Latest smartphone', 58100.00, 1, 'phone.jpg'),
('Jeans', 'Denim jeans', 4150.00, 2, 'jeans.jpg');

-- Insert Users (passwords are 'password123' hashed with bcrypt, 10 rounds)
INSERT INTO Users (username, email, password_hash) VALUES
('john_doe', 'john@example.com', '$2b$10$nO7p7oT8F2B.E9y.E9y.EeQ7a19rV9u9v9v9v9v9v9v9v9v9v9v'), -- Mock hash for password123
('jane_smith', 'jane@example.com', '$2b$10$nO7p7oT8F2B.E9y.E9y.EeQ7a19rV9u9v9v9v9v9v9v9v9v9v9v');

-- Insert Addresses
INSERT INTO Addresses (user_id, street, city, state, zip) VALUES
(1, '123 Main St', 'Anytown', 'CA', '12345'),
(2, '456 Oak Ave', 'Somewhere', 'NY', '67890');
