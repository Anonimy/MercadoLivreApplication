const express = require('express');
const path = require('path');
const meli = require('mercadolibre');
const { tokens, setTokens } = require('./tokens');
const app = express();
require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.render('index');
});

app.get('/mercadolivre', (req, res, next) => {
  if (!tokens.access_token) {
    const { code } = req.query;
    const meliObject = new meli.Meli(Number(CLIENT_ID), CLIENT_SECRET);
    if (code) {
      meliObject.authorize(code, REDIRECT_URI, (error, response) => {
        if (error) {
          throw error;
        }
        setTokens(response);
        res.redirect('/');
      });
    } else {
      res.redirect(meliObject.getAuthURL(REDIRECT_URI));
    }
  } else {
    res.send('ok');
  }
});

module.exports = app;