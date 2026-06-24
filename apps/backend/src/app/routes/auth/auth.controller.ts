import { NextFunction, Request, Response, Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as express from 'express';
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

router.post(
  '/user/upload-avatar',
  auth.required,
  express.raw({ type: 'image/*', limit: '10mb' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalName = (req.headers['x-file-name'] as string) || 'avatar.png';
      const ext = path.extname(originalName) || '.png';
      const uniqueFilename = `avatar-${req.auth?.user?.id}-${Date.now()}${ext}`;
      
      const buffer = req.body;
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ success: false, message: 'No file data uploaded.' });
      }

      // Ensure target folders exist in dist
      const distDir = path.join(__dirname, '../../../assets/images');
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      // Ensure target folders exist in src
      const srcDir = path.join(process.cwd(), 'apps/backend/src/assets/images');
      const hasSrc = fs.existsSync(path.join(process.cwd(), 'apps/backend'));

      // Write to dist assets (served immediately)
      const distPath = path.join(distDir, uniqueFilename);
      fs.writeFileSync(distPath, buffer);

      // Persist in source assets (saved for clean builds)
      if (hasSrc) {
        if (!fs.existsSync(srcDir)) {
          fs.mkdirSync(srcDir, { recursive: true });
        }
        const srcPath = path.join(srcDir, uniqueFilename);
        fs.writeFileSync(srcPath, buffer);
      }

      const imageUrl = `http://localhost:3000/images/${uniqueFilename}`;
      res.json(successResponse('Avatar uploaded successfully', {
        url: imageUrl,
        name: uniqueFilename
      }));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
