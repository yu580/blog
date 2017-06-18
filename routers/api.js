/**
 * Created by yuli on 2017/6/10 0010.
 */
var express = require('express');
//创建一个路由对象
var router = express.Router();
//引入数据库的模型类
var User = require('../models/users');
var Content = require('../models/content');

var responseData;
router.use(function(req,res,next){
    responseData = {
        code:0,
        message:""
    };
    next();
});
//用户注册
/*
* 用户名不能为空，
* 密码不能为空
* 密码需要一致
* 用户名是否被注册*/
router.post('/user/register',function(req,res,next){
     var username = req.body.username;
     var password = req.body.password;
     var repassword = req.body.repassword;
     //用户名不能为空
     if(username == "") {
         responseData.code = 1;
         responseData.message ="用户名不能为空";
         res.json(responseData);
         return
     }
     //密码不能为空
     if(password == "") {
         responseData.code = 2;
         responseData.message ="密码不能为空";
         res.json(responseData);
         return
     }
     //两次密码输入不一致
     if(password !== repassword){
         responseData.code = 3;
         responseData.message ="两次密码输入不一致";
         res.json(responseData);
         return
     }
     //用户名是否被注册
    User.findOne({
        username:username
    }).then(function(userInfo){
        //判断是否查询到数据
        if(userInfo){
            responseData.code = 4;
            responseData.message ="用户名已存在";
            res.json(responseData);
            return
        }
        //创建一个User的实体类，用于存入用户数据
        var user = new User({
            username:username,
            password:password
        });
        return user.save();
    }).then(function(newUser){
        responseData.message = "注册成功"
        res.json(responseData);
    })


});

router.post('/user/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
	console.log(req.body);
    if(username == "" || password == "") {
        responseData.code = 1;
        responseData.message = "用户名和密码不能为空！";
        res.json(responseData);
        return;
    }
    User.findOne({
        username: username,
        password: password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = "用户名或密码错误";
            res.json(responseData);
            return;
        }
        responseData.message = "登录成功";
        responseData.userInfo = {
            _id : userInfo._id,
            username: userInfo.username
        };
        req.cookies.set("userInfo",JSON.stringify({
            _id : userInfo._id,
            username: userInfo.username
        }));
        res.json(responseData);
        return;
    })
});

/*
* 退出*/
router.get('/user/logout',function(req,res,next){
    req.cookies.set("userInfo",null);
    responseData.message = "退出成功";
    res.json(responseData);
});
/*
 * 获取指定文章的所有评论
 * */
router.get('/comment', function(req, res) {
    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).then(function(content) {
        responseData.data = content.comments;
        res.json(responseData);
    })
});

/*
 * 评论提交
 * */
router.post('/comment/post', function(req, res) {
    //内容的id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        content: req.body.content
    };

    //查询当前这篇内容的信息
    Content.findOne({
        _id: contentId
    }).then(function(content) {
        content.comments.push(postData);
        return content.save();
    }).then(function(newContent) {
        responseData.message = '评论成功';
        responseData.data = newContent;
        res.json(responseData);
    });
});




module.exports = router;