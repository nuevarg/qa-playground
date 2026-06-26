import { NextFunction, Request, Response, Router } from 'express';
import auth from '../auth/auth';
import { followUser, getProfile, unfollowUser, getFollowers, getFollowing } from './profile.service';

const router = Router();

/**
 * Get profile
 * @auth optional
 * @route {GET} /profiles/:username
 * @param username string
 * @returns profile
 */
router.get(
  '/profiles/:username',
  auth.optional,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await getProfile(req.params.username, req.auth?.user?.id);
      res.json({ profile });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Follow user
 * @auth required
 * @route {POST} /profiles/:username/follow
 * @param username string
 * @returns profile
 */
router.post(
  '/profiles/:username/follow',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await followUser(req.params?.username, req.auth?.user?.id);
      res.json({ profile });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Unfollow user
 * @auth required
 * @route {DELETE} /profiles/:username/follow
 * @param username string
 * @returns profiles
 */
router.delete(
  '/profiles/:username/follow',
  auth.required,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await unfollowUser(req.params.username, req.auth?.user?.id);
      res.json({ profile });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Get followers list
 * @auth optional
 * @route {GET} /profiles/:username/followers
 * @param username string
 * @returns profiles
 */
router.get(
  '/profiles/:username/followers',
  auth.optional,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profiles = await getFollowers(req.params.username, req.auth?.user?.id);
      res.json({ profiles });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * Get following list
 * @auth optional
 * @route {GET} /profiles/:username/following
 * @param username string
 * @returns profiles
 */
router.get(
  '/profiles/:username/following',
  auth.optional,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profiles = await getFollowing(req.params.username, req.auth?.user?.id);
      res.json({ profiles });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
