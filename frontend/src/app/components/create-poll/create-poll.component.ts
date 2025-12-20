import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface PollOptionForm {
  id: string;
  text: string;
}

@Component({
  selector: 'app-create-poll',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './create-poll.component.html',
})
export class CreatePollComponent {
  private router = inject(Router);

  title = signal('');
  question = signal('');
  options = signal<PollOptionForm[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  expiresAt = signal<string>('');

  isSubmitting = signal(false);

  addOption(): void {
    const current = this.options();
    if (current.length >= 6) return;
    const nextId = (current.length + 1).toString();
    this.options.set([...current, { id: nextId, text: '' }]);
  }

  removeOption(id: string): void {
    const current = this.options();
    if (current.length <= 2) return;
    this.options.set(current.filter(o => o.id !== id));
  }

  updateOptionText(id: string, value: string): void {
    this.options.update(opts =>
      opts.map(o => (o.id === id ? { ...o, text: value } : o)),
    );
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }

  submit(): void {
    if (!this.title().trim() || !this.question().trim()) {
      return;
    }

    const filledOptions = this.options()
      .map(o => ({ ...o, text: o.text.trim() }))
      .filter(o => o.text.length > 0);

    if (filledOptions.length < 2) {
      return;
    }

    this.isSubmitting.set(true);

    console.log('Create poll payload:', {
      title: this.title(),
      question: this.question(),
      options: filledOptions,
      expiresAt: this.expiresAt() ? new Date(this.expiresAt()) : null,
    });

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.router.navigate(['/dashboard']);
    }, 800);
  }
}
