import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

class Router extends EmberRouter {
	location = config.locationType;
	rootURL = config.rootURL;
}

Router.map(() => {});
