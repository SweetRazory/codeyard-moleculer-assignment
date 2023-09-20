import mongoose from "mongoose"

const { Schema } = mongoose
const { ObjectId } = Schema.Types

const addressSchema = new Schema({
  _id: { type: ObjectId, required: true, auto: true, index: true },
  zip_code: { type: Number, required: true },
  country: { type: String, required: true },
  city: { type: String, required: true },
  county: { type: String, required: true },
  street: { type: String, required: true },
  houseNumber: { type: String, required: true }
})

const tokenSchema = new Schema({
  _id: { type: ObjectId, required: true, auto: true, index: true },
  token: { type: String, required: true, },
  ttl: { type: Date, expires: 24 * 60 * 60, default: Date.now() }
})

const userSchema = new Schema({
  _id: { type: ObjectId, required: true, auto: true },
  name: { type: String, default: undefined },
  email: { type: String, required: true, lowercase: true },
  password: { type: String, required: true },
  addresses: { type: [addressSchema], default: [] },
  tokens: { type: [tokenSchema], default: [] }
})

const User = mongoose.model("users", userSchema)

export default User