/**
 * Created by 毅 on 2016/8/28.
 */

var express = require('express');
var router = express.Router();

var Category = require('../models/Category');
var Content = require('../models/Content');

var data;

/*
 * 处理通用的数据
 * */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: []
    }

    Category.find().then(function(categories) {
        data.categories = categories;
        next();
    });
});

/*
 * 首页
 * */
router.get('/', function(req, res, next) {

    data.category = req.query.category || '';
    data.count = 0;
    data.page = Number(req.query.page || 1);
    data.limit = 10;
    data.pages = 0;

    var where = {};
    if (data.category) {
        where.category = data.category
    }

    Content.where(where).count().then(function(count) {

        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min( data.page, data.pages );
        //取值不能小于1
        data.page = Math.max( data.page, 1 );

        var skip = (data.page - 1) * data.limit;

        return Content.where(where).find().limit(data.limit).skip(skip).populate(['category', 'user']).sort({
            addTime: -1
        });

    }).then(function(contents) {
        if(contents>0){
            for (var i = 0;i < contents.length; i++) {
                contents[i].user.username = decodeURI(contents[i].user.username);
            };
        }

        data.contents = contents;
		
        res.render('main/index', data);
    })
});

router.get('/view', function (req, res){

    var contentId = req.query.contentid || '';

    Content.findOne({
        _id: contentId
    }).populate('user').then(function (content) {
        data.content = content;
        if(content){
            content.user.username = decodeURI(content.user.username);
        }
		console.log(data);
        content.views++;
        content.save(); //content 相当于 Content的实例所以可以直接使用实例方法

        res.render('main/view', data);
    });

});

module.exports = router;