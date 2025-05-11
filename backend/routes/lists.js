const express = require('express');
const router = express.Router();
const { getPinnedLists, togglePinnedList, getUserLists, createList, updateList, deleteList } = require('../controllers/listsController');

router.get('/pinned/:user_auth0_id', getPinnedLists);
router.patch('/pin', togglePinnedList);
router.get('/:auth0_id', getUserLists);
router.post('/', createList);
router.patch('/:id', updateList);
router.delete('/:id', deleteList);

module.exports = router;