const express = require('express') //express node를 가지고 온다. 
const app = express() //express 앱을 만듦. 
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");


//client에서 오는 정보를 서버에서 분석해서 가져올 수 있도록 한다. 
//application/x-www-form-urlencoded 이렇게 된 데이터를 가져와서 분석해줌. 
app.use(bodyParser.urlencoded({ extended: true }));
//application/json 파일을 분석해서 가지고 와줌. 
app.use(bodyParser.json());

app.use(cookieParser());


const mongoose = require('mongoose')
//mongoDB연결할 때 아이디랑 비번 보호해야됨.
mongoose.connect(config.mongoURI).then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err))



//간단한 route 만듦. 
app.get('/', (req, res) => res.send('Hello World 야호!'))

//register route
app.post('/api/users/register', async (req, res) => {
    //회원가입 할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다. 

    const user = new User(req.body)

    //mongoDB메소드 , user 모델에 저장 
    const result = await user.save().then(() => {
        res.status(200).json({
            success: true
        })
    }).catch((err) => {
        res.json({ success: false, err })
    })
})

//login route 
app.post('/api/users/login', (req, res) => {

    //요청된 이메일이 데이터 베이스가 있는지 확인 
    User.findOne({
        email: req.body.email
    })
        .then(async (user) => {
            if (!user) {
                throw new Error("제공된 이메일에 해당하는 유저가 없습니다.")
            }
            //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는 비밀번호인지 확인. 
            const isMatch = await user.comparePassword(req.body.password);
            return { isMatch, user };
        })
        .then(({ isMatch, user }) => {
            console.log(isMatch);
            if (!isMatch) {
                throw Error("비밀번호가 틀렸습니다.")
            }
            //로그인 완료
            return user.generateToken();
        })
        .then((user) => {
            //토큰 저장 어디에? 쿠키, 로컬스토리지, 세션 등 
            //여기서는 쿠키에 저장
            return res.cookie("x_auth", user.token)
                .status(200)
                .json({
                    loginSuccess: true,
                    userId: user._id
                });
        })
        .catch((err) => {
            console.log(err);
            return res.status(400).json({
                loginSuccess: false,
                message: err.message
            });
        })

})




//인증 route 생성
app.get('/api/users/auth', auth, (req, res) => { //중간의 auth가 middleware이다. 

    //여기까지 미들웨어 통과해왔다는 얘기는 Authentication이 true 라는 말이다. 
    res.status(200).json({
        _id: req.user._id, //이렇게 할 수 있는 이유는 auth.js에서 req.user에 user를 넣었기 때문.
        isAdmin: req.user.role == 0 ? false : true, //0이면 일반 유저 0이 아니면 관리자
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

//로그아웃 route
app.get('/api/users/logout', auth, async(req, res) =>{
    try{
        await User.findOneAndUpdate({_id: req.user._id}, {token: ""});
        return res.status(200).send({success: true});
    } catch (err) {
        return res.status(400).send({success: false, err});
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))