# ShopON - Online Shopping Application
 
A full-stack e-commerce application built with Node.js, Express, MySQL, and vanilla JavaScript.

## Project Structure

```
ShopON/
├── backend/                 # Node.js / Express server
│   ├── server.js
│   ├── config/
│   │   └── db.js            # Database configuration
│   ├── controllers/         # Business logic
│   └── routes/              # API routes
│
├── frontend/                # Client-side application
│   ├── index.html
│   ├── login.html
│   ├── cart.html
│   ├── checkout.html
│   ├── orders.html
│   ├── css/
│   │   └── style.css
│   └── js/                  # Client logic (auth, cart, orders, products, theme)
│
├── database/                # Database setup
│   ├── schema.sql
│   ├── sample_data.sql
│   └── er_diagram.md
│
├── setup.js                 # Initial setup script
├── package.json
├── LICENSE
└── README.md
```

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript  
- **Backend**: Node.js, Express.js  
- **Database**: MySQL 8.0+

## Setup Instructions

### 1. Configure Database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/sample_data.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
npm start
```


### 3. Run Frontend

Open the following file in your browser:

```
frontend/index.html
```

## Default Credentials

- **Email**: customer@example.com  
- **Password**: password123  

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
