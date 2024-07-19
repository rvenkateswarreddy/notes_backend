const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ error: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, "notes");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Token is not valid" });
  }
};
