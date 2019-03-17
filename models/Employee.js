var mongoose = require('mongoose');

var EmpSchema = new mongoose.Schema({
  EmployeeID: Number,
  Name: String,
  Designation: String,
  Salary: Number,
  Experience: Number,

});

module.exports = mongoose.model('emps', EmpSchema);//searches for collection with plural of 1st arg - emp(s)
