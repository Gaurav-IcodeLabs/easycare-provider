import {CreateUserParams} from './authslice';
import {ImageVariantsMap, UUID} from './common';
import {ListingTypes} from './listing';
import {
  IAvailabilityException,
  IBooking,
  ICurrentUser,
  IEntity,
  IImage,
  IListing,
  IMessage,
  IOwnListing,
  IReview,
  IStock,
  IStockAdjustment,
  IStockReservation,
  IStripeAccount,
  IStripeAccountLink,
  IStripeCustomer,
  IStripePerson,
  IStripeSetupIntent,
  ITimeSlot,
  ITransaction,
  IUser,
} from './entities';
import {
  Geolocation,
  LatLngBounds,
  Listing,
  ListingAuthor,
  Money,
} from './listing';
import {
  alias,
  AvailabilityExceptionRelationships,
  BookingRelationships,
  CurrentUserQueryParams,
  CurrentUserRelationships,
  ListingRelationships,
  MessageRelationships,
  OwnListingRelationships,
  RequestedCapabilities,
  ReviewRelationships,
  StockAdjustmentRelationships,
  TransactionRelationships,
} from './types';

type SdkResponse<T extends IEntity | IEntity[] = IEntity> = {
  status: number;
  statusText: string;
  data: {
    data: T;
    included?: IEntity[];
    meta: T extends IEntity[]
      ? {
          page: number;
          perPage?: number;
          totalItems: number;
          totalPages: number;
        }
      : undefined;
  };
};

export interface SDK {
  authInfo: () => Promise<{
    authScopes: string[];
    grantType: 'refresh_token';
    isAnonymous: boolean;
  }>;

  login: (params: {username: string; password: string}) => Promise<{
    access_token: string;
    scope: 'user';
    token_type: 'bearer';
    expires_in: number;
    refresh_token: string;
  }>;

  logout: () => Promise<void>;

  assetsByVersion: ({
    paths,
    version,
  }: {
    paths: string[];
    version: number;
  }) => Promise<{}>;

  assetsByAlias: ({
    paths,
    alias,
  }: {
    paths: string[];
    alias: alias;
  }) => Promise<{}>;

  users: {
    show: (params: {
      id: UUID;
      include?: [];
      'fields.image'?: [];
      'fields.user'?: [];
    }) => Promise<SdkResponse<IUser>>;
  };

  currentUser: {
    show: (
      params?: Omit<CurrentUserQueryParams, 'expand'>,
    ) => Promise<SdkResponse<ICurrentUser>>;
    create: (
      params: {
        email: string;
        firstName: string;
        lastName: string;
        displayName?: string;
        password: string;
        bio?: string;
        publicData?: Record<string, unknown>;
        protectedData?: Record<string, unknown>;
        privateData?: Record<string, unknown>;
      },
      queryParams?: {
        expand: boolean;
        include?: CurrentUserRelationships[];
        'fields.image'?: ImageVariantsMap[];
        'fields.user'?: any;
      },
    ) => Promise<SdkResponse<ICurrentUser>>;
    createWithIdp: (
      params: {
        idpId: string;
        idpClientId: string;
        idpToken: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        displayName?: string;
        bio?: string;
        publicData?: Record<string, unknown>;
        protectedData?: Record<string, unknown>;
        privateData?: Record<string, unknown>;
      },
      queryParams?: CurrentUserQueryParams,
    ) => Promise<SdkResponse<ICurrentUser>>;
    updateProfile: (
      params: Partial<{
        firstName: string;
        lastName: string;
        displayName: string;
        bio: string;
        publicData: Record<string, unknown>;
        protectedData: protectedData;
        privateData: Record<string, unknown>;
        profileImageId: UUID;
      }>,
      queryParams?: CurrentUserQueryParams,
    ) => Promise<SdkResponse<ICurrentUser>>;
    changePassword: (
      params: {
        currentPassword: string;
        newPassword: string;
      },
      queryParams?: CurrentUserQueryParams,
    ) => Promise<SdkResponse<ICurrentUser>>;
    changeEmail: (
      params: {
        currentPassword: string;
        email: string;
      },
      queryParams?: CurrentUserQueryParams,
    ) => Promise<SdkResponse<ICurrentUser>>;
    verifyEmail: (
      params: {
        verificationToken: string;
      },
      queryParams?: CurrentUserQueryParams,
    ) => Promise<void>;
    sendVerificationEmail: () => Promise<void>;
  };

  passwordReset: {
    request: (params: {email: string}) => Promise<void>;
    reset: (params: {
      email: string;
      passwordResetToken: string;
      newPassword: string;
    }) => Promise<void>;
  };

  stripeAccount: {
    fetch: () => Promise<SdkResponse<IStripeAccount>>;
    create: (
      params: {
        country: string;
        accountToken?: string;
        bankAccountToken?: string;
        businessProfileMCC?: string;
        businessProfileURL?: string;
        businessProfileProductDescription?: string;
        requestedCapabilities?: RequestedCapabilities[];
      },
      queryParams?: {
        expand: boolean;
      },
    ) => Promise<SdkResponse<IStripeAccount>>;
    update: (
      params: Partial<{
        accountToken?: string;
        bankAccountToken?: string;
        businessProfileMCC?: string;
        businessProfileURL?: string;
        businessProfileProductDescription?: string;
        requestedCapabilities?: RequestedCapabilities[];
      }>,
      queryParams?: {
        expand: boolean;
      },
    ) => Promise<SdkResponse<IStripeAccount>>;
  };

  stripeAccountLinks: {
    create: (
      params: {
        failureURL: string;
        successURL: string;
        type: 'custom_account_verification' | 'custom_account_update';
        collect: 'currently_due' | 'eventually_due';
      },
      queryParams?: {
        expand: boolean;
      },
    ) => Promise<SdkResponse<IStripeAccountLink>>;
  };

  stripePersons: {
    create: (
      params: {
        personToken: string;
      },
      queryParams?: {
        expand: boolean;
      },
    ) => Promise<SdkResponse<IStripePerson>>;
  };

  stripeSetupIntents: {
    create: (
      params: {},
      queryParams?: {
        expand: boolean;
      },
    ) => Promise<SdkResponse<IStripeSetupIntent>>;
  };

  stripeCustomer: {
    create: (
      params: {
        stripePaymentMethodId: string;
      },
      queryParams?: {
        expand: true;
        include?: ['defaultPaymentMethod'];
      },
    ) => Promise<SdkResponse<IStripeCustomer>>;
    addPaymentMethod: (
      params: {
        stripePaymentMethodId: string;
      },
      queryParams?: {
        expand: true;
        include?: ['defaultPaymentMethod'];
      },
    ) => Promise<SdkResponse<IStripeCustomer>>;
    deletePaymentMethod: (
      params: {},
      queryParams?: {
        expand: true;
        include?: ['defaultPaymentMethod'];
      },
    ) => Promise<SdkResponse<IStripeCustomer>>;
  };

  listings: {
    show: (params: {
      id: UUID;
      include?: ListingRelationships[];
      'fields.image'?: ImageVariantsMap[];
      'fields.listing'?: (keyof Listing['attributes'])[];
      'fields.user'?: (keyof ListingAuthor['attributes'])[];
    }) => Promise<SdkResponse<IListing>>;
    query: (
      params?: Partial<{
        authorId: UUID;
        ids: UUID[] | string[];
        keywords: string;
        origin: Geolocation;
        bounds: LatLngBounds;
        price: string;
        start: Date;
        end: Date;
        seats: number;
        availability: `${'day' | 'time'}-${'full' | 'partial'}`;
        minDuration: number;
        minStock: number;
        sort: string;
        [key: `${'pub_' | 'meta_'}${string}`]: string | number | string[];
        include?: ListingRelationships[];
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof ListingAuthor['attributes'])[];
        [key: `limit.${string}`]: number;
        page?: number;
        perPage?: number;
      }>,
    ) => Promise<SdkResponse<IListing[]>>;
  };

  ownListings: {
    show: (params: {
      id: UUID;
      include?: OwnListingRelationships[];
      'fields.image'?: ImageVariantsMap[];
      'fields.listing'?: (keyof Listing['attributes'])[];
      'fields.user'?: (keyof CurrentUser['attributes'])[];
    }) => Promise<SdkResponse<IOwnListing>>;

    query: (params?: {
      include?: OwnListingRelationships[];
      'fields.image'?: ImageVariantsMap[];
      'fields.listing'?: (keyof Listing['attributes'])[];
      'fields.user'?: (keyof CurrentUser['attributes'])[];
      page?: number;
      perPage?: number;
    }) => Promise<SdkResponse<IOwnListing[]>>;

    create: (
      params: {
        title: string;
        description?: string;
        geolocation?: Geolocation;
        price?: Money;
        availabilityPlan?:
          | {
              type: 'availability-plan/day';
              entries: {
                dayOfWeek:
                  | 'mon'
                  | 'tue'
                  | 'wed'
                  | 'thu'
                  | 'fri'
                  | 'sat'
                  | 'sun';
                seats: number;
              }[];
            }
          | {
              type: 'availability-plan/time';
              timezone: string;
              entries: {
                seats: number;
                startTime: string;
                endTime: string;
              }[];
            };
        privateData?: Record<string, unknown>;
        publicData?: Record<string, unknown>;
        images?: UUID[];
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof ListingAuthor['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    createDraft: (
      params: {
        title: string;
        description?: string;
        geolocation?: Geolocation;
        price?: Money;
        availabilityPlan?:
          | {
              type: 'availability-plan/day';
              entries: {
                dayOfWeek:
                  | 'mon'
                  | 'tue'
                  | 'wed'
                  | 'thu'
                  | 'fri'
                  | 'sat'
                  | 'sun';
                seats: number;
              }[];
            }
          | {
              type: 'availability-plan/time';
              timezone: string;
              entries: {
                seats: number;
                startTime: string;
                endTime: string;
              }[];
            };
        privateData?: Record<string, unknown>;
        publicData?: Record<string, unknown>;
        images?: UUID[];
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    update: (
      params: {
        id: UUID;
      } & Partial<{
        title: string;
        description?: string;
        geolocation?: Geolocation;
        price?: Money;
        availabilityPlan?:
          | {
              type: 'availability-plan/day';
              entries: {
                dayOfWeek:
                  | 'mon'
                  | 'tue'
                  | 'wed'
                  | 'thu'
                  | 'fri'
                  | 'sat'
                  | 'sun';
                seats: number;
              }[];
            }
          | {
              type: 'availability-plan/time';
              timezone: string;
              entries: {
                seats: number;
                startTime: string;
                endTime: string;
              }[];
            };
        privateData?: Record<string, unknown>;
        publicData?: Record<string, unknown>;
        images?: UUID[];
      }>,
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    publishDraft: (
      params: {
        id: UUID;
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    discardDraft: (
      params: {
        id: UUID;
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    close: (
      params: {
        id: UUID;
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    open: (
      params: {
        id: UUID;
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;

    addImage: (
      params: {
        id: UUID;
        listingId: UUID;
      },
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
        'fields.listing'?: (keyof Listing['attributes'])[];
        'fields.user'?: (keyof CurrentUser['attributes'])[];
      },
    ) => Promise<SdkResponse<IOwnListing>>;
  };

  availabilityExceptions: {
    query: (params: {
      listingId: UUID;
      start: Date;
      end: Date;
      page?: number;
      perPage?: number;
      include?: AvailabilityExceptionRelationships[];
      'fields.ownListing'?: (keyof IOwnListing['attributes'])[];
    }) => Promise<SdkResponse<IAvailabilityException[]>>;

    create: (
      params: {
        listingId: UUID;
        start: Date;
        end: Date;
        seats: number;
      },
      queryParams?: {
        expand: boolean;
        include?: AvailabilityExceptionRelationships[];
        'fields.ownListing'?: (keyof IOwnListing['attributes'])[];
      },
    ) => Promise<SdkResponse<IAvailabilityException>>;

    delete: (
      params: {
        id: UUID;
      },
      queryParams?: {
        expand: boolean;
        include?: AvailabilityExceptionRelationships[];
        'fields.ownListing'?: (keyof IOwnListing['attributes'])[];
      },
    ) => Promise<SdkResponse<IAvailabilityException>>;
  };

  images: {
    upload: (
      params: {image: any},
      queryParams?: {
        expand: boolean;
        'fields.image'?: ImageVariantsMap[];
      },
    ) => Promise<SdkResponse<IImage>>;
  };

  bookings: {
    query: (params: {
      listingId: UUID;
      start: Date;
      end: Date;
      page?: number;
      perPage?: number;
      include?: BookingRelationships[];
      'fields.image'?: ImageVariantsMap[];
    }) => Promise<SdkResponse<IBooking[]>>;
  };

  transactions: {
    show: (params: {
      id: UUID;
      include?: TransactionRelationships[];
      'fields.user'?: (keyof IUser['attributes'])[];
      'fields.listing'?: (keyof IListing['attributes'])[];
      'fields.booking'?: (keyof IBooking['attributes'])[];
      'fields.review'?: (keyof IReview['attributes'])[];
      'fields.message'?: (keyof IMessage['attributes'])[];
      'fields.image'?: ImageVariantsMap[];
    }) => Promise<SdkResponse<ITransaction>>;

    query: (params?: {
      only?: 'sale' | 'order';
      lastTransitions: string[];
      page?: number;
      perPage?: number;
      include?: TransactionRelationships[];
      'fields.user'?: (keyof IUser['attributes'])[];
      'fields.listing'?: (keyof IListing['attributes'])[];
      'fields.booking'?: (keyof IBooking['attributes'])[];
      'fields.review'?: (keyof IReview['attributes'])[];
      'fields.message'?: (keyof IMessage['attributes'])[];
    }) => Promise<SdkResponse<ITransaction[]>>;

    initiate: (
      params: {
        processAlias: string;
        transition: string;
        params: Record<string, unknown>;
      },
      queryParams?: {
        expand: boolean;
        include?: TransactionRelationships[];
        'fields.user'?: (keyof IUser['attributes'])[];
        'fields.listing'?: (keyof IListing['attributes'])[];
        'fields.booking'?: (keyof IBooking['attributes'])[];
        'fields.review'?: (keyof IReview['attributes'])[];
        'fields.message'?: (keyof IMessage['attributes'])[];
      },
    ) => Promise<SdkResponse<ITransaction>>;

    initiateSpeculative: (
      params: {
        processAlias: string;
        transition: string;
        params: Record<string, unknown>;
      },
      queryParams?: {
        expand: boolean;
        include?: TransactionRelationships[];
        'fields.user'?: (keyof IUser['attributes'])[];
        'fields.listing'?: (keyof IListing['attributes'])[];
        'fields.booking'?: (keyof IBooking['attributes'])[];
        'fields.review'?: (keyof IReview['attributes'])[];
        'fields.message'?: (keyof IMessage['attributes'])[];
      },
    ) => Promise<SdkResponse<ITransaction>>;

    transition: (
      params: {
        id: UUID;
        transition: string;
        params: Record<string, unknown>;
      },
      queryParams?: {
        expand: boolean;
        include?: TransactionRelationships[];
        'fields.user'?: (keyof IUser['attributes'])[];
        'fields.listing'?: (keyof IListing['attributes'])[];
        'fields.booking'?: (keyof IBooking['attributes'])[];
        'fields.review'?: (keyof IReview['attributes'])[];
        'fields.message'?: (keyof IMessage['attributes'])[];
      },
    ) => Promise<SdkResponse<ITransaction>>;

    transitionSpeculative: (
      params: {
        id: UUID;
        transition: string;
        params: Record<string, unknown>;
      },
      queryParams?: {
        expand: boolean;
        include?: TransactionRelationships[];
        'fields.user'?: (keyof IUser['attributes'])[];
        'fields.listing'?: (keyof IListing['attributes'])[];
        'fields.booking'?: (keyof IBooking['attributes'])[];
        'fields.review'?: (keyof IReview['attributes'])[];
        'fields.message'?: (keyof IMessage['attributes'])[];
      },
    ) => Promise<SdkResponse<ITransaction>>;
  };

  processTransitions: {
    query: (params: {
      transactionId: UUID;
    }) => Promise<SdkResponse<ITransaction>>;
  };

  timeslots: {
    query: (params: {
      listingId: UUID;
      start: Date;
      end: Date;
      page?: number;
      perPage?: number;
    }) => Promise<SdkResponse<ITimeSlot>>;
  };

  stock: {
    compareAndSet: (
      params: {
        listingId: UUID;
        oldTotal: number;
        newTotal: number;
      },
      queryParams?: {
        expand: boolean;
      },
    ) => Promise<SdkResponse<IStock>>;
  };

  stockAdjustments: {
    query: (params: {
      listingId: UUID;
      start: Date;
      end: Date;
      page?: number;
      perPage?: number;
    }) => Promise<SdkResponse<IStockAdjustment[]>>;

    create: (
      params: {
        listingId: UUID;
        quantity: number;
      },
      queryParams?: {
        expand: boolean;
        include?: StockAdjustmentRelationships[];
        'fields.ownListing'?: (keyof IOwnListing['attributes'])[];
        'fields.stockReservation'?: (keyof IStockReservation['attributes'])[];
      },
    ) => Promise<SdkResponse<IStockAdjustment>>;
  };

  reviews: {
    show: (params: {
      id: UUID;
      include?: ReviewRelationships[];
      'fields.user'?: (keyof IUser['attributes'])[];
      'fields.listing'?: (keyof Partial<IListing['attributes']>)[];
    }) => Promise<SdkResponse<IReview>>;

    query: (
      params: Partial<{
        transactionId: UUID;
        listingId: UUID;
        subjectId: UUID;
        type: 'ofCustomer' | 'ofProvider';
        state: string;
        include?: ReviewRelationships[];
        'fields.image'?: ImageVariantsMap[];
        'fields.user'?: (keyof Partial<IUser['attributes']>)[];
        'fields.listing'?: (keyof Partial<IListing['attributes']>)[];
        page?: number;
        perPage?: number;
      }>,
    ) => Promise<SdkResponse<IReview[]>>;
  };

  messages: {
    query: (params: {
      transactionId: UUID;
      page?: number;
      perPage?: number;
      include?: MessageRelationships[];
      'fields.user'?: (keyof IUser['attributes'])[];
      'fields.image'?: ImageVariantsMap[];
    }) => Promise<SdkResponse<IMessage[]>>;
    send: (
      params: {
        transactionId: UUID;
        content: string;
      },
      queryParams?: {
        expand: boolean;
        include?: MessageRelationships[];
        'fields.user'?: (keyof IUser['attributes'])[];
        'fields.image'?: ImageVariantsMap[];
      },
    ) => Promise<SdkResponse<IMessage>>;
  };
}

interface CurrentUserSdk {
  updateProfile: (params: {}, options: {expand: boolean}) => {};
  show: (params: {}) => {};
  create: (params: CreateUserParams) => Promise<void>;
}

export interface CurrentUser {
  id: Id;
  type: string;
  attributes: UserAttribute;
  profileImage: null | string;
  stripeAccount: null | string;
}

interface Id {
  _sdkType: string;
  uuid: string;
}

interface UserAttribute {
  publicData: Record<string, any>; //TODO
  metadata: Record<string, any>; //TODO
  deleted: boolean;
  banned: boolean;
  email: string;
  stripeConnected: boolean;
  stripePayoutsEnabled: boolean;
  createdAt: string;
  stripeChargesEnabled: boolean;
  identityProviders: string[];
  pendingEmail: null | string;
  emailVerified: boolean;
  profile: UserProfile;
  protectedData: protectedData;
}

interface UserProfile {
  displayName: string;
  firstName: string;
  privateData: Record<string, any>; //TODO
  protectedData: protectedData;
  bio: null | string;
  abbreviatedName: string;
  lastName: string;
  publicData: Record<string, any>; //TODO
  metadata: Record<string, any>; //TODO
}

interface CartType {
  [authorId: string]: {
    [listingId: string]: ProductListing | ServiceListing;
  };
}

interface BaseListing {
  quantity: number;
  type: ListingTypes.PRODUCT | ListingTypes.SERVICE;
}

interface ProductListing extends BaseListing {
  type: ListingTypes.PRODUCT;
}

interface ServiceListing extends BaseListing {
  type: ListingTypes.SERVICE;
  bookingStart: number;
  bookingEnd: number;
  staffId: string;
}

interface protectedData {
  cart: CartType;
}
