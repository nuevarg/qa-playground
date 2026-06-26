import prisma from '../../../prisma/prisma-client';
import profileMapper from './profile.utils';
import HttpException from '../../models/http-exception.model';

export const getProfile = async (usernamePayload: string, id?: number) => {
  const profile = await prisma.user.findUnique({
    where: {
      username: usernamePayload,
    },
    include: {
      followedBy: true,
      following: true,
    },
  });

  if (!profile) {
    throw new HttpException(404, {});
  }

  return profileMapper(profile, id);
};

export const followUser = async (usernamePayload: string, id: number) => {
  const profile = await prisma.user.update({
    where: {
      username: usernamePayload,
    },
    data: {
      followedBy: {
        connect: {
          id,
        },
      },
    },
    include: {
      followedBy: true,
      following: true,
    },
  });

  return profileMapper(profile, id);
};

export const unfollowUser = async (usernamePayload: string, id: number) => {
  const profile = await prisma.user.update({
    where: {
      username: usernamePayload,
    },
    data: {
      followedBy: {
        disconnect: {
          id,
        },
      },
    },
    include: {
      followedBy: true,
      following: true,
    },
  });

  return profileMapper(profile, id);
};

export const getFollowers = async (usernamePayload: string, loggedInUserId?: number) => {
  const user = await prisma.user.findUnique({
    where: {
      username: usernamePayload,
    },
    include: {
      followedBy: {
        include: {
          followedBy: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpException(404, {});
  }

  return user.followedBy.map((follower) => profileMapper(follower, loggedInUserId));
};

export const getFollowing = async (usernamePayload: string, loggedInUserId?: number) => {
  const user = await prisma.user.findUnique({
    where: {
      username: usernamePayload,
    },
    include: {
      following: {
        include: {
          followedBy: true,
        },
      },
    },
  });

  if (!user) {
    throw new HttpException(404, {});
  }

  return user.following.map((followed) => profileMapper(followed, loggedInUserId));
};

