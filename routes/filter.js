import express from "express";
const router = express.Router();

import Product from "../src/models/Product.js";
import Brand from "../src/models/Brand.js";
import Category from "../src/models/Category.js";
import Attributes from "../src/models/Attributes.js";
import HomePageSection from "../src/models/HomePageSection.js";
import HomePageSectionItem from "../src/models/HomePageSectionItem.js";


const pathForCollections = {
  categories: [{ path: "attributeIds" }],
  products: [{path: "categoryId"}, { path: "brandId"}]
};

const models = {
  products: Product,
  categories: Category,
  attributes: Attributes,
  brands: Brand,
  homepagesections: HomePageSection,
  homepagesectionitems: HomePageSectionItem
};

const getModel = (collectionName) => {
  const Model = models[collectionName];

  if (!Model) {
    throw new Error(`Invalid collection name: ${collectionName}`);
  }

  return Model;
};

// ==========================
// Utility function - All records
// ==========================
async function filterProduct(whereClause, sortObj, page, limit) {
  let query = Product.find(whereClause);

  if (Object.keys(sortObj).length) {
    query = query.sort(sortObj);
  } else {
    query = query.sort({ createdAt: -1 });
  }

  query = query
    .skip((page - 1) * limit)
    .limit(limit);

  pathForCollections.products.forEach(path => {
    query = query.populate(path);
  });

  const [products, totalRecords] = await Promise.all([
    query.exec(),
    Product.countDocuments(whereClause)
  ]);
  const hasMore = products.length > limit;
  if (hasMore) {
    products.pop();
  }

  return {
    products,
    pagination: {
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      hasNextPage: page * limit < totalRecords,
      hasPrevPage: page > 1,
      nextCursor: hasMore ? offset + limit : null,
      hasMore: hasMore
    }
  };
}


async function filterProductTrueCursor(whereClause, sortObj, cursor, limit) {
  let finalWhere = { ...whereClause };

  // If a cursor is passed, only retrieve items older than this document ID
  if (cursor) {
    finalWhere._id = { $lt: cursor };
  }
  

  // Force chronological sequence logic
  let query = Product.find(finalWhere);;

  if (Object.keys(sortObj).length) {
    query = query.sort(sortObj);
  } else {
    query = query.sort({ createdAt: -1 });
  }
  query = query.limit(limit + 1);

  pathForCollections.products.forEach(path => {
    query = query.populate(path);
  });

  const products = await query.exec();
  const hasMore = products.length > limit;

  if (hasMore) {
    products.pop();
  }

  const lastItem = products[products.length - 1];

  return {
    products,
    pagination: {
      nextCursor: hasMore && lastItem ? lastItem._id.toString() : null,
      hasMore
    }
  };
}


router.get("/products" , async (req, res) => {
  try {
    const {
      category,
      brand,
      minPrice,
      maxPrice,
      color,
      search,
      minDiscount,
      maxDiscount,
      rating,
      inStock,
      sort,
      limit = 6,
      cursor
    } = req.query;
    const currentCursor = cursor || null;
    const variantAttributes = await Attributes.find({
      isVariant: true
    });

    const variantSlugs = variantAttributes.map(a => a.slug);

    let whereClause = {};
    let variantFilter = {};

    if(category) {
      whereClause.categorySlug = {
        $in: category.split(",")
      };
    }

    if (brand) {
      whereClause.brandSlug = {
        $in: brand.split(",")
      };
    }

    if (minPrice) {
      whereClause.minPrice = {
        $gte: Number(minPrice)
      };
    }

    if (maxPrice) {
      whereClause.maxPrice = {
        $lte: Number(maxPrice)
      };
    }
    
    if(minDiscount || maxDiscount ) {
      variantFilter.discount = {};
      if(minDiscount){
        variantFilter.discount.$gte = Number(minDiscount);
      }
      if(maxDiscount) {
        variantFilter.discount.$lte = Number(maxDiscount);
      }
    }
    if (rating) {
      whereClause.rating = {
        $gte: Number(rating)
      };
    }

    if (inStock === "true") {
      whereClause.totalStock = {
        $gt: 0
      };
    }

    let sortObj = {};

    switch (sort) {
      case "price_asc":
        sortObj = { minPrice: 1 };
        break;

      case "price_desc":
        sortObj = { minPrice: -1 };
        break;

      case "newest":
        sortObj = { createdAt: -1 };
        break;

      case "oldest":
        sortObj = { createdAt: 1 };
        break;

      default:
        sortObj = {};
    }

    if (search) {
      whereClause.$or = [
        {
          name: {
            $regex: search,
            $options: "i"
          }
        },
        {
          description: {
            $regex: search,
            $options: "i"
          }
        }
      ];
    }

    for (const slug of variantSlugs) {
      if (req.query[slug]) {
        variantFilter[`${slug}`] = {
          $in: req.query[slug].split(",")
        };
      }
    }

    if (Object.keys(variantFilter).length) {
      whereClause.variants = {
        $elemMatch: variantFilter
      };
    }

    console.log(whereClause);

    const products = await filterProductTrueCursor(whereClause, sortObj, currentCursor, Number(limit));

    res.json(products);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});





export default router;