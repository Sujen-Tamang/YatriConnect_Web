import express from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    createUser
} from '../../controllers/admin/adminUserController.js';

const router = express.Router();

// GET /admin/users - Get all users
router.get('/', getAllUsers);

// POST /admin/users - Create new user
router.post('/', createUser);

// GET /admin/users/:id - Get user by ID
router.get('/:id', getUserById);

// PUT /admin/users/:id - Update user
router.put('/:id', updateUser);

// DELETE /admin/users/:id - Delete user
router.delete('/:id', deleteUser);

export default router;