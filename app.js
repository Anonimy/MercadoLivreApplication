const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const session = require('cookie-session');
const meli = require('mercadolibre');
const multer = require('multer');
const { validateToken } = require('./middlewares/tokens');
const { meli_get } = require('./utils');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/pictures'),
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
});

const upload = multer({ storage });

const { CLIENT_ID, CLIENT_SECRET } = process.env;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet());
app.use(session({
  name: 'session',
  keys: ['bd7126f457237e4aab0d47124ce4aac2', '9009def68579d15d871a5bf346422839'],
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000 * 6) // 6 horas
  },
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  if (req.body.password === 'pwd') {
    req.session.user = true;
    res.redirect('/home');
  } else {
    res.redirect('/?error=senha-incorreta');
  }
});

// TODO: exemplo de get
app.get('/home', validateToken, async (req, res) => {
  try {
    const meliObject = new meli.Meli(CLIENT_ID, CLIENT_SECRET, res.locals.access_token);
    const user = await meli_get(meliObject, '/users/me');
    const categories = await meli_get(meliObject, `/sites/${user.site_id}/categories`);
    const currencies = await meli_get(meliObject, '/currencies');
    const listing_types = await meli_get(meliObject, `/sites/${user.site_id}/listing_types`);
    res.render('home', {
      user,
      categories,
      currencies,
      listing_types
    });
  } catch (err) {
    console.log('Something went wrong', err);
    res.status(500).send(`Error! ${err}`);
  }
});

app.get('/posts', validateToken, async (req, res) => {
  try {
    const meliObject = new meli.Meli(CLIENT_ID, CLIENT_SECRET, res.locals.access_token);
    const user = await meli_get(meliObject, '/users/me');
    const items = (await meli_get(meliObject, `/users/${user.id}/items/search`)).results || [];
    if (items.length) {
      res.send(items);
    } else {
      res.status(404).send('no items were found :(');
    }
  } catch(err) {
    console.log('Something went wrong', err);
    res.status(500).send(`Error! ${err}`);
  }
});

// TODO: exemplo de post
app.post('/post', validateToken, upload.single('picture'), async (req, res) => {
  try {
    const meliObject = new meli.Meli(CLIENT_ID, CLIENT_SECRET, res.locals.access_token);
    const user = await meli_get(meliObject, '/users/me');
    const predict = await meli_get(meliObject, `/sites/${user.site_id}/category_predictor/predict?title=${encodeURIComponent(req.body.title)}`);
    const body = {
      title: req.body.title,
      category_id: predict.id,
      price: req.body.price,
      currency_id: req.body.currency,
      available_quantity: req.body.quantity,
      buying_mode: 'buy_it_now',
      listing_type_id: req.body.listing_type,
      condition: req.body.condition,
      description: req.body.description,
      tags: [ 'immediate_payment' ],
      pictures: [
        {
          source: `${req.protocol}://${req.get('host')}/pictures/${req.file.filename}`
        }
      ]
    };
    meliObject.post('/items', body, null, (err, response) => {
      if (err) {
        throw err;
      } else {
        console.log('publicado na categoria:', predict.name);
        console.log('category probability (0-1):', predict.prediction_probability, predict.variations);
        res.send(response);
      }
    });
  } catch(err) {
    console.log('Something went wrong', err);
    res.status(500).send(`Error! ${err}`);
  }
});

// TODO: exemplo de notificações
app.get('/notifications', (req, res) => {
  res.send('ok');
  console.log(req.body);
  // Recomendamos enviar um status 200 o mais rapido possível.
  // Você pode fazer algo assíncrono logo em seguida. Salvar num
  // banco de dados de tempo real, como o firebase, por exemplo.
});

module.exports = app;