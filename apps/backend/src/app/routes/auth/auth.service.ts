import * as bcrypt from 'bcryptjs';
import { RegisterInput } from './register-input.model';
import prisma from '../../../prisma/prisma-client';
import HttpException from '../../models/http-exception.model';
import { RegisteredUser } from './registered-user.model';
import generateToken from './token.utils';
import { User } from './user.model';

/**
 * Checks database records to ensure the proposed email and username are not already registered.
 * Throws a 422 HTTP exception detailing conflicts if any records are found.
 * @param email User email string
 * @param username User username string
 */
const checkUserUniqueness = async (email: string, username: string) => {
  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  const existingUserByUsername = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (existingUserByEmail || existingUserByUsername) {
    throw new HttpException(422, {
      errors: {
        ...(existingUserByEmail ? { email: ['has already been taken'] } : {}),
        ...(existingUserByUsername
          ? { username: ['has already been taken'] }
          : {}),
      },
    });
  }
};

/**
 * Registers and saves a new user to the database.
 * Encrypts password using bcrypt before storage.
 * @param input Payload fields matching RegisterInput
 * @returns RegisteredUser payload including a newly generated session token
 */
export const createUser = async (
  input: RegisterInput
): Promise<RegisteredUser> => {
  const email = input.email?.trim();
  const username = input.username?.trim();
  const password = input.password;
  const { image, bio, demo } = input;

  if (!email) {
    throw new HttpException(422, { errors: { email: ["can't be blank"] } });
  }

  if (!username) {
    throw new HttpException(422, { errors: { username: ["can't be blank"] } });
  }

  if (!password) {
    throw new HttpException(422, { errors: { password: ["can't be blank"] } });
  }

  await checkUserUniqueness(email, username);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      ...(image ? { image } : {}),
      ...(bio ? { bio } : {}),
      ...(demo ? { demo } : {}),
    },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return {
    ...user,
    token: generateToken(user.id),
  };
};

/**
 * Authenticates user login credentials (email and password).
 * Compares hashed bcrypt signatures.
 * @param userPayload Login credentials containing email and password
 * @returns User properties and token on success
 */
export const login = async (userPayload: any) => {
  const email = userPayload.email?.trim();
  const password = userPayload.password;

  if (!email) {
    throw new HttpException(422, { errors: { email: ["can't be blank"] } });
  }

  if (!password) {
    throw new HttpException(422, { errors: { password: ["can't be blank"] } });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      username: true,
      password: true,
      bio: true,
      image: true,
    },
  });

  if (user) {
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      return {
        email: user.email,
        username: user.username,
        bio: user.bio,
        image: user.image,
        token: generateToken(user.id),
      };
    }
  }

  throw new HttpException(403, {
    errors: {
      'email or password': ['is invalid'],
    },
  });
};

/**
 * Resolves database properties for a given user ID.
 * @param id User ID key
 * @returns User data and token
 */
export const getCurrentUser = async (id: number) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  if (!user) {
    throw new HttpException(404, { errors: { user: ['not found'] } });
  }

  return {
    ...user,
    token: generateToken(user.id),
  };
};

/**
 * Updates selected properties for a given user ID.
 * Encrypts password if it is updated.
 * @param userPayload Object containing update overrides (email, username, password, image, bio)
 * @param id User ID key to target
 * @returns Updated user details
 */
export const updateUser = async (userPayload: any, id: number) => {
  const { email, username, password, image, bio } = userPayload;
  let hashedPassword;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      ...(email ? { email } : {}),
      ...(username ? { username } : {}),
      ...(password ? { password: hashedPassword } : {}),
      ...(image ? { image } : {}),
      ...(bio ? { bio } : {}),
    },
    select: {
      id: true,
      email: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  return {
    ...user,
    token: generateToken(user.id),
  };
};
