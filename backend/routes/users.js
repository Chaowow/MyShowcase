const express = require('express');
const router = express.Router();
const { 
    getUsers, 
    upsertUser, 
    getUserById, 
    incrementProfileViews, 
    likeUser,
    updateUsername
} = require('../controllers/usersControllers');

router.get('/', getUsers);
router.post('/', upsertUser);
router.get('/:auth0_id', getUserById);
router.patch('/:auth0_id/views', incrementProfileViews);
router.patch('/:auth0_id/likes', likeUser);
router.patch('/:auth0_id/username', updateUsername);

module.exports = router;