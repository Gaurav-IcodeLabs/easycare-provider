import {ImageVariantsMap} from './common';

export type ImageVariants =
  | 'default'
  | 'landscape-crop'
  | 'landscape-crop2x'
  | 'landscape-crop4x'
  | 'landscape-crop6x'
  | 'scaled-small'
  | 'scaled-medium'
  | 'scaled-large'
  | 'scaled800'
  | 'scaled-xlarge'
  | 'square-small'
  | 'square-small2x'
  | 'facebook'
  | 'twitter'
  | 'square1200'
  | 'landscape1200'
  | 'portrait1200'
  | 'original1200';

export type Colors =
  | 'marketplaceColor'
  | 'marketplaceColorLight'
  | 'marketplaceColorDark'
  | 'colorPrimaryButton'
  | 'colorPrimaryButtonLight'
  | 'colorPrimaryButtonDark'
  | 'deepBlue'
  | 'blue'
  | 'moonStoneBlue'
  | 'textBlack'
  | 'appleGreen'
  | 'white'
  | 'milkWhite'
  | 'black'
  | 'lightblack'
  | 'neutralDark'
  | 'red'
  | 'lightGrey'
  | 'grey'
  | 'placeholder'
  | 'transparent'
  | 'focusBlue';

export type CategoryLevels =
  | 'categoryLevel1'
  | 'categoryLevel2'
  | 'categoryLevel3'
  | 'categoryLevel4';

export type Transitions =
  // Common transitions
  | 'transition/request-payment'
  | 'transition/inquire'
  | 'transition/request-payment-after-inquiry'
  | 'transition/confirm-payment'
  | 'transition/expire-payment'
  | 'transition/accept'
  | 'transition/decline'
  | 'transition/operator-accept'
  | 'transition/operator-decline'
  | 'transition/expire'
  | 'transition/cancel'
  | 'transition/complete'
  | 'transition/operator-complete'
  | 'transition/review-1-by-provider'
  | 'transition/review-2-by-provider'
  | 'transition/review-1-by-customer'
  | 'transition/review-2-by-customer'
  | 'transition/expire-customer-review-period'
  | 'transition/expire-provider-review-period'
  | 'transition/expire-review-period'
  // Purchase process specific
  | 'transition/mark-delivered'
  | 'transition/operator-mark-delivered'
  | 'transition/mark-received-from-purchased'
  | 'transition/mark-received'
  | 'transition/auto-mark-received'
  | 'transition/dispute'
  | 'transition/operator-dispute'
  | 'transition/auto-cancel-from-disputed'
  | 'transition/cancel-from-disputed'
  | 'transition/mark-received-from-disputed'
  | 'transition/auto-complete'
  | 'transition/auto-cancel'
  // Inquiry process specific
  | 'transition/inquire-without-payment'
  // Negotiation process specific
  | 'transition/make-offer'
  | 'transition/make-offer-after-inquiry'
  | 'transition/request-quote'
  | 'transition/make-offer-from-request'
  | 'transition/reject-request'
  | 'transition/withdraw-request'
  | 'transition/operator-reject-request'
  | 'transition/operator-reject-offer'
  | 'transition/customer-reject-offer'
  | 'transition/provider-withdraw-offer'
  | 'transition/update-offer'
  | 'transition/accept-offer'
  | 'transition/operator-accept-offer'
  | 'transition/update-from-update-pending'
  | 'transition/customer-reject-from-update-pending'
  | 'transition/provider-withdraw-from-update-pending'
  | 'transition/customer-make-counter-offer'
  | 'transition/provider-make-counter-offer'
  | 'transition/provider-accept-counter-offer'
  | 'transition/customer-withdraw-counter-offer'
  | 'transition/operator-reject-from-customer-counter-offer'
  | 'transition/provider-reject-counter-offer'
  | 'transition/request-payment-to-accept-offer'
  | 'transition/operator-cancel'
  | 'transition/deliver'
  | 'transition/operator-mark-delivered'
  | 'transition/request-changes'
  | 'transition/operator-request-changes'
  | 'transition/deliver-changes'
  | 'transition/operator-mark-changes-delivered'
  | 'transition/operator-cancel-from-delivered'
  | 'transition/auto-cancel-from-changes-requested'
  | 'transition/operator-cancel-from-changes-requested'
  | 'transition/accept-deliverable'
  | 'transition/auto-accept-deliverable'
  | 'transition/operator-accept-deliverable';

export type EntityType =
  | 'user'
  | 'listing'
  | 'image'
  | 'marketplace'
  | 'stripeAccount'
  | 'stripePaymentMethod'
  | 'stripeCustomer'
  | 'currentUser'
  | 'stripeAccountLink'
  | 'stripePerson'
  | 'stripeSetupIntent'
  | 'stock'
  | 'ownListing'
  | 'availabilityException'
  | 'booking'
  | 'stockReservation'
  | 'review'
  | 'message'
  | 'transaction'
  | 'processTransition'
  | 'timeSlot'
  | 'stockAdjustment'
  | unknown;

export type CurrentUserRelationships =
  | 'marketplace'
  | 'profileImage'
  | 'stripeAccount'
  | 'stripeCustomer'
  | 'stripeCustomer.defaultPaymentMethod';

export type alias = 'latest';

export type CurrentUserQueryParams = {
  expand?: boolean;
  include?: CurrentUserRelationships[];
  'fields.image'?: ImageVariantsMap[];
};

export type MessageRelationships =
  | 'sender'
  | 'sender.profileImage'
  | 'transaction';

export type ReviewRelationships =
  | 'author'
  | 'author.profileImage'
  | 'listing'
  | 'subject'
  | 'subject.profileImage';

export type TransactionRelationships =
  | 'marketplace'
  | 'listing'
  | 'listing.images'
  | 'listing.currentStock'
  | 'provider'
  | 'provider.profileImage'
  | 'customer'
  | 'customer.profileImage'
  | 'booking'
  | 'stockReservation'
  | 'reviews'
  | 'reviews.author'
  | 'reviews.author.profileImage'
  | 'reviews.subject'
  | 'reviews.subject.profileImage'
  | 'messages'
  | 'messages.sender'
  | 'messages.sender.profileImage';

export type ListingRelationships =
  | 'marketplace'
  | 'author'
  | 'author.profileImage'
  | 'images'
  | 'currentStock';

export type StockAdjustmentRelationships =
  | 'ownListing'
  | 'ownListing.currentStock'
  | 'stockReservation'
  | 'stockReservation.transaction'
  | 'stockReservation.transaction.customer'
  | 'stockReservation.transaction.customer.profileImage';

export type RequestedCapabilities =
  | 'card_payments'
  | 'transfers'
  | 'legacy_payments';
