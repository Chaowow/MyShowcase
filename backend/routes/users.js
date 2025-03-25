const express = require('express');
const router = express.Router();
const { getUsers, upsertUser, getUserById } = require('../controllers/usersControllers');

router.get('/', getUsers);
router.post('/', upsertUser);
router.get('/:auth0_id', getUserById);

module.exports = router;