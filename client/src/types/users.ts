// src/types/users.ts
export interface User {
  id: number | string;
  userId?: number | string; // Backend might use userId
  email?: string;
  displayName?: string;
  userName?: string;
  bio?: string;
  avatarUrl?: string;
  countryCode?: string;
  createdAt?: string;
  createdAtUtc?: string; // Backend uses createdAtUtc
  updatedAtUtc?: string; // Backend uses updatedAtUtc
  followerCount?: number;
  followingCount?: number;
  projectCount?: number;
  ideaCount?: number;
  saveCount?: number; // Count of ideas saved by this user
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface UserProfile extends User {
  isFollowing?: boolean;
  isFollowedBy?: boolean;
}

export interface FollowRelationship {
  id: number | string;
  followerId: number | string;
  followingId: number | string;
  createdAt?: string;
  follower?: User;
  following?: User;
}

export interface SearchUsersParams {
  query?: string;
  skip?: number;
  take?: number;
}

export interface SearchUsersResponse {
  results: User[];
  total: number;
  skip: number;
  take: number;
}

export interface FollowRequest {
  followingId: number | string;
}

export interface UnfollowRequest {
  followingId: number | string;
}
