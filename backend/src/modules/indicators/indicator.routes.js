const express = require("express");
const router = express.Router();
const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");
const asyncHandler = require("../../lib/asyncHandler");
const indicatorService = require("./indicator.service");

// Indicadores consolidam dados de todos os chamados, então só atendentes
// têm acesso. Cliente recebe 403.
router.get(
  "/",
  authenticate,
  authorize("agent"),
  asyncHandler(async (req, res) => {
    res.status(200).json(await indicatorService.getIndicators());
  })
);

module.exports = router;
