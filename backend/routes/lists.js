const express = require('express');
const router = express.Router();
const { getUserLists, createList, updateList, deleteList } = require('../controllers/listsController');

router.get('/:auth0_id', getUserLists);
router.post('/', createList);
router.patch('/:id', updateList);
router.delete('/:id', deleteList);

module.exports = router;