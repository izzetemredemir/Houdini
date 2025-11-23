import type { OctavPortfolio } from '../hooks/useOctavPortfolio'

export interface UserProfilePreferences {
  address: string
  displayName: string | null
  displayAvatar: string | null
  portfolioValue?: number
  portfolioData?: OctavPortfolio
  savedAt: number
}

const STORAGE_KEY = 'houdini_user_profiles'

export function saveUserProfile(
  address: string,
  preferences: Omit<UserProfilePreferences, 'address' | 'savedAt'>
): void {
  const profiles = getAllProfiles()
  const newProfile: UserProfilePreferences = {
    address: address.toLowerCase(),
    ...preferences,
    savedAt: Date.now(),
  }

  profiles[address.toLowerCase()] = newProfile
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function getUserProfile(address: string): UserProfilePreferences | null {
  const profiles = getAllProfiles()
  return profiles[address.toLowerCase()] || null
}

export function getAllProfiles(): Record<string, UserProfilePreferences> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export function clearUserProfile(address: string): void {
  const profiles = getAllProfiles()
  delete profiles[address.toLowerCase()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
}

export function getDisplayInfo(address: string): {
  name: string
  avatar: string | null
} {
  const profile = getUserProfile(address)

  if (!profile) {
    return {
      name: `${address.slice(0, 6)}...${address.slice(-4)}`,
      avatar: null,
    }
  }

  const name = profile.displayName || `${address.slice(0, 6)}...${address.slice(-4)}`
  const avatar = profile.displayAvatar || null

  return { name, avatar }
}
