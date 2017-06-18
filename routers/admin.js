/**
 * Created by yuli on 2017/6/10 0010.
 */
var express = require('express');
//创建一个路由对象
var router = express.Router();
//加载数据模型
//用户
var User = require('../models/users');
//分类
var Category = require('../models/category');
//内容
var Content = require('../models/content');

router.use(function (req,res,next) {
    if(!req.userInfo.isAdmin){
        res.send('对不起，只有管理员才能进入后台管理页面');
        return
    }
    next();
});
// router监听请求
/*
* 后台首页*/
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo: req.userInfo
    });
});
/*
 * 后台用户管理
 * 查询注册用户并限制数量
 * limit（Number）限制查询的数量
 * skip(Number) 忽略数据的条数*/
router.get('/user',function(req,res,next){
    /*
     * 从数据库中读取所有的用户数据
     *
     * limit(Number) : 限制获取的数据条数
     *
     * skip(2) : 忽略数据的条数
     *
     * 每页显示2条
     * 1 : 1-2 skip:0 -> (当前页-1) * limit
     * 2 : 3-4 skip:2
     * */

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    User.count().then(function(count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page, pages );
        //取值不能小于1
        page = Math.max( page, 1 );

        var skip = (page - 1) * limit;

        User.find().limit(limit).skip(skip).then(function(users) {
            res.render('admin/user_index', {
                userInfo: req.userInfo,
                users: users,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });

    });

});

/*
* 分类首页*/

router.get('/category',function (req,res){
    /*
     * 从数据库中读取所有的用户数据
     *
     * limit(Number) : 限制获取的数据条数
     *
     * skip(2) : 忽略数据的条数
     *
     * 每页显示2条
     * 1 : 1-2 skip:0 -> (当前页-1) * limit
     * 2 : 3-4 skip:2
     * */

    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Category.count().then(function(count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page, pages );
        //取值不能小于1
        page = Math.max( page, 1 );

        var skip = (page - 1) * limit;

        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories) {
            res.render('admin/category_index', {
                userInfo: req.userInfo,
                categories: categories,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });

    });
});

/*
 * 分类添加页面*/

router.get('/category/add',function (req,res){
    res.render('admin/category_add',{
        userInfo:req.userInfo
    })
});

/*
 * 分类添加*/
router.post('/category/add',function (req,res){
    var name = req.body.name || "";

    if(name==""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:"分类名不能为空"
        });
        return;
    }
    Category.findOne({
        name:name
    }).then(function (re){
        if(re){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message:"分类名已经存在"
            });
            return;
        }else{
            var category = new Category({
                name:name
            });
            category.save();
            res.render('admin/success',{
                userInfo:req.userInfo,
                message:"分类名保存成功",
                url:"/admin/category"
            });
            return;
        }
    })
});

/*
 * 分类修改*/

router.get('/category/edit',function (req,res){
    var id = req.query.id || "";

    Category.findOne({
        _id:id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        }
    });

});

/*
 * 分类修改后保存*/
router.post('/category/edit',function (req,res){
    var id = req.query.id ||"";
    var name = req.body.name || "";

    Category.findOne({
        _id:id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '分类信息不存在'
            });
        } else {
            //当用户没有做任何的修改提交的时候
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: '修改成功',
                    url: '/admin/category'
                });
                return Promise.reject();
            } else {
                //要修改的分类名称是否已经在数据库中存在
                return Category.findOne({
                    _id: {$ne: id},
                    name: name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: '数据库中已经存在同名分类'
            });
            return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            })
        }

    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '修改成功',
            url: '/admin/category'
        });
    }).catch(function(){
        //nodejs 6.6以后.对没有捕获的 reject 会发出一个警告.所以加上catch语句
        console.log(123);
    })

});

/*
 * 分类删除
 * */
router.get('/category/delete', function(req, res) {

    //获取要删除的分类的id
    var id = req.query.id || '';
    Category.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/category'
        });
    });

});

/*
* 内容显示首页
* */

router.get('/content',function(req,res){
    var page = Number(req.query.page || 1);
    var limit = 10;
    var pages = 0;

    Content.count().then(function(count) {

        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min( page, pages );
        //取值不能小于1
        page = Math.max( page, 1 );

        var skip = (page - 1) * limit;

        Content.find().limit(limit).sort({addTime: -1}).populate(['category',"user"]).skip(skip).then(function(contents) {
            console.log(contents)
            res.render('admin/content_index', {
                userInfo: req.userInfo,
                contents: contents,

                count: count,
                pages: pages,
                limit: limit,
                page: page
            });
        });

    });
});
/*
 * 内容添加
 * */

router.get('/content/add',function(req,res){
    Category.find().then(function(categories){
        res.render('admin/content_add',{
            userInfo: req.userInfo,
            categories:categories
        })
    })

});
/*
 * 内容保存
 * */
router.post('/content/add',function(req,res){
    if(req.body.category == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:"文章分类不能为空"
        });
        return;
    }else if(req.body.title == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:"文章标题不能为空"
        });
        return;
    }
    //保存数据
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function(re){
        console.log(re)
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:"内容保存成功"
        });
    });
});
//文章修改页面
router.get('/content/edit',function (req,res){
    var id = req.query.id || "";
    var categories =[];
    Category.find().then(function(re){
        categories = re;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function(content){
        if(!content){
            res.render('admin/error',{
                userInfo:req.userInfo,
                message: "需要修改的文章不存在"
            })
        }else {
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                content:content,
                categories: categories
            })
        }

    })


});

/*
* 文章修改完成后保存*/
router.post('/content/edit',function(req,res){
    var id = req.query.id || "";
    if(req.body.category == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:"文章分类不能为空"
        });
        return;
    }else if(req.body.title == ""){
        res.render('admin/error',{
            userInfo:req.userInfo,
            message:"文章标题不能为空"
        });
        return;
    }
    //数据更新
    Content.update({
        _id: id
    },{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
    }).then(function(re){
        res.render('admin/success',{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:"/admin/content"
        });
    });
});

/*
* 文章内容删除*/
router.get('/content/delete', function(req, res) {

    //获取要删除的文章的id
    var id = req.query.id || '';
    Content.remove({
        _id: id
    }).then(function() {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: '删除成功',
            url: '/admin/content'
        });
    });

});

module.exports = router;
