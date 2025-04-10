const express = require('express');
const router = express.Router();
const { getUserLists, createList } = require('../controllers/listsController');

router.get('/:auth0_id', getUserLists);
router.post('/', createList);

module.exports = router;