
var routes = [
  {
    path: '/',
    url: './pages/home.html',
  },
  {
    path: '/opticiens/',
    url: './pages/opticiens.html',
  },
  {
    path: '/profile/',
    url: './pages/profil.html',
  },
  {
    path: '/essayages/',
    url: './pages/essayages.html',
  },
  {
    path: '/favoris/',
    url: './pages/favoris.html',
  },
  {
    path: '/parameters/',
    url: './pages/parametres.html',
  },
  {
    path: '/parameters/:id/',
    componentUrl: './pages/parameters-perso.html',
  },
  {
    path: '/howitworks/',
    url: './pages/howitworks.html',
  },
  {
    path: '/contact/',
    url: './pages/contact.html',
  },
  {
    path: '/cgu/',
    url: './pages/cgu.html',
  },
  {
    path: '/engagements/',
    url: './pages/engagements.html',
  },
  {
    path: '/partner/',
    url: './pages/partner.html',
  },
  {
    path: '/legal/',
    url: './pages/legal.html',
  },
  {
    path: '/independants/',
    url: './pages/independants.html',
  },
  {
    path: '/rdv/',
    url: './pages/rdv.html',
  },
  {
    path: '/clickncollect/',
    url: './pages/clickncollect.html',
  },
  {
    path: '/opticien/:id/',
    componentUrl: './pages/opticien.html',
  },
  {
    path: '/aftersale/',
    componentUrl: './pages/aftersale.html',
  },
  {
    path: '/aftersale/:id/',
    componentUrl: './pages/aftersale.html',
  },
  {
    path: '/form/',
    url: './pages/form.html',
  },
  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    componentUrl: './pages/dynamic-route.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function ({ router, to, resolve }) {
      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = to.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Gilles',
          lastName: 'Bandza',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            props: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  /*{
    path: '(.*)',
    url: './pages/404.html',
  },*/
];
