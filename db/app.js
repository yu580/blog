/**
 * Created by yuli on 2017/6/10 0010.
 */

//加载express模块
var express = require('express');
//加载模板模块
var swig = require('swig');
//加载数据库模块
var mongoose= require('mongoose');
//加载body-pareser模块用来处理用户请求的数据
var bodyParser = require('body-parser');
//加载cookie模块
var Cookies = require('cookies');
//加载model模型类
var User = require('./models/users');


//创建app  相当于=> NodeJS createServer();
var app =express();

//设置静态文件的托管
//当用户以URL/public开始请求返回__dirname + '/public'对应的文件
app.use('/public',express.static(__dirname + '/public'));

//配置模板
//定义当前APP使用的模板引擎
//第一个参数是模板引擎的名称，和模板文件的后缀
//第二个参数 表示用于解析模板所用的方法
app.engine('html',swig.renderFile);

//设置模板文件存放的目录
//第一个参数必须是view；第二个参数是目录
app.set('views','./views');
//注册模板引擎
//第一个参数是view engine;第二个参数是和app.engine方法的第一个参数保持一致
app.set('view engine','html');
//开发阶段关闭模板缓存
swig.setDefaults({cache: false});

//数据库的连接
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27018/blog',function(error){
    if(error){
        console.log('连接数据库失败');
    }else{
        console.log('连接数据库成功');
        //监听8081端口
        app.listen('80');
    }
});

//设置body-parser
app.use(bodyParser.urlencoded({extended:true}));
//设置cookie
app.use(function(req,res,next){
   req.cookies = new Cookies(req,res);
   //解析用户的cookie信息
   req.userInfo ={};
   if(req.cookies.get('userInfo')){
       try{
           req.userInfo = JSON.parse(req.cookies.get('userInfo'));

           User.findById(req.userInfo._id).then(function(userInfo){
               req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
			   req.userInfo.username = decodeURI(userInfo.username);
               next();
           })

       }catch(e){
           next();
       }
   }else{
       next();
   }

});

//根据模块加载路由
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


/*
* req =>request对象
* res =>response 对象
* next => 函数
*
* */
// app.get('/',function(req,res,next){
//     //res.send('<p>欢迎来到我的博客！</p>');
//     /*
//     * res.render方法解析view目录下制定的文件
//     * 第一个参数表示需要解析的文件名，相对于view目录的 view/index.html
//     * 第二个参数，传递给模板使用的参数
//     * */
//     res.render('index');
// });