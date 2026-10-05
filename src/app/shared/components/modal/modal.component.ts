import {
  ElementRef,
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modal',
  imports: [MatIconModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('Dialog');
  readonly closed = output<void>();

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogRef');

  constructor() {
    effect(() => {
      const dialog = this.dialogRef()?.nativeElement;
      if (!dialog) return;

      if (this.open() && !dialog.open) {
        dialog.showModal();
      } else if (!this.open() && dialog.open) {
        dialog.close();
      }
    });
  }

  requestClose(): void {
    this.closed.emit();
  }

  onCancel(event: Event): void {
    event.preventDefault();
    this.requestClose();
  }

  onDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.requestClose();
    }
  }
}
