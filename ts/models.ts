import * as mongoose from 'mongoose';
//use global promise instead of mongoose's
(<any>mongoose).Promise = global.Promise;
import * as bcrypt from 'bcrypt';

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    created: { type: Number, required: true },
    token: { type: String },
    name: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true }
    },
    meals: [
        {
            time: String,
            food: String,
            notes: String,
            pain: Number
        }
    ]
});

userSchema.statics.hashPassword = function (password: string, cb) {
    return bcrypt.hash(password, 10, cb);
}

userSchema.methods.validatePassword = function (password: string) {
    return bcrypt.compare(password, this.password);
}

userSchema.statics.generateToken = function () {
    const buffer = require('crypto').randomBytes(26);
    return buffer.toString('hex');
};

userSchema.pre('save', function (next) {
    if (this.isNew) {
        return require('crypto').randomBytes(26, (err, buffer) => {
            var token = buffer.toString('hex');
            this.token = token;
            next();
        });
    }
    next();
});

userSchema.methods.apiRepr = function () {
    return {
        username: this.username,
        email: this.email,
        name: this.name,
        meals: this.meals,
        token: this.token
    }
}

export const User = mongoose.model('User', userSchema);