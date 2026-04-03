# Database Setup Script
# Run this script to set up the MySQL database

# Note: Update the password if your MySQL root has a password
$password = "12345"  # Set your MySQL root password here, e.g. "yourpassword"

# Create database and run schema
mysql -u root -p$password -e "CREATE DATABASE IF NOT EXISTS ecommerce;"

# Run the schema file
mysql -u root -p$password -e "source schema.sql" ecommerce

# Insert sample data
mysql -u root -p$password -e "source sample_data.sql" ecommerce

Write-Host "Database setup completed."