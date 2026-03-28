import mongoose from "mongoose";

import mongooseDouble from "mongoose-double";
mongooseDouble(mongoose);


const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required:true
    },
    brand: { type: String, required:true },
    images: { 
      type: [String], 
      required:true 
    },
    slug:{ type:String }
  },
  { timestamps: true }
);

export default mongoose.model("Product", ProductSchema);