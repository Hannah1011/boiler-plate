const express = require('express') //express node를 가지고 온다. 
const app = express() //express 앱을 만듦. 
const port = 5000


const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://hannahkim:1111@boilerplate.0cdjeph.mongodb.net/?retryWrites=true&w=majority&appName=boilerplate', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log('MongoDB Connected...'))
.catch(err => console.log(err))

app.get('/',(req, res) => res.send('Hello World'))

app.listen(port, ()=> console.log(`Example app listening on port ${port}!`))