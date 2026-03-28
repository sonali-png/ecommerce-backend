import mongoose from "mongoose";

import mongooseDouble from "mongoose-double";
mongooseDouble(mongoose);

const ProductDetailSchema = new mongoose.Schema(
  {
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    size_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Size',
    }, 
    // Price stored as Decimal128
    price: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
      set: v => {
        if (v === "" || v === null || v === undefined) return undefined;
        return mongoose.Types.Decimal128.fromString(v.toString());
      }
    },

    // Stock stored as integer (Number, floored)
    stock: {
      type: Number,
      required: true,
      min: 0,
      set: v => Math.floor(Number(v)) // return plain number
    },

    // Discount stored as double (plain number)
    discount: {
      type: mongoose.Schema.Types.Double,
      min: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("ProductDetail", ProductDetailSchema);