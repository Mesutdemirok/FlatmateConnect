# Google Analytics 4 - Event Tracking Usage Guide

## Setup Complete ✅

Google Analytics (G-ME5ES9KLDE) is fully integrated with automatic pageview tracking.

## How to Use Analytics Events

Import the tracking functions from `@/lib/analytics` in any component:

```tsx
import { 
  trackSignup, 
  trackLogin, 
  trackCreateListing,
  trackMessageSend,
  trackSearch,
  trackEvent 
} from "@/lib/analytics";
```

---

## Event Functions

### 1. **User Registration (Üye Ol)**

```tsx
// After successful signup
trackSignup("email"); // or "google", "facebook"
```

**Where to use:** `client/src/pages/Auth.tsx` after successful registration

---

### 2. **User Login (Giriş Yap)**

```tsx
// After successful login
trackLogin("email"); // or "google", "facebook"
```

**Where to use:** `client/src/pages/Auth.tsx` after successful login

---

### 3. **Create Room Listing (Oda İlanı Ver)**

```tsx
// When user clicks create listing button
trackCreateListing();
```

**Where to use:** 
- `client/src/pages/CreateListing.tsx` - after successful listing creation
- Navigation button when user clicks "İlan Ver"

---

### 4. **Send Message (Mesaj Gönder)**

```tsx
// When user sends a message
trackMessageSend();
```

**Where to use:** `client/src/pages/Messages.tsx` - after message is sent successfully

---

### 5. **Search Action (Oda Arama)**

```tsx
// When user performs a search
trackSearch(searchValue); // e.g., "Kadıköy"
```

**Where to use:** `client/src/pages/Search.tsx` - when user submits search form

---

### 6. **Custom Events**

```tsx
// Track any custom event
trackEvent("favorite_added", {
  listing_id: "123",
  event_category: "Favorites"
});
```

---

## Implementation Examples

### Example 1: Track Signup in Auth.tsx

```tsx
const handleSignup = async (data: FormData) => {
  try {
    const result = await signupMutation.mutateAsync(data);
    
    // ✅ Track successful signup
    trackSignup("email");
    
    toast({ title: "Hesap oluşturuldu!" });
    navigate("/");
  } catch (error) {
    toast({ title: "Hata", variant: "destructive" });
  }
};
```

### Example 2: Track Search in Search.tsx

```tsx
const handleSearch = (searchTerm: string) => {
  setSearchQuery(searchTerm);
  
  // ✅ Track search action
  trackSearch(searchTerm);
  
  // Perform search...
};
```

### Example 3: Track Message Send in Messages.tsx

```tsx
const sendMessageMutation = useMutation({
  mutationFn: async (message: string) => {
    const response = await apiRequest("POST", "/api/messages", { message });
    return response.json();
  },
  onSuccess: () => {
    // ✅ Track message sent
    trackMessageSend();
    
    toast({ title: "Mesaj gönderildi" });
  }
});
```

---

## Pageview Tracking

**Already configured!** Pageviews are automatically tracked on every route change via Wouter routing in `App.tsx`. No manual action needed.

---

## Testing Events

### 1. **Google Analytics Realtime**
- Go to: https://analytics.google.com/
- Select property: G-ME5ES9KLDE
- Navigate to: **Realtime → Events**
- Perform actions in your app
- See events appear in real-time ✓

### 2. **Google Tag Assistant**
- Install: [Tag Assistant Chrome Extension](https://tagassistant.google.com/)
- Open your site and click the extension
- Verify gtag.js is loaded
- Check events are firing

### 3. **Browser Console**
```javascript
// Check if gtag is loaded
console.log(typeof window.gtag); // should be "function"

// Manually fire test event
window.gtag("event", "test_event", { test: true });
```

---

## Next Steps

Add the tracking calls to these files:

- [ ] `client/src/pages/Auth.tsx` - trackSignup(), trackLogin()
- [ ] `client/src/pages/CreateListing.tsx` - trackCreateListing()
- [ ] `client/src/pages/CreateSeekerProfile.tsx` - trackEvent("create_seeker_profile")
- [ ] `client/src/pages/Messages.tsx` - trackMessageSend()
- [ ] `client/src/pages/Search.tsx` - trackSearch()

Then test each event in Google Analytics Realtime!
