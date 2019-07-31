const express = require('express');
const path = require('path');
const meli = require('mercadolibre');
const { validateToken } = require('./middlewares/tokens');
const { meli_get } = require('./utils');
const app = express();
require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.render('index');
});

// TODO: exemplo de get
app.get('/home', validateToken, async (req, res,) => {
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
app.post('/post', validateToken, async (req, res) => {
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
      buying_mode: 'buy_it_now', // FIXME: cheque /categories/{CATEGORY_ID} nas configurações do parâmetro:{ buying_modes:[…] }.
      listing_type_id: req.body.listing_type,
      condition: req.body.condition,
      description: req.body.description,
      tags: [ 'immediate_payment' ],
      pictures: [
        {
          source: 'http://mla-s2-p.mlstatic.com/968521-MLA20805195516_072016-O.jpg' // FIXME: add upload de fotos
        }
      ]
    };
    meliObject.post('/items', body, null, (err, response) => {
      if (err) {
        throw err;
      } else {
        console.log('publicado na categoria:', predict.name);
        console.log('category probability (0-1):', predict.prediction_probability, predict.variations)
        res.send(response);
      }
    });
  } catch(err) {
    console.log('Something went wrong', err);
    res.status(500).send(`Error! ${err}`);
  }
});

// TODO: exemplo de notificações
app.get('/notifications', (req, res, next) => {
  res.send('ok');
  console.log('do something asynchrounous, e.g.: firebase real-time database', req.body);
});

module.exports = app;