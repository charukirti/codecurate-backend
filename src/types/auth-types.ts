/* type interface for Sign up body */

export interface SignUp {
  name: string;
  username: string;
  email: string;
  password: string;
  isAdmin?: boolean;
  refreshToken?: string;
}

/* type interface for Sign in body */

export interface SignIn {
  email: string;
  password: string;
}
