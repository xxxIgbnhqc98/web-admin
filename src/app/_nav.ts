export const navItems = [
  {
    name: 'Users',
    url: '/users',
    icon: 'fa fa-user',
    children: [
      {
        name: 'User list',
        url: '/users/user-list'
      }
    ]
  },
  {
    name: 'Partner manager & Admin',
    url: '/partner-manager',
    icon: 'fa fa-lock'
  },
  {
    name: 'Push notification',
    icon: 'fa fa-bell',
    url: '/notification',
    children: [
      {
        name: 'Send Notification',
        url: '/notification/settings',
        icon: 'fa fa-cogs'
      },
      {
        name: 'Notification list',
        url: '/notification/sent',
        icon: 'fa fa-paper-plane'
      }
    ]
  }
];
