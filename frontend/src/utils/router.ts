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
    if (!this.routes.has(route)) {
      console.warn(`[Router] No handler for route: ${route}`);
      return;
    }

    this.currentRoute = route;
    if (pushState) history.pushState({}, '', route);

    const handler = this.routes.get(route)!;
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
    const route: Route = this.routes.has(path) ? path : '/login';
    this.navigate(route, false);
  }

  getCurrent(): Route {
    return this.currentRoute;
  }
}
