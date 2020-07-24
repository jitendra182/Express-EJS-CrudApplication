var express = require('express');
var router = express.Router();

const multer=require('multer');
const path=require('path');

const employeeModel=require('../modules/employee');
const employee=employeeModel.find({});

const uploadFileModel=require("../modules/upload");
const imageData=uploadFileModel.find({});

const jwt=require('jsonwebtoken');
const { token } = require('morgan');

if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

router.use(express.static(__dirname+'./public'));
const diskStorage=multer.diskStorage({
  destination: './public/uploads',
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  },
});


const uploadMiddleware=multer({
  storage:diskStorage
}).single('file');

/////////////////------Login Logout---------////////////

router.get('/login',(req,res,next)=>{
  var token = jwt.sign({ foo: 'bar' }, 'loginToken');
  localStorage.setItem('myToken',token);
  res.send("Login Successfullly")
});

router.get('/logout',(req,res,next)=>{
  localStorage.removeItem('myToken');
  res.send('Logout Successfully');
});

function checkLogin(req,res,next){
  try {
    const token=localStorage.getItem('myToken');
    jwt.verify(token,'loginToken');
  } catch (error) {
    res.send("You need to Login for access this page");
  }
  next();
};

//////////---------/////////////////

/* GET home page. */
router.get('/', checkLogin,function(req, res, next) {
  employee.exec((err,data)=>{
    if(err) throw err;
    res.render('index', { title: 'Employee Records' , records: data, message :""});
  });

});

router.post('/', function(req,res,next){
  const empDetails= new employeeModel({
    name: req.body.name,
    email: req.body.email,
    etype: req.body.etype,
    hourlyRate: req.body.hourlyRate,
    totalHour: req.body.totalHour,
    total : parseInt(req.body.hourlyRate)* parseInt(req.body.totalHour),
  });

  //console.log(empDetails);

  empDetails.save( function(err,response){
    if(err) throw err;
    employee.exec((err,data)=>{
      if(err) throw err;
      res.render('index', { title: 'Employee Records' , records: data, message: "Record Successfully Inserted"});
    });
  });
});

router.post('/search',function(req,res,next){

  let filname= req.body.filterName;
  let filemail= req.body.filerEmail;
  let filetype= req.body.filterEmpType;

  //IF all 3 are selected 
  if(filname !="" && filemail !="" && filetype !=""){
    var filterParameter={ $and:[{ name:filname},{$and:[{email:filemail} ,{etype:filetype}]}
  ]
    }
  }

  //If 1st is selected and 3rd selected but not the second one
  else if(filname !="" && filemail =="" && filetype !=""){
    var filterParameter={ $and:[{ name:filname},{etype:filetype}]
    }
  }

  //If 1st is selected and 3rd selected but not the second one
  else if(filname =="" && filemail !="" && filetype !=""){
    var filterParameter={ $and:[{ email:filemail},{etype:filetype}]
    }
  }

  //If only employee type is selected
  else if(filname =="" && filemail =="" && filetype !=""){
    var filterParameter={etype:filetype}
  }

  else{
    var filterParameter={}
  }
  const employeeFilter=employeeModel.find( filterParameter);

  employeeFilter.exec(function(err,data){
    if(err) throw err;
    res.render('index', { title: 'Employee Records' , records: data , message:''});
  });
});



router.get('/delete/:id',function(req,res,next){
  let id=req.params.id;
  let delEmployee=employeeModel.findByIdAndDelete(id);
  delEmployee.exec(function(err){
    if(err) throw err;
    employee.exec(function(err,data){
      if(err) throw err;
      res.render('index', { title: 'Employee Records' , records: data, message: "Record Deleted Successfully"})
    });
  });
});

router.get('/edit/:id', function(req,res,next){
  let id= req.params.id;
  let editEmployee=employeeModel.findById(id);
  editEmployee.exec(function(err,data){
    if(err) throw err;
    res.render('edit',{title : 'Edit Employee Records', records: data });
  });
});


router.post('/update',(req,res,next)=>{
  let id= req.body.id;
  let updatedEmployee=employeeModel.findByIdAndUpdate(id,{
    name: req.body.name,
    email: req.body.email,
    etype: req.body.etype,
    hourlyRate: req.body.hourlyRate,
    totalHour: req.body.totalHour,
    total : parseInt(req.body.hourlyRate)* parseInt(req.body.totalHour),
  });
  updatedEmployee.exec((err)=>{
    if(err) throw err;
    employee.exec((err,data)=>{
      if(err) throw err;
      res.render('index', { title: 'Employee Records' , records: data, message: "Record Successfully Updated"});
    });
  });
});





//Upload File page
router.get('/upload',checkLogin,(req,res,next)=>{
  imageData.exec((err,data)=>{
    if(err) throw err;
    res.render('uploadFile',{title: "File Upload" ,images:data, message:''});
  })
})

router.post('/upload-file',uploadMiddleware,(req,res,next)=>{
  const imageFile=req.file.filename;
  const saveImage=new  uploadFileModel({
    imagename : imageFile
  });
  saveImage.save(function(err){
    if(err) throw err;
    imageData.exec((err,data)=>{
      if(err) throw err;
      const success=req.file.filename+" Upload Successfully";
      res.render('uploadfile',{title: "File Upload",images:data  ,message:success})
  });
});
});

module.exports = router;
