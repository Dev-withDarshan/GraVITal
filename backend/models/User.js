import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// ✅ Schema defined FIRST
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  gpaData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
}, { timestamps: true });

// ✅ Index defined AFTER the schema
UserSchema.index(
  { username: 1 },
  { unique: true}
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;