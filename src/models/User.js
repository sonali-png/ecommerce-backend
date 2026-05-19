import mongoose from 'mongoose';

const CUSTOMER = parseInt(process.env.CUSTOMER, 10);
const ADMIN = parseInt(process.env.ADMIN, 10);
const SELLER = parseInt(process.env.SELLER, 10);

const userSchema = new mongoose.Schema({
  userId: {
    type:String,
    unique: true
  },
  firstName: {
    type:String,
  }, 
  lastName: {
    type:String,
  },
  gender: {
    type:String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },

  role: {
    type: Number,
    enum: [CUSTOMER, ADMIN, SELLER],
    default: CUSTOMER
  },

  phone: {
    type: String,
    default: ''
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

/* mongoose.set("debug", (collectionName, method, query, doc, options) => {
  let mongoMethod = "";

  if (method === "findOne") mongoMethod = "findOne";
  else if (method === "find") mongoMethod = "find";
  else if (method === "updateOne") mongoMethod = "updateOne";
  else if (method === "insertOne") mongoMethod = "insertOne";
  else mongoMethod = method;

  console.log(
    `db.${collectionName}.${mongoMethod}(${JSON.stringify(query)}, ${JSON.stringify(doc || {})})`
  );
}); */

export default mongoose.model('User', userSchema);
