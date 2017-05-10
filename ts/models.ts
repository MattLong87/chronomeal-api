import * as mongoose from 'mongoose';
//use global promise instead of mongoose's
mongoose.promise = global.Promise;
import * as bcrypt from 'bcrypt';

const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    name: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true}
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

userSchema.statics.hashPassword = function(password: string){
    return bcrypt.hash(password, 10);
}

userSchema.methods.validatePassword = function(password: string){
    return bcrypt.compare(password, this.password)
}

export const User = mongoose.model('User', userSchema);