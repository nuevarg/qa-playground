import { expressjwt as jwt } from 'express-jwt';
import * as express from 'express';

/**
 * Extracts the JWT token from HTTP request headers.
 * Resolves authentication schemes matching both 'Token <JWT>' (Conduit specification)
 * and standard 'Bearer <JWT>' tokens.
 */
const getTokenFromHeaders = (req: express.Request): string | null => {
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

/**
 * JWT Authentication middleware helpers using express-jwt.
 * Maps parsed user claims to the req.auth (or req.user depending on mapping configuration) context.
 */
const auth = {
  /** Enforces user authentication; rejects requests lacking a valid JWT claim. */
  required: jwt({
    secret: process.env.JWT_SECRET || 'superSecret',
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
  /** Permissive authentication middleware; leaves claims undefined if credentials are absent. */
  optional: jwt({
    secret: process.env.JWT_SECRET || 'superSecret',
    credentialsRequired: false,
    getToken: getTokenFromHeaders,
    algorithms: ['HS256'],
  }),
};

export default auth;
