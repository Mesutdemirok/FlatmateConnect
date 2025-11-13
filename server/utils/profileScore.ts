import type { User, UserPreferences } from "@shared/schema";

export function calculateProfileScore(user: User, prefs?: UserPreferences | null): number {
  let score = 0;

  // Profile image (30%)
  if (user.profileImageUrl) {
    score += 30;
  }

  // Name (10%)
  if (user.firstName && user.lastName) {
    score += 10;
  }

  // Phone (10%)
  if (user.phone) {
    score += 10;
  }

  // Bio (10%)
  if (user.bio) {
    score += 10;
  }

  // City (10%)
  if (user.city) {
    score += 10;
  }

  // Gender (10%)
  if (user.gender) {
    score += 10;
  }

  // Date of birth (5%)
  if (user.dateOfBirth) {
    score += 5;
  }

  // Occupation (5%)
  if (user.occupation) {
    score += 5;
  }

  // Lifestyle preferences (10%) - Award if ANY preference is filled
  if (prefs) {
    if (
      prefs.smokingPreference ||
      prefs.petPreference ||
      prefs.cleanlinessLevel ||
      prefs.socialLevel
    ) {
      score += 10;
    }
  }

  return Math.min(100, Math.max(0, score));
}
