const meli_get = (meliObject, url, params = null) => (
  new Promise((resolve, reject) => {
    meliObject.get(url, params, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
);

module.exports = {
  meli_get
};