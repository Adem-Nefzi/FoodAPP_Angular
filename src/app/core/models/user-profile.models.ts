export interface UserProfileResponse {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  website?: string;
  favoriteRecipes: number;
  createdRecipes: number;
  cookedRecipes: number;
  followers: number;
  following: number;
  joinedDate: string;
  lastActive?: string;
  stats?: {
    totalLikes: number;
    totalComments: number;
    totalViews: number;
  };
}

export interface UpdateProfileRequest {
  username?: string;
  bio?: string;
  fullName?: string;
  phoneNumber?: string;
  location?: string;
  website?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface SuccessResponse {
  message: string;
}
