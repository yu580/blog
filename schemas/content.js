/**
 * Created by yuli on 2017/6/10 0010.
 */

var mongoose= require('mongoose');

//内容的表结构
module.exports = new mongoose.Schema({
    //关联字段--分类
    category: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    //关联字段--用户
    user: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    //添加时间
    addTime: {
        type:Date,
        default: new Date()
    },
    //阅读数量
    views: {
        type: Number,
        default: 0
    },
    //标题
    title:String,
    //内容简介
    description:{
        type:String,
        default:""
    },
    //内容
    content: {
        type:String,
        default:""
    },
    //评论
    comments: {
        type: Array,
        default: []
    }

});
