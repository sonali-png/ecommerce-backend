import mongoose from "mongoose";
import Attributes from "./Attributes.js";

const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  alt: String,
  isPrimary: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const colorImagesSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true
  },
  images: {
    type: [imageSchema],
    default: []
  }
}, { _id: false });


const variantAttributeSchema = new mongoose.Schema({
  attributeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attributes",
    required: true
  },
  value: {
    type: String,
    required: true
  }
}, { _id: false });

const variantSchema = new mongoose.Schema({
  attributes: {
    type: [variantAttributeSchema],
    required: true
  },
  mrp: Number,
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
      type : [colorImagesSchema],
      default: []
    },

    // Dynamic Attributes - isVariant - false will be consider as specification
    specifications: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref:Attributes, 
        required:true
      }
    ],

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




/* 
{
  "collectionName": "products",
  "data": {
    "name": "EthnicJunction Women Georgette Relaxed Fit Tie & Dye & Embroidered A-Line Flared Kurta",
    "description": "Summer Kurta,Kurta For Office,Long Kurti",
    "categoryId": "6a292bd43f7f239baafafe6e",
    "brandId": "6a98025915f1eafbc3b84193",
    "variants": [
      {
        "attributes": [
          {
            "attributeId": "6a280c260ddf02769698f80c",
            "value": "M"
          },
          {
            "attributeId": "6a292c083f7f239baafafe73",
            "value": "red"
          }
        ],
        "mrp": "2568",
        "price": "698",
        "discount": "73",
        "stock": "1"
      },
      {
        "attributes": [
          {
            "attributeId": "6a280c260ddf02769698f80c",
            "value": "M"
          },
          {
            "attributeId": "6a292c083f7f239baafafe73",
            "value": "black"
          }
        ],
        "mrp": "2568",
        "price": "698",
        "discount": "73",
        "stock": "3"
      },
      {
        "attributes": [
          {
            "attributeId": "6a280c260ddf02769698f80c",
            "value": "L"
          },
          {
            "attributeId": "6a292c083f7f239baafafe73",
            "value": "red"
          }
        ],
        "mrp": "2568",
        "price": "698",
        "discount": "73",
        "stock": "5"
      },
      {
        "attributes": [
          {
            "attributeId": "6a280c260ddf02769698f80c",
            "value": "L"
          },
          {
            "attributeId": "6a292c083f7f239baafafe73",
            "value": "black"
          }
        ],
        "mrp": "2568",
        "price": "698",
        "discount": "73",
        "stock": "2"
      }
    ],
    "specifications": [
      "6a293a1f718eec49310a57e6",
      "6a29448b302f8324513e1d5f"
    ],
    "details": {
      "productCode": "",
      "genericName": "blue kurta",
      "countryOfOrigin": "IN",
      "manufacturedBy": "abc manufacturer",
      "manufacturerAddress": "abc manufaturer address",
      "packedBy": "abc packer",
      "packerAddress": "abc packer address"
    },
    "colorImages": [
      {
        "color": "red",
        "images": []
      },
      {
        "color": "black",
        "images": []
      }
    ]
  }
}
  */