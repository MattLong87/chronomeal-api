export const DATABASE_URL: string = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/foodtracker';
export const PORT: number = process.env.PORT || 8080;
export const TEST_DATABASE_URL: string = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-foodtracker'