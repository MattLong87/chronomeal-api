# Chronomeal API
This is the back-end API for the [Chronomeal app](https://mattlong87.github.io/chronomeal-landing-page/). Chronomeal allows people with chronic pain to record their meals and pain levels, so they or their doctor can look for trends over time.

## Installation
1. `git clone https://github.com/MattLong87/chronomeal-api`
2. `cd chronomeal-api`
3. `npm install`
4. `tsc`
5. `npm start` (or `npm run dev`)

## Authorization flow
1. When user is created or logs in with username and password, token is generated and returned
2. Future requests supply token in header: ```"Authorization: Bearer {token}"```

## Endpoints

### Get all data for one user
***GET /api/users/me***

### User Login
***POST /api/login***  
Required body fields:
- email (string)
- password (string)

### Create a new user
***POST /api/users***  
Required body fields: 
- email (string)
- password (string)
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
