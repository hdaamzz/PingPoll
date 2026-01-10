import { Injectable, signal } from '@angular/core';
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  public toasts$ = this._toasts.asReadonly();

  show(message: string, type: Toast['type'] = 'info', duration: number = 3000): void {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = { id, type, message, duration };

    this._toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: string): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
