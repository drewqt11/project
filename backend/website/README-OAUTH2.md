# Google OAuth2 Authentication for FolioFlow

This document provides detailed instructions on how to use the Google OAuth2 authentication feature in the FolioFlow application.

## Overview

The application supports two authentication methods:
1. Traditional username/password authentication
2. Google OAuth2 authentication (Sign in with Google)

## Google OAuth2 Authentication Flow

The OAuth2 authentication flow works as follows:

1. The frontend application requests the Google login URL from the backend
2. The user is redirected to Google's authentication page
3. After successful authentication, Google redirects back to our application
4. Our OAuth2 success handler generates JWT tokens and redirects to the frontend with these tokens
5. The frontend stores these tokens and uses them for subsequent API calls

## Backend Endpoints

### 1. Get Google Login URL

```
GET /api/auth/google-login-url
```

**Response:** A URL string to redirect the user to Google's authentication page

### 2. OAuth2 Callback

This is handled automatically by Spring Security. The URL is:

```
/login/oauth2/code/google
```

After successful authentication, the user will be redirected to the frontend URL specified in `app.oauth2.redirectUri` property with the following query parameters:
- `token` - JWT access token
- `refreshToken` - JWT refresh token for obtaining a new access token
- `id` - User ID
- `email` - User email
- `firstName` - User first name
- `lastName` - User last name

## Frontend Implementation Guide

Here's how to implement Google OAuth2 login in your frontend application:

1. **Add a "Sign in with Google" button to your login page**

2. **When the button is clicked, request the Google login URL:**
   ```javascript
   // Example with fetch API
   fetch('http://your-backend-url/api/auth/google-login-url')
     .then(response => response.text())
     .then(url => {
       // Redirect the user to Google's authentication page
       window.location.href = url;
     });
   ```

3. **Create a redirect page at the URL specified in `app.oauth2.redirectUri`**
   - This page should extract the tokens and user info from the URL query parameters
   - Store these tokens in local storage or cookies
   - Redirect to the main application page

   ```javascript
   // Example redirect page code
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   const refreshToken = urlParams.get('refreshToken');
   const id = urlParams.get('id');
   const email = urlParams.get('email');
   const firstName = urlParams.get('firstName');
   const lastName = urlParams.get('lastName');
   
   if (token) {
     // Store token and user info
     localStorage.setItem('token', token);
     localStorage.setItem('refreshToken', refreshToken);
     localStorage.setItem('user', JSON.stringify({ id, email, firstName, lastName }));
     
     // Redirect to main application
     window.location.href = '/dashboard';
   } else {
     // Handle error
     const error = urlParams.get('error');
     console.error('Authentication error:', error);
     window.location.href = '/login?error=' + error;
   }
   ```

4. **Use the token for API calls**
   ```javascript
   // Example API call with the JWT token
   fetch('http://your-backend-url/api/protected-resource', {
     headers: {
       'Authorization': 'Bearer ' + localStorage.getItem('token')
     }
   })
   .then(response => response.json())
   .then(data => {
     // Handle the response
   });
   ```

## Configuration

The OAuth2 configuration is in `application.properties`:

```properties
# Google OAuth Configuration
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
spring.security.oauth2.client.registration.google.scope=profile,email

# OAuth2 redirect URI for the frontend
app.oauth2.redirectUri=http://localhost:3000/oauth2/redirect
```

Make sure to:
1. Register your application in the [Google Cloud Console](https://console.cloud.google.com/)
2. Configure the OAuth consent screen
3. Create OAuth client ID credentials for a web application
4. Add `http://localhost:8080/login/oauth2/code/google` (or your server URL) as an authorized redirect URI in the Google Cloud Console

## Security Considerations

1. Always use HTTPS in production
2. Keep your Google client secret secure
3. Validate tokens on the backend for every protected API call
4. Consider implementing token refresh mechanisms for long user sessions 