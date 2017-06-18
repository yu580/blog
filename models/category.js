/**
 * Created by yuli on 2017/6/10 0010.
 */
//加载模块
var mongoose= require('mongoose');
//引入users表结构
categorySchema= require('../schemas/category');
//创建基于users表结构的model并暴露出去
module.exports = mongoose.model('Category',categorySchema);