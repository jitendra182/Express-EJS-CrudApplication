const mongoose=require('mongoose');

const uploadSchema=new mongoose.Schema({
    imagename: String
});

const uploadModel=mongoose.model('uploadiamge',uploadSchema);
module.exports=uploadModel;