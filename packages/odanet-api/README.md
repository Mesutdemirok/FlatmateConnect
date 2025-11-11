# @odanet/api

Shared API SDK for Odanet applications (web, mobile, backend).

## Installation

This package is internal to the Odanet monorepo.

## Usage

### Basic Usage

```typescript
import { api } from '@odanet/api';

// Login
const { data } = await api.auth.login('email@example.com', 'password');

// Get listings
const listings = await api.listings.getAll({ city: 'Istanbul' });

// Get seekers
const seekers = await api.seekers.getAll();
```

### With Authentication Token

```typescript
import { OdanetAPI } from '@odanet/api';

const api = new OdanetAPI({
  baseURL: 'https://www.odanet.com.tr/api',
  token: 'your-jwt-token'
});

// Or set token later
api.setToken('your-jwt-token');

// Clear token
api.clearToken();
```

### Individual Functions

```typescript
import { login, getListings, getSeekers } from '@odanet/api';

const response = await login('email@example.com', 'password');
const listings = await getListings();
const seekers = await getSeekers();
```

## API Reference

### Auth
- `auth.login(email, password)` - Login user
- `auth.register(data)` - Register new user
- `auth.logout()` - Logout user
- `auth.me()` - Get current user

### Listings
- `listings.getAll(filters?)` - Get all listings
- `listings.getById(id)` - Get listing by ID
- `listings.getBySlug(slug)` - Get listing by slug
- `listings.create(data)` - Create new listing
- `listings.update(id, data)` - Update listing
- `listings.delete(id)` - Delete listing

### Seekers
- `seekers.getAll(filters?)` - Get all seeker profiles
- `seekers.getById(id)` - Get seeker by ID
- `seekers.getBySlug(slug)` - Get seeker by slug
- `seekers.create(data)` - Create seeker profile
- `seekers.update(id, data)` - Update seeker profile
- `seekers.delete(id)` - Delete seeker profile

### Messages
- `messages.getConversations()` - Get user conversations
- `messages.getMessages(conversationId)` - Get messages in conversation
- `messages.send(data)` - Send new message
- `messages.markAsRead(conversationId)` - Mark messages as read

### Users
- `users.getProfile()` - Get user profile
- `users.updateProfile(data)` - Update user profile
- `users.uploadProfileImage(formData)` - Upload profile image
