import express from 'express'
import { getAllPosts } from '../controllers/posts';

const userRoutes = express.Router();

userRoutes.get('/', getAllPosts);

export default userRoutes;