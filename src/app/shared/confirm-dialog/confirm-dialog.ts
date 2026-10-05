import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../components/button/button.component';
import { ModalComponent } from '../components/modal/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonComponent, MatIconModule, ModalComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  readonly title = input('Confirmation');
  readonly message = input('Voulez-vous continuer ?');
  readonly icon = input<string | undefined>(undefined);

  readonly confirmText = input('Confirmer');
  readonly cancelText = input('Annuler');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
