## Auth Module - Remaining Tasks

### High Priority
- [ ] Protected route middleware (verify JWT accessToken)
- [ ] Refresh token endpoint (generate new accessToken from refreshToken)
- [ ] SignOut endpoint (clear refreshToken from DB + cookie)

### Medium Priority
- [ ] Token verification helper function
- [ ] Auth middleware error handling
- [ ] Password reset flow (optional)

### Testing
- [ ] Test signUp with duplicate email/username
- [ ] Test signIn with invalid credentials
- [ ] Test token expiration handling

### Notes
- RefreshToken stored in httpOnly cookie (7 days)
- AccessToken sent in response body
- All passwords hashed with bcrypt (10 rounds)