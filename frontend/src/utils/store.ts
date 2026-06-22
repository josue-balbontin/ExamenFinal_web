import type { Listener } from '../types/index.js';

export class Store<T extends object> {
  private state: T;
  private listeners: Map<keyof T | '__all__', Set<Listener<T>>> = new Map();

  constructor(initialState: T) {
    this.state = { ...initialState };
  }

  getState(): Readonly<T> {
    return Object.freeze({ ...this.state });
  }

  setState(partial: Partial<T>): void {
    const prev = { ...this.state };
    this.state = { ...this.state, ...partial };

    // Notify key-specific listeners
    (Object.keys(partial) as Array<keyof T>).forEach((key) => {
      if (prev[key] !== this.state[key]) {
        this.listeners.get(key)?.forEach((fn) => fn(this.getState()));
      }
    });

    // Notify global listeners
    this.listeners.get('__all__')?.forEach((fn) => fn(this.getState()));
  }

  subscribe(listener: Listener<T>): () => void;
  subscribe(key: keyof T, listener: Listener<T>): () => void;
  subscribe(
    keyOrListener: keyof T | Listener<T>,
    listener?: Listener<T>
  ): () => void {
    const key: keyof T | '__all__' =
      typeof keyOrListener === 'function' ? '__all__' : keyOrListener;
    const fn: Listener<T> =
      typeof keyOrListener === 'function' ? keyOrListener : listener!;

    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(fn);

    return () => this.listeners.get(key)?.delete(fn);
  }
}
