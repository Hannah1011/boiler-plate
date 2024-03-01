const express = require('express') //express node를 가지고 온다. 
const app = express() //express 앱을 만듦. 
const port = 5000
const bodyParser = require('body-parser');
const config = require('./config/key')
const {User} = require("./models/User");


//client에서 오는 정보를 서버에서 분석해서 가져올 수 있도록 한다. 
//application/x-www-form-urlencoded 이렇게 된 데이터를 가져와서 분석해줌. 
app.use(bodyParser.urlencoded({extended: true}));
//application/json 파일을 분석해서 가지고 와줌. 
app.use(bodyParser.json());


const mongoose = require('mongoose')
//mongoDB연결할 때 아이디랑 비번 보호해야됨.
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log('MongoDB Connected...'))
.catch(err => console.log(err))



//간단한 route 만듦. 
app.get('/',(req, res) => res.send('Hello World 야호!'))

app.post('/register', async (req, res) => {
    //회원가입 할 때 필요한 정보들을 client에서 가져오면
    //그것들을 데이터 베이스에 넣어준다. 

    const user = new User(req.body)

    //mongoDB메소드 , user 모델에 저장 
    const result = await user.save().then(()=> {
        res.status(200).json({
            success:true
        })
    }).catch((err)=>{
        res.json({success: false, err})
    })
})

app.listen(port, ()=> console.log(`Example app listening on port ${port}!`))