if(process.env.NODE_ENV==='production') {//환경변수가 production일 때, 즉 배포가 되어있을 때.
    module.exports = require('./prod');
} else {
    module.exports = require('./dev');
}