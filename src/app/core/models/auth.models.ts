// Request models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profilePicture?: string;
}

export interface FirebaseLoginRequest {
  idToken: string;
}

// Response models
export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
}

export interface ErrorResponse {
  timestamp: string;
  message: string;
  details: string;
}

// User model
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
}
