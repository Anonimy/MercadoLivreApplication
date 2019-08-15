const express = require('express');
const app = express();
const path = require('path');
const helmet = require('helmet');
const session = require('cookie-session');
const multer = require('multer');
const { validateToken } = require('./middlewares/tokens');
const { MeliObject } = require('./utils');
require('dotenv').config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, './public/pictures'),
  filename: (req, file, cb) => cb(null, Date.now() + file.originalname)
});

const upload = multer({ storage });

const { SYS_PWD } = process.env;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(helmet());
app.use(session({
  name: 'session',
  keys: ['bd7126f457237e4aab0d47124ce4aac2', '9009def68579d15d871a5bf346422839'],
  cookie: {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000 * 2) // 2 horas
  },
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  if (req.body.password === SYS_PWD) {
    req.session.user = true;
    res.redirect('/home');
  } else {
    res.redirect('/?error=senha-incorreta');
  }
});

app.get('/home', validateToken, async (req, res) => {
  try {
    const meliObject = new MeliObject(res.locals.access_token);
    const user = await meliObject.get('/users/me');
    const categories = await meliObject.get(`/sites/${user.site_id}/categories`);
    const currencies = await meliObject.get('/currencies');
    const listing_types = await meliObject.get(`/sites/${user.site_id}/listing_types`);
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

app.post('/post', validateToken, upload.single('picture'), async (req, res) => {
  try {
    const meliObject = new MeliObject(res.locals.access_token);
    const user = await meliObject.get('/users/me');
    const predict = await meliObject.get(`/sites/${user.site_id}/category_predictor/predict?title=${encodeURIComponent(req.body.title)}`);
    await meliObject.post('/items', {
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
    });
    console.log('publicado na categoria:', predict.name);
    console.log('category probability (0-1):', predict.prediction_probability, predict.variations);
    res.redirect('/posts');
  } catch(err) {
    console.log('Something went wrong', err);
    res.status(500).send(`Error! ${err}`);
  }
});

// TODO: exemplo de notificações
app.get('/notifications', (req, res) => {
  res.send('ok');
  console.log(req.body);
  // Recomendamos enviar um status 200 o mais rápido possível.
  // Você pode fazer algo assíncrono logo em seguida. Por exemplo
  // salvar num banco de dados de tempo real, como o firebase.
});

module.exports = app;