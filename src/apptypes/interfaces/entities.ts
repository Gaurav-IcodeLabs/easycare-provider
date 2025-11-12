import { UUID } from './common'
import { Geolocation, Money } from './listing'
import { EntityType, ImageVariants } from './types'

type ExtendedData = Record<string, unknown>

export interface IEntity<T extends string = string> {
  id: UUID
  type: T
  attributes: Record<string, unknown>
  relationships: {
    [key: string]: {
      data: { id: UUID; type: EntityType } | { id: UUID; type: EntityType }[]
    }
  }
}

export interface IImage extends IEntity<'image'> {
  attributes: {
    variants:
      | Record<
          ImageVariants,
          {
            name: string
            width: number
            height: number
            url: string
          }
        >
      | Record<
          string,
          {
            name: string
            width: number
            height: number
            url: string
          }
        >
  }
}

export interface IMarketplace extends IEntity<'marketplace'> {
  attributes: {
    name: string
  }
}

export type UserRelationships = 'marketplace' | 'profileImage'
export interface IUser<
  TPublicData extends ExtendedData = {},
  TMetaData extends ExtendedData = {},
> extends IEntity<'user'> {
  attributes: {
    banned: boolean
    deleted: boolean
    createdAt: Date
    profile: {
      displayName: string
      abbreviatedName: string
      bio: string | null
      publicData: TPublicData
      metadata: TMetaData
    }
  }
  marketplace: IMarketplace
  profileImage: IImage | null
}

export interface IStripeAccount extends IEntity<'stripeAccount'> {
  attributes: {
    stripeAccountId: string
    stripeAccountData: Record<string, unknown> | null
  }
}

export interface IStripePaymentMethod extends IEntity<'stripePaymentMethod'> {
  attributes: {
    type: 'stripe-payment-method/card'
    stripePaymentMethodId: string
    card: {
      brand: string
      last4Digits: string
      expirationYear: number
      expirationMonth: number
    }
  }
}

export interface IStripeCustomer extends IEntity<'stripeCustomer'> {
  attributes: {
    stripeCustomerId: string
  }
  defaultPaymentMethod: IStripePaymentMethod | null
}

export interface ICurrentUser<
  TPublicData extends ExtendedData = {},
  TProtectedData extends ExtendedData = {},
  TPrivateData extends ExtendedData = {},
  TMetaData extends ExtendedData = {},
> extends IEntity<'currentUser'> {
  attributes: {
    banned: boolean
    deleted: boolean
    createdAt: Date
    email: string
    emailVerified: boolean
    pendingEmail: string | null
    stripeConnected: boolean
    identityProviders: {
      idpId: string
      userId: string
    }[]
    profile: {
      firstName: string
      lastName: string
      displayName: string
      abbreviatedName: string
      bio: string | null
      publicData: TPublicData
      protectedData: TProtectedData
      privateData: TPrivateData
      metadata: TMetaData
    }
  }
  profileImage: IImage | null
  marketplace: IMarketplace
  stripeAccount: IStripeAccount | null
  stripeCustomer: IStripeCustomer | null
}

export interface IStripeAccountLink extends IEntity<'stripeAccountLink'> {
  attributes: {
    url: string
    expiresAt: Date
  }
}

export interface IStripePerson extends IEntity<'stripePerson'> {
  attributes: {
    stripePersonId: string
  }
}

export interface IStripeSetupIntent extends IEntity<'stripeSetupIntent'> {
  attributes: {
    stripeSetupIntentId: string
    clientSecret: string
  }
}

export interface IStock extends IEntity<'stock'> {
  attributes: {
    quantity: number
  }
}

export interface IListing<
  TPublicData extends ExtendedData = {},
  TMetaData extends ExtendedData = {},
> extends IEntity<'listing'> {
  attributes: {
    title: string
    description: string | null
    geolocation: Geolocation | null
    createdAt: Date
    price: Money | null
    availabilityPlan:
      | null
      | {
          type: 'availability-plan/day'
        }
      | {
          type: 'availability-plan/time'
          timezone: string
        }
    publicData: TPublicData
    metadata: TMetaData
    deleted: boolean
    state: 'published' | 'closed'
  }
  marketplace: IMarketplace
  author: IUser
  images: IImage[] | null
  currentStock: IStock | null
}

export type OwnListingRelationships =
  | 'marketplace'
  | 'author'
  | 'author.profileImage'
  | 'images'
  | 'currentStock'

export interface IOwnListing<
  TPublicData extends ExtendedData = {},
  TPrivateData extends ExtendedData = {},
  TMetaData extends ExtendedData = {},
> extends IEntity<'ownListing'> {
  attributes: {
    title: string
    description: string | null
    geolocation: Geolocation | null
    createdAt: Date
    price: Money | null
    state: 'draft' | 'pendingApproval' | 'published' | 'closed'
    availabilityPlan:
      | null
      | {
          type: 'availability-plan/day'
          entries: {
            dayOfWeek: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
            seats: number
          }[]
        }
      | {
          type: 'availability-plan/time'
          timezone: string
          entries: {
            seats: number
            startTime: string
            endTime: string
          }[]
        }
    publicData: TPublicData
    privateData: TPrivateData
    metadata: TMetaData
  }
  currentStock: IStock | null
  images: IImage[] | null
  author: ICurrentUser
  marketplace: IMarketplace
}

export type AvailabilityExceptionRelationships = 'ownListing'

export interface IAvailabilityException
  extends IEntity<'availabilityException'> {
  attributes: {
    seats: number
    start: Date
    end: Date
  }
  ownListing: IOwnListing
}

export type BookingRelationships =
  | 'transaction'
  | 'transaction.customer'
  | 'transaction.customer.profileImage'
export interface IBooking extends IEntity<'booking'> {
  attributes: {
    seats: number
    start: Date
    end: Date
    displayStart: Date
    displayEnd: Date
    state: 'pending' | 'proposed' | 'accepted' | 'declined' | 'cancelled'
  }
  transaction: ITransaction
}

export interface IStockReservation extends IEntity<'stockReservation'> {
  attributes: {
    quantity: number
    state: 'pending' | 'proposed' | 'accepted' | 'declined' | 'cancelled'
  }
}

export interface IReview extends IEntity<'review'> {
  attributes: {
    type: 'ofCustomer' | 'ofProvider'
    state: 'pending' | 'public'
    rating: 1 | 2 | 3 | 4 | 5
    content: string
    createdAt: Date
    deleted: boolean
  }
  author: IUser
  listing: IListing
  subject: IUser
}

export interface IMessage extends IEntity<'message'> {
  attributes: {
    content: string
    createdAt: Date
  }
  sender: IUser
  transaction: ITransaction
}

export interface ITransaction<
  TProtectedData extends ExtendedData = {},
  TMetaData extends ExtendedData = {},
> extends IEntity<'transaction'> {
  attributes: {
    createdAt: Date
    processName: string
    processVersion: number
    lastTransition: `transition/${string}`
    lastTransitionedAt: Date
    lineItems: {
      code: `line-item/${string}`
      unitPrice: Money
      quantity?: number
      units?: number
      seats?: number
      percentage?: number
      lineTotal: Money
      reversal: boolean
      includedFor: ('customer' | 'provider')[]
    }[]
    payinTotal: Money
    payoutTotal: Money
    protectedData: TProtectedData
    metadata: TMetaData
    transitions: {
      transition: string
      createdAt: Date
      by: 'customer' | 'provider' | 'operator' | 'system'
    }[]
    marketplace: IMarketplace
    listing: IListing
    provider: IUser
    customer: IUser
    booking: IBooking
    stockReservation: IStockReservation
    reviews: IReview[]
    messages: IMessage[]
  }
  customer: IUser
  provider: IUser
  listing: IListing
  booking: IBooking
}

export interface IProcessTransition extends IEntity<'processTransition'> {
  attributes: {
    name: string
    author: 'customer' | 'provider' | 'operator' | 'system'
    actions: string[]
    params: {
      req: Record<string, unknown> | null
      opt: Record<string, unknown> | null
    }
  }
}

export interface ITimeSlot extends IEntity<'timeSlot'> {
  attributes: {
    type: `time-slot/${'date' | 'time'}`
    seats: number
    start: Date
    end: Date
  }
}

export interface IStockAdjustment extends IEntity<'stockAdjustment'> {
  attributes: {
    at: Date
    quantity: number
  }
}
