# FoodTracker API

## Endpoints

### Get all data for one user
***GET /api/users/me***

### Create a new user
***POST /api/users***  
Required body fields: 
- username (string)
- firstName (string)
- lastName (string)

### Add a meal to a user
***POST /api/users/me/add-meal***  
Required body fields:
- username (string)
- time (string)
- food (string)
- notes (string, even if empty)
- pain (number)

### Delete a meal
***DELETE /api/users/me/meals***
Required body fields:
- username (string)
- mealId (string, the _id field in the chosen meal)