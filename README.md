# FoodTracker API

## Usage
1. Clone or download
2. npm install
3. tsc
4. npm start (or npm run dev)

## Authorization flow
1. When user is created or logs in with username and password, token is generated and returned
2. Future requests supply token in header: ```"Authorization: Bearer 123456789"```

## Endpoints

### Get all data for one user
***GET /api/users/me***

### User Login
***POST /api/login***  
Required body fields:
- username (string)
- password (string)

### Create a new user
***POST /api/users***  
Required body fields: 
- username (string)
- password (string)
- email (string)
- firstName (string)
- lastName (string)

### Add a meal to a user
***POST /api/users/me/add-meal***  
Required body fields:
- time (string)
- food (string)
- notes (string, even if empty)
- pain (number)

### Delete a meal
***DELETE /api/users/me/meals***  
Required body fields:
- mealId (string, the _id field in the chosen meal)