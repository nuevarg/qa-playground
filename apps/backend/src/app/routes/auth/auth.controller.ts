import { NextFunction, Request, Response, Router } from 'express';
import auth from './auth';
import { createUser, getCurrentUser, login, updateUser } from './auth.service';
import { successResponse } from '../../../utils/response';
import { validate } from '../../../core/middleware/validate.middleware';
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
} from './auth.validator';

const router = Router();

/**
 * Create an user
 * @auth none
 * @route {POST} /users
 * @bodyparam user User
 * @returns user User
 */
router.post(
  '/users',
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await createUser({ ...req.body.user, demo: false });
      res.status(201).json(successResponse('User created successfully', user));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Login
 * @auth none
 * @route {POST} /users/login
 * @bodyparam user User
 * @returns user User
 */
router.post(
  '/users/login',
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await login(req.body.user);
      res.json(successResponse('Login successful', user));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get current user
 * @auth required
 * @route {GET} /user
 * @returns user User
 */
router.get(
  '/user',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await getCurrentUser(req.auth?.user?.id);
      res.json(successResponse('User fetched successfully', user));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update user
 * @auth required
 * @route {PUT} /user
 * @bodyparam user User
 * @returns user User
 */
router.put(
  '/user',
  auth.required,
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await updateUser(req.body.user, req.auth?.user?.id);
      res.json(successResponse('User updated successfully', user));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
