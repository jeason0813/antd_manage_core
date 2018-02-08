import _ from 'lodash';
import Pattern from '../router/pattern';
import injectable from '../decorators/injectable';
import propertyInject from '../decorators/property-inject';
import Permission from './permission';
const { formatPattern, matchPattern } = Pattern;

@injectable()
export default class Navigation {

  @propertyInject('auth') authService;

  navigationConfig = {};

  setNavigationConfig(navigationConfig) {
    this.navigationConfig = navigationConfig;
    return this;
  }

  getConfigs() {
    const permissionService = new Permission();
    return new Promise((resolve) => {
      permissionService.getConfigPermission(this.navigationConfig).then((filterConfigs) => {
        resolve(filterConfigs);
      });
    });
  }

  getDefault() {
    return this.getConfigs()
      .then((configs) => _.first(_.takeWhile(configs, (config) => config.default)));
  }

  getPaths(value) {
    return this
      .getConfigAndParent('path', value)
      .then((configs) => _.map(configs, (config) => config.path));
  }

  getConfigAndParent(key, value) {
    return this.getConfigs().then((configs) => this.getPathConfigs(configs, key, value));
  }

  getConfig(key, value) {
    return this.getConfigAndParent(key, value).then((configs) => _.last(configs));
  }

  getPathConfigs(configs, key, value) {
    let matchConfig = [];

    _.each(configs, (config) => {
      if (value && this.matchPattern(config[key], value)) {
        matchConfig.push(config);
      } else if (config.child) {
        matchConfig = _.concat(matchConfig, this.getPathConfigs(config.child, key, value));
        if (matchConfig.length) {
          matchConfig.unshift(config);
        }
      }
      return !matchConfig.length;
    });

    return matchConfig;
  }

  getBreadcrumbs(path) {
    return this.getConfigAndParent('path', path);
  }

  getChildRouteConfigs() {
    return this.getConfigs()
      .then((configs) => this.flattenConfigs(configs).filter((config) => config.component));
  }

  calcCurrentPath(paths, path) {
    return this
      .getConfig('path', paths[paths.length - 2])
      .then((config) => {
        if (config && this.needIgnoreChild(config)) {
          return config.path;
        }
        return path;
      });
  }

  flattenConfigs(configs) {
    let flatteningConfigs = [];

    _.each(configs, (config) => {
      flatteningConfigs.push(config);

      if (config.child) {
        flatteningConfigs = _.concat(flatteningConfigs, this.flattenConfigs(config.child));
      }
    });

    return flatteningConfigs;
  }

  matchPattern(pattern, path) {
    const matched = matchPattern(pattern, path);
    if (matched && matched.remainingPathname === '') {
      return true;
    }
    return false;
  }

  needIgnoreChild(config) {
    return config.ignoreChild === true;
  }

  getChildRoutesAndIndexRoute() {
    return this.getChildRouteConfigs()
      .then((configs) => {
        const routesConfig = {
          routes: []
        };
        _.each(configs, (config) => {
          const routeConfig = {
            ...config,
            exact: config.exact || config.ignoreChild,
            path: formatPattern(config.path)
          };
          routesConfig.routes.push(routeConfig);
        });

        return routesConfig;
      });
  }
}

