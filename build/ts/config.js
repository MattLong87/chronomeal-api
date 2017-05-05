"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://localhost/foodtracker';
exports.PORT = process.env.PORT || 8088;
