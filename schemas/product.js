db.createCollection("products", {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'name',
        'description',
        'category',
        'brand',
        'created_at',
        'updated_at'
      ],
      properties: {
        name: {
          bsonType: 'string'
        },
        description: {
          bsonType: 'string'
        },
        images: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        price: {
          bsonType: 'array',
          items: {
            bsonType: 'double',
            minimum: 0
          }
        },
        discount: {
          bsonType: 'array',
          items: {
            bsonType: 'double',
            minimum: 0
          }
        },
        stock: {
          bsonType: 'array',
          items: {
            bsonType: 'int',
            minimum: 0
          }
        },
        size: {
          bsonType: 'array',
          items: {
            bsonType: 'objectId'
          }
        },
        category: {
          bsonType: 'objectId'
        },
        brand: {
          bsonType: 'string'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          }
        },
        rating: {
          bsonType: 'double',
          minimum: 0,
          maximum: 5
        },
        created_at: {
          bsonType: 'date'
        },
        updated_at: {
          bsonType: 'date'
        }
      }
    }
  }
});