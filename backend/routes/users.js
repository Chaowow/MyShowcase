const express = require('express');
const router = express.Router();
const { getUsers, upsertUser } = require('../controllers/usersControllers');

router.get('/', getUsers);
router.post('/', upsertUser);

module.exports = router;