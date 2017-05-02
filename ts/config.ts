export const DATABASE_URL: string = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/foodtracker';
export const PORT: number = process.env.PORT || 8088;