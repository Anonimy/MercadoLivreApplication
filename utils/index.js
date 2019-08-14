const meli = require('mercadolibre');
require('dotenv').config();

const { CLIENT_ID, CLIENT_SECRET } = process.env;

const MeliObject = function meliObject(access_token) {
  this.meli = new meli.Meli(CLIENT_ID, CLIENT_SECRET, access_token);
};

MeliObject.prototype.get = function meli_get(url, params = null) {
  return new Promise((resolve, reject) => {
    this.meli.get(url, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

MeliObject.prototype.post = function meli_post(url, body, params = null) {
  return new Promise((resolve, reject) => {
    this.meli.post(url, body, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

module.exports = {
  MeliObject
};