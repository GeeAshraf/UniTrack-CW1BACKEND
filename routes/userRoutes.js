const express = require('express');
const { RetrieveAllUsers, RetrieveUserById, CreateUser, UpdateUserById, DeleteUserById } = require('../controllers/UserController');
const protect = require('../middleware/projectRoute');

const router = express.Router();
router.use(protect);

router.get('/', RetrieveAllUsers);
router.get('/:id', RetrieveUserById);
router.post('/', CreateUser);
router.put('/:id', UpdateUserById);
router.delete('/:id', DeleteUserById);

module.exports = router;
