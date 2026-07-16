import express from "express";
const router = express.Router();

import multer from "multer";
import cloudinary from "../src/config/cloudinary.js";

import Product from "../src/models/Product.js";
import Brand from "../src/models/Brand.js";
import Category from "../src/models/Category.js";
import Attributes from "../src/models/Attributes.js";
import HomePageSection from "../src/models/HomePageSection.js";
import HomePageSectionItem from "../src/models/HomePageSectionItem.js";
import Colors from "../src/models/Colors.js";

const upload = multer({ dest: "uploads/" });

const COLOR_CODES = {
  Yellow: "YEL",
  Red: "RED",
  Black: "BLK",
  Blue: "BLU",
  Green: "GRN",
  White: "WHT",
  Pink: "PNK"
};
const pathForCollections = {
  categories: [{ path: "attributeIds" }],
  products: [{ path: "categoryId"}, {path: "specifications"} ]
};

const models = {
  colors: Colors,
  products: Product,
  categories: Category,
  attributes: Attributes,
  brands: Brand,
  homepagesections: HomePageSection,
  homepagesectionitems: HomePageSectionItem,
  
};

const searchableFields = {
    products: [
        "name",
        "categorySlug",
        "seoURI",
        "details.productCode"
    ],

    categories: [
        "name",
        "slug"
    ],

    brands: [
        "name"
    ],

    colors: [
        "name"
    ]
};

const getModel = (collectionName) => {
  const Model = models[collectionName];

  if (!Model) {
    throw new Error(`Invalid collection name: ${collectionName}`);
  }

  return Model;
};

// ==========================
// Upload & Map Images
// ==========================
const uploadAndMapImages = async ({
  req,
  parsedData,
  folder = "products",
  mergeExisting = false,
  existingData = null
}) => {
  if (!req.files || req.files.length === 0) {
    return parsedData;
  }

  const uploadedResults = await Promise.all(
    req.files.map((file) =>
      cloudinary.uploader.upload(file.path, { folder })
    )
  );

  const filesWithUrls = req.files.map((file, index) => ({
    fieldname: file.fieldname,
    url: uploadedResults[index].secure_url,
    public_id: uploadedResults[index].public_id
  }));

  parsedData.colorImages = parsedData.colorImages?.map((c, i) => {
    const matched = filesWithUrls.filter(
      (f) => f.fieldname === `images_${i}`
    );

    let images = matched.map((m) => ({
      url: m.url,
      public_id: m.public_id
    }));

    if (mergeExisting && existingData) {
      const oldColor = existingData.colorImages?.find(
        (oc) => oc.color === c.color
      );

      images = [...(oldColor?.images || []), ...images];
    }

    return {
      ...c,
      images
    };
  });

  return parsedData;
};

async function getCollectionRecordByCondition(collectionName, whereClause) {
  const Model = getModel(collectionName);
  const { _id, ...restWhereClause } = whereClause;
  let where = {...restWhereClause, isDeleted: { $ne: true }};
  let query = Model.find(where);
  const populatePaths = pathForCollections[collectionName];
  if (populatePaths) {
    populatePaths.forEach(p => {
      query = query.populate(p);
    });
  }
  const data = await query.exec();
  return data;
}
// ==========================
// Utility function - single record
// ==========================
async function getCollectionRecordById(collectionName, id) {
  const Model = getModel(collectionName);
  let query = Model.findById({_id:id, isDeleted: { $ne: true } });
  const populatePaths = pathForCollections[collectionName];
  if (populatePaths) {
    populatePaths.forEach(p => {
      query = query.populate(p);
    });
  }
  const data = await query.exec();
  return data;
}
// ==========================
// Utility function - All records
// ==========================
async function getCollectionRecords(collectionName, options={}) {

  const {
      limit = 10,
      offset = 0,
      search = "",
      whereClause = {},
      sort = { createdAt: -1 }
  } = options;

  const Model = getModel(collectionName);

  let filter = {
      isDeleted: { $ne: true },
      status: true,
      ...whereClause
  };

  const fields = searchableFields[collectionName] || [];

  if (search.trim() && fields.length) {

      filter.$or = fields.map(field => ({
          [field]: {
              $regex: search,
              $options: "i"
          }
      }));

  }

  let query = Model.find(filter)
    .sort(sort)
    .skip(offset)
    .limit(limit);
  
  if (collectionName === "homepagesectionitems") {
    query = query.sort({ displayOrder: 1 });
  }

  const populatePaths = pathForCollections[collectionName];
  if (populatePaths) {
    populatePaths.forEach(p => {
      query = query.populate(p);
    });
  }

  query = query.skip(offset).limit(limit);
  const records = await query.exec();
  const totalRecords = await Model.countDocuments(filter);
  return {
    data: records,
    totalRecords
  };
}

async function generateProductCode() {
  return Math.floor(
      100000000 + Math.random() * 900000000
    ).toString();
}
async function generateProductSKU(productCode, variants) {
  const keysToRemove = ["price", "discount", "stock"];

  return variants
    .filter(variant => {
      return Object.entries(variant).some(([key, value]) => {
        if (keysToRemove.includes(key)) return false; // ignore housekeeping keys
        if (Array.isArray(value)) return value.length > 0;
        return value !== "" && value !== null && value !== undefined;
      });
    })
    .map(variant => {
      const cleaned = Object.fromEntries(
        Object.entries(variant).filter(([key]) => !keysToRemove.includes(key))
      );

      const dynamicAttributes = Object.keys(cleaned);

      const skus = [];

      function buildCombinations(keys, prefix) {
        if (keys.length === 0) {
          skus.push(prefix);
          return;
        }

        const [currentKey, ...restKeys] = keys;
        const values = Array.isArray(cleaned[currentKey])
          ? cleaned[currentKey]
          : [cleaned[currentKey]];

        values.forEach(val => {
          buildCombinations(restKeys, `${prefix}${val ? `-${val}` : ``}`);
        });
      }

      buildCombinations(dynamicAttributes, productCode);

      return { ...variant, skus };
    });
}


// ==========================
// Fetch Records
// ==========================
router.post("/fetchRecordsNew", async (req, res) => {
  try {
    const { collectionName, options={}} = req.body;
    const {
      id=null,
      whereClause={},
      limit=10,
      offset=1,
      sort={createdAt: -1},
      search="",
      populate=[]
    } = options;
    console.log(whereClause);
    console.log(whereClause ? "whre" : (id !== null ? "here in id " : "blanck"));
    const data = id !== null 
                    ? await getCollectionRecordById(collectionName, id) 
                    : await getCollectionRecords(collectionName, options)
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

// ==========================
// Fetch Records
// ==========================
router.post("/fetchRecords", async (req, res) => {
  try {
    console.log("here");
    const { collectionName, id=null, whereClause=null } = req.body;
    console.log(req.body);
    console.log(whereClause ? "whre" : (id !== null ? "here in id " : "blanck"));
    const data = whereClause
                ? await getCollectionRecordByCondition(collectionName, whereClause) : 
                  ( 
                    id !== null 
                    ? await getCollectionRecordById(collectionName, id) 
                    : await getCollectionRecords(collectionName)
                  );
            
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});


// ==========================
// Get Single Record
// ==========================
router.post("/fetchRecordById", async (req, res) => {
  try {
    const { collectionName, id } = req.body;
    const data = await getCollectionRecordById(collectionName, id);
    console.log(data);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message
    });
  }
});


// ==========================
// Add Record
// ==========================
router.post("/addRecord", upload.any(), async (req, res) => {
  try {
    const { collectionName, data } = req.body;
    const Model = getModel(collectionName);
    if (typeof data === "string") {
      data = JSON.parse(data);
  }
    let parsedData = data;
    console.log(parsedData);

    if (collectionName === "products") {
      parsedData = await uploadAndMapImages({
        req,
        parsedData,
        folder: "products"
      });
      var productCode = await generateProductCode();
      parsedData.variants = await generateProductSKU(productCode, parsedData.variants);
      parsedData.details = {
        ...parsedData.details,
        productCode
      };
      const brand = await Brand.findById(parsedData.brandId);

      const slugify = str => str.trim().toLowerCase().replace(/\s+/g, "-");

      const seoURI = `${slugify(brand.name)}-${slugify(parsedData.name)}/${productCode}`;
      parsedData.seoURI = seoURI;
    } else if (collectionName === "HomePageSection") {
      const uploadResult = await cloudinary.uploader.upload(
        req.files[0].path,
        {
          folder: "homepage-sections"
        }
      );
      parsedData.image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }
    const record = await Model.create(parsedData);
    res.status(201).json({
      message: "Added successfully",
      id: record._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Add failed",
      error: error.message
    });
  }
});

// ==========================
// Update Record
// ==========================
router.patch("/updateRecord", upload.any(), async (req, res) => {
  try {
    const { collectionName, id, data } = req.body;

    const Model = getModel(collectionName);

    let parsedData = JSON.parse(data);

    if (collectionName === "products") {
      const existing = await Model.findById(id);

      parsedData = await uploadAndMapImages({
        req,
        parsedData,
        folder: "products",
        mergeExisting: true,
        existingData: existing
      });
    } else if (collectionName === "HomePageSection" && req.files?.length) {
      const uploadResult = await cloudinary.uploader.upload(
        req.files[0].path,
        {
          folder: "homepage-sections"
        }
      );

      parsedData.image = {
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id
      };
    }
    
    const updated = await Model.findByIdAndUpdate(
      id,
      { $set: parsedData },
      {
        new: true,
        runValidators: true
      }
    );
    res.json({
      message: "Updated successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Update failed",
      error: error.message
    });
  }
});

// ==========================
// Soft Delete
// ==========================
router.delete("/deleteRecord", async (req, res) => {
  try {
    const { collectionName, id } = req.body;

    const Model = getModel(collectionName);

    const result = await Model.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        message: "Record not found"
      });
    }

    res.json({
      message: "Deleted successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Delete failed"
    });
  }
});

// ==========================
// Delete Product Images + Soft Delete
// ==========================
router.delete(
  "/deleteRecord/:id/:collectionName",
  async (req, res) => {
    try {
      const { id, collectionName } = req.params;

      const Model = getModel(collectionName);

      const record = await Model.findById(id);

      if (!record) {
        return res.status(404).json({
          message: "Record not found"
        });
      }

      if (
        collectionName === "products" &&
        record.colorImages?.length
      ) {
        const publicIds = [];

        record.colorImages.forEach((color) => {
          color.images?.forEach((img) => {
            if (img.public_id) {
              publicIds.push(img.public_id);
            }
          });
        });

        await Promise.all(
          publicIds.map((publicId) =>
            cloudinary.uploader.destroy(publicId)
          )
        );
      }

      await Model.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );

      res.json({
        message: "Deleted successfully"
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Delete failed"
      });
    }
  }
);
router.get("/getHomePageSectionDesignTypes", async (req, res) => { 
  try {
    const data = await HomePageSection.find({status : true}, {title:true, designType:true, position:true, _id:false});
    const result = data.map(d => ({
      position: d.position.replace(/-([a-z])/g, (_, char) => char.toUpperCase()),
      designType: d.designType,
      title: d.title
    }));
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/homepagesectionsByPosition", async (req, res) => {
  try {
    const sections = await HomePageSection.aggregate([
      {
        $lookup: {
          from: "homepagesectionitems",
          localField: "_id",
          foreignField: "sectionId",
          as: "items"
        }
      },
      {
        $sort: {
          displayOrder: 1
        }
      }
    ]);
    const result = Object.fromEntries(
      sections.map(section => [
        section.position.replace(/-([a-z])/g, (_, char) => char.toUpperCase()),
        section.items.sort(
          (a, b) => a.displayOrder - b.displayOrder
        )
      ])
    );
    console.log(`Data`, JSON.stringify(sections, null, 2));
    return res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message
    });
  }
});

export default router;