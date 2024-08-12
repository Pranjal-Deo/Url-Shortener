const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB setup
mongoose.connect('mongodb://localhost/urlshortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: String,
  shortUrl: String,
});

const Url = mongoose.model('Url', urlSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Routes
app.post('/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  const urlId = shortid.generate();

  try {
    const existingUrl = await Url.findOne({ originalUrl });

    if (existingUrl) {
      return res.json(existingUrl);
    }

    const shortUrl = `${req.protocol}://${req.get('host')}/${urlId}`;
    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();

    res.json(newUrl);
  } catch (error) {
    res.status(500).json('Server error');
  }
});

app.get('/:urlId', async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: `${req.protocol}://${req.get('host')}/${req.params.urlId}` });

    if (url) {
      return res.redirect(url.originalUrl);
    }

    res.status(404).json('No URL found');
  } catch (error) {
    res.status(500).json('Server error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
