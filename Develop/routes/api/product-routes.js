const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try{
  const products = await Product.findAll({
    include: [
      { model: Category },
      { model: Tag }
    ]
  });

  res.status(200).json(products);
}  catch(err){
  console.error(err);
}

});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    let product = await Product.findByPk(
      req.params.id, {
      include: [{
        model: Category,
        model: Tag
      }]
    });
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
  }
});

// Create new product
router.post('/', async (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  try {
    // Create the product
    const product = await Product.create(req.body);

    // If there are product tags, create pairings to bulk create in the ProductTag model

    if (Array.isArray(req.body.tagIds) && req.body.tagIds.length) {
      const productTagIdArr = tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    // Respond with the newly created product
    res.status(200).json(product);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: `Failed to create product because of ${err}` });
  }
});


// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {

        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
            .filter((tag_id) => !productTagIds.includes(tag_id))
            .map((tag_id) => {
              return {
                product_id: req.params.id,
                tag_id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  try {
    // Delete product by its `id` value
    const productDeletion = await Product.destroy({
      where: { id: req.params.id }
    });

    if (!productDeletion) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated product tags
    await ProductTag.destroy({
      where: { product_id: req.params.id }
    });

    res.status(200).json({ message: `Product and associated tags deleted successfully` });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while trying to delete the product' });
  }
});


module.exports = router;
