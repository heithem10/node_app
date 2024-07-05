const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const UserSchema = new mongoose.Schema({
  username:{
    type:String,
    required:[true, "Please provide username"],
    minlength: 4,
    maxlength: 50,
  },

  firstName: {
    type: String,
    required: [true, "Please provide first name"],
    minlength: 3,
    maxlength: 50,
  },

  lastName: {
    type: String,
    required: [true, "Please provide last name"],
    minlength: 3,
    maxlength: 50,
  },


  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],
    // Custom Validators package
    validate: {
      // validator package
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },

   address: {
    type: String,
    required: [true, "Please provide address"],
    minlength: 3,
    maxlength: 100,
  },


  password: {
    type: String,
    required: [true, "Please provide password"],
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
})

// Hashed the password before saving the user into database
UserSchema.pre("save", async function () {

  // Only run this function if password was modified (not on other update functions)
  if (!this.isModified("password")) return
  const salt = await bcrypt.genSalt(10)
  // Hash the password using bcrypt
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password)
  return isMatch
} 

module.exports = mongoose.model("User", UserSchema)
