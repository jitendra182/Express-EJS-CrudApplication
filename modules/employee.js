const mongoose=require('mongoose');

 mongoose.connect('mongodb://localhost:27017/employee', {
     useUnifiedTopology: true,
     useNewUrlParser: true,
 })
.then(() => console.log('DB Connected!'))
.catch(err => {
 console.log(`DB Connection Error: ${err.message}`);
});

//mongodb+srv://jitendra:<password>@cluster0.4cvuo.mongodb.net/<dbname>?retryWrites=true&w=majority


// mongoose.connect('mongodb://localhost:27017/employee', {
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
// });
// mongoose.connection.on('connected',()=>{
//     console.log("Connected to mongo DB")
// })
// mongoose.connection.on('error',(err)=>{
//     console.log("Error connection" +err);
// })

//Employee Schema is created
const employeeSchema = new mongoose.Schema({
    name: String,
    email: String,
    etype: String,
    hourlyRate: Number,
    totalHour: Number,
    total: Number,
});

// Employee Model is created with Employee Schema
const employeeModal=mongoose.model('Employee',employeeSchema);

module.exports=employeeModal;
