const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = 8000;

// Connect to MongoDB
mongoose.connect("mongodb+srv://moyoDB:kGJXyIhJ7Nv2Qx4u@cluster0.fx2hgta.mongodb.net/sample_ecommerce", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Product Schema
const productSchema = new mongoose.Schema({
  productCode: String,
  productName: String,
  productLine: String,
  productScale: String,
  productVendor: String,
  productDescription: String,
  quantityInStock: Number,
  buyPrice: Number,
  MSRP: Number,
});

// Create Product model
const Product = mongoose.model('Product', productSchema);

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// CRUD Endpoints

// Create a new product
app.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Read all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Read a specific product by productCode
app.get('/products/:productCode', async (req, res) => {
  try {
    const product = await Product.findOne({ productCode: req.params.productCode });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a product by productCode
app.put('/products/:productCode', async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { productCode: req.params.productCode },
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a product by productCode
app.delete('/products/:productCode', async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ productCode: req.params.productCode });
    if (!deletedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(deletedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to add or remove quantityInStock
app.patch('/products/:productCode/quantity', async (req, res) => {
  try {
    const { operation, quantity } = req.body;

    if (operation !== 'add' && operation !== 'remove') {
      res.status(400).json({ message: 'Invalid operation. Use "add" or "remove".' });
      return;
    }

    const product = await Product.findOne({ productCode: req.params.productCode });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (operation === 'add') {
      product.quantityInStock += quantity;
    } else if (operation === 'remove') {
      if (product.quantityInStock === 0) {
        res.status(400).json({ message: 'Cannot remove stock when quantityInStock is zero.' });
        return;
      }
      product.quantityInStock -= quantity;
    }

    await product.save();
    res.json({ message: `QuantityInStock updated successfully. New quantity: ${product.quantityInStock}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});