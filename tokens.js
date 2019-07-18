const tokens = {
  access_token: null,
  refresh_token: null,
};

const setTokens = newTokens => {
  tokens.access_token = newTokens.access_token || null;
  tokens.refresh_token = newTokens.refresh_token || null;
};

// TODO:
const validateToken = () => true;

module.exports = {
  tokens,
  setTokens,
  validateToken
};