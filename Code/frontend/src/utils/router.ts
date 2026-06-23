import type { Route } from '../types/index.js';

type RouteHandler = () => HTMLElement | Promise<HTMLElement>;

export class Router {
  private routes: Map<Route, RouteHandler> = new Map();
  private outlet: HTMLElement;
  private currentRoute: Route = '/login';
  private onChangeCallbacks: Array<(route: Route) => void> = [];

  constructor(outlet: HTMLElement) {
    this.outlet = outlet;
    window.addEventListener('popstate', () => this.handleLocationChange());
  }

  register(route: Route, handler: RouteHandler): this {
    this.routes.set(route, handler);
    return this;
  }

  onChange(cb: (route: Route) => void): this {
    this.onChangeCallbacks.push(cb);
    return this;
  }

  async navigate(route: Route, pushState = true): Promise<void> {
    const handler =
      this.routes.get(route as Route) ??
      [...this.routes.entries()].find(([key]) =>
        (route as string).startsWith(key)
      )?.[1];

    if (!handler) {
      console.warn(`[Router] No handler for route: ${route}`);
      return;
    }

    this.currentRoute = route as Route;
    if (pushState) history.pushState({}, '', route);

    const element = await handler();

    this.outlet.innerHTML = '';
    this.outlet.appendChild(element);

    this.onChangeCallbacks.forEach((cb) => cb(route));
  }

  private handleLocationChange(): void {
    const path = window.location.pathname as Route;
    this.navigate(path, false);
  }

  init(): void {
    const path = window.location.pathname as Route;
    const hasMatch =
      this.routes.has(path) ||
      [...this.routes.keys()].some(
        (k) => (path as string).startsWith(k) && k !== '/'
      );
    const route: Route = hasMatch ? path : '/login';
    this.navigate(route, false);
  }

  getCurrent(): Route {
    return this.currentRoute;
  }
}
