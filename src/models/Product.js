import mongoose from "mongoose";


const specificationSchema = new mongoose.Schema({
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attributes",
    required: true
  },
  value: String
}, { _id: false });

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  alt: String,
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const attributeSchema = new mongoose.Schema({
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attribute"
  },

  value: String
}, { _id: false });

const variantSchema = new mongoose.Schema({
  price: Number,
  discount: Number,
  stock: Number
}, {
  _id: false
});

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },

    description: String,

    // Relations
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand"
    },
    categorySlug: String,
    brandSlug: String,
    minPrice: Number,
    maxPrice: Number,
    totalStock: Number,
    thumbnail: String,

    // Variants
    variants: [variantSchema],

    // Color-wise Images
    colorImages: {
      type: Map,
      of: [imageSchema],
      default: {}
    },

    // Dynamic Attributes - isVariant - false will be consider as specification
    specifications: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attributes",
      required: true
    }],

    // Search Tags
    tags: [String],

    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],

    // Product Labels
    isFeatured: {
      type: Boolean,
      default: false
    },

    isTrending: {
      type: Boolean,
      default: false
    },

    isNewArrival: {
      type: Boolean,
      default: false
    },

    isBestSeller: {
      type: Boolean,
      default: false
    },

    // Ratings
    averageRating: {
      type: Number,
      default: 0
    },

    reviewCount: {
      type: Number,
      default: 0
    },
    details: {
      productCode: { type:String, unique:true, required: true},
      genericName:String,
      countryOfOrigin:String,
      manufacturedBy:String,
      manufacturerAddress:String,
      packedBy:String,
      packerAddress:String,
    },
    // Status
    status: {
      type: Boolean,
      default: true
    },

    // Is deleted
    isDeleted: {
      type: Boolean,
      default: false
    }
  }, {
  timestamps: true
  }
);

export default mongoose.model("Product", productSchema);