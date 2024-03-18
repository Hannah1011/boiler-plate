const { User } = require('../models/User');

const auth = async (req, res, next) => {

    //인증 처리 로직

    //1. client 쿠키에서 token가져온다. 
    const token = req.cookies.x_auth;

    //2. token을 복호화(decode)해서 유저를 찾는다. 
    try {
        //3. 유저가 있으면 인증 ok
        const user = await User.findByToken(token);
        //4. 유저가 없으면 인증 no
        if (!user) return res.json({ isAuth: false, error: true });

        req.token = token;
        req.user = user;
        next(); //미들웨어 다음으로 넘어갈 수 있도록
    } catch (err) {
        return res.status(400).send(err);
    }
};


module.exports = { auth };