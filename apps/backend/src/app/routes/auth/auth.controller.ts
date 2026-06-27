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
 * Registers a new user.
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
 * Authenticates a user and returns a session token.
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
 * Resolves properties of the current active session user.
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
 * Updates properties of the authenticated user.
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

/**
 * Uploads a raw binary image and converts it into a Base64 data URL.
 * Bypasses local disc filesystem writes for stateless/docker environment compliance.
 * @auth required
 * @route {POST} /user/upload-avatar
 * @headers x-file-name String
 * @headers content-type String
 * @body binary Raw Image buffer
 * @returns avatar Object containing image base64 data URL and filename
 */
router.post(
  '/user/upload-avatar',
  auth.required,
  express.raw({ type: 'image/*', limit: '10mb' }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const originalName = (req.headers['x-file-name'] as string) || 'avatar.png';
      const contentType = req.headers['content-type'] || 'image/png';
      
      const buffer = req.body;
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ success: false, message: 'No file data uploaded.' });
      }

      // Convert image buffer to Base64 data URL containing the original filename in parameters
      const base64Data = buffer.toString('base64');
      const imageUrl = `data:${contentType};name=${originalName};base64,${base64Data}`;

      res.json(successResponse('Avatar uploaded successfully', {
        url: imageUrl,
        name: originalName
      }));
    } catch (error) {
      next(error);
    }
  }
);

export default router;
