const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,

    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

//register routhe 에서 save단계 넘어가기 전에 해당 function을 실행한다.
userSchema.pre('save', function (next) {
    const user = this;
    //비밀번호를 바꿀 때만 암호화 해야하기 때문에 조건을 달아준다. 
    if (user.isModified('password')) {
        //비밀번호를 암호화 시킨다. 
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, function (err, hash) { //hash가 암호화된 비번
                if (err) { return next(err); }
                user.password = hash;
                return next();
            });
        });
    } else { //아닌 경우에는 next
        return next();
    }
})


userSchema.methods.comparePassword = function (plainPassword) {
    //plainPassword 1234567444 암호화된 비번 $2b$10$Qvh7t/c/nbgorp5rzWc1L.XNRrUuM3MZx0enpJLHiAhS0LsHjsD2C
    //plainPassword를 암호화해서 같은지 확인
    const user = this;
    return bcrypt.compare(plainPassword, this.password)
}

userSchema.methods.generateToken = function () {
    //user가져오기 위해 
    user = this;
    //jsonwebtoken을 이용해서 token 생성하기
    const token = jwt.sign(user._id.toJSON(), 'secretToken')

    //token을 가져오면 secretToken을 통해서 user._id가 나온다.
    user.token = token;
    return user.save();
}

userSchema.statics.findByToken = async function(token) {
    let user = this;
    try {
        const decoded = jwt.verify(token, 'secretToken');
        //findOne메소드를 await을 사용하여 비동기 호출
        const foundUser = await user.findOne({"_id": decoded, "token":token});
        return foundUser; //성공적으로 유저 찾은 경우 반환
    } catch (err) {
        throw err;
    }
}
const User = mongoose.model('User', userSchema)

module.exports = { User }