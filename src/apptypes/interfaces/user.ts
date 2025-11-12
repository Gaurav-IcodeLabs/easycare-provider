import { UUID } from './common'

export interface LoginResponse {
  id: UUID
  type: string
  attributes: UserAttributes
  profileImage: null
  stripeAccount: null
}

export interface UserAttributes {
  deleted: boolean
  banned: boolean
  email: string
  stripeConnected: boolean
  stripePayoutsEnabled: boolean
  createdAt: Date
  stripeChargesEnabled: boolean
  identityProviders: any[]
  pendingEmail: null
  emailVerified: boolean
  profile: UserProfile
}

export interface UserProfile {
  displayName: string
  firstName: string
  privateData: Data
  protectedData: UserProtectedData
  bio: null
  abbreviatedName: string
  lastName: string
  publicData: UserPublicData
  metadata: Data
}

export interface Data {
  verified: boolean
}

export interface UserProtectedData {
  phoneNumber: string
}

export interface UserPublicData {
  custome_text: string
  multiple_selection: string[]
  select_one: string
  userType: string
}
