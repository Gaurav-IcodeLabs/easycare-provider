import {profileMenuIcons} from '../../assets';

export interface ProfileOption {
  id: string;
  title: string;
  url?: string;
  actionType?: 'navigation' | 'action' | 'link';
  icon: any;
}

export const getProfileOptions = (): ProfileOption[] => [
  {
    id: 'addProduct',
    title: 'Profile.addProduct',
    icon: profileMenuIcons.request_product,
    actionType: 'navigation',
  },
  {
    id: 'addService',
    title: 'Profile.addService',
    icon: profileMenuIcons.request_service,
    actionType: 'navigation',
  },
  {
    id: 'myRequests',
    title: 'Profile.myRequests',
    icon: profileMenuIcons.my_requests,
    actionType: 'navigation',
  },
  // {
  //   id: 'protection',
  //   title: 'Profile.yourProtection',
  //   icon: profileMenuIcons.wallet,
  //   actionType: 'navigation',
  // },
  // {
  //   id: 'offers',
  //   title: 'Profile.latestOffers',
  //   icon: profileMenuIcons.discount,
  //   actionType: 'navigation',
  // },
  // {
  //   id: 'rewards',
  //   title: 'Profile.rewardsPoints',
  //   actionType: 'navigation',
  //   icon: profileMenuIcons.rewards,
  // },
  // {
  //   id: 'chat',
  //   title: 'Profile.chat',
  //   icon: profileMenuIcons.chat,
  //   actionType: 'navigation',
  // },
  // {
  //   id: 'notification',
  //   title: 'Profile.notification',
  //   icon: profileMenuIcons.notification,
  //   actionType: 'navigation',
  // },
  // {
  //   id: 'setting',
  //   title: 'Profile.setting',
  //   icon: profileMenuIcons.settings,
  //   actionType: 'navigation',
  // },
  {
    id: 'about',
    title: 'Profile.aboutApp',
    icon: profileMenuIcons.about,
    url: 'https://google.com',

    actionType: 'link',
  },
  {
    id: 'report',
    title: 'Profile.reportProblem',
    icon: profileMenuIcons.report,
    url: 'https://google.com',

    actionType: 'link',
  },
  {
    id: 'contact',
    title: 'Profile.contactUs',
    actionType: 'link',
    url: 'https://google.com',
    icon: profileMenuIcons.contact,
  },
  {
    id: 'logout',
    title: 'Profile.logout',
    icon: profileMenuIcons.logout,
    actionType: 'action',
  },
];
