import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type CardVariant = 'surface' | 'auth' | 'ticket';

@Component({
  selector: 'app-card',
  template: '<ng-content />',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-card--auth]': "variant() === 'auth'",
    '[class.app-card--ticket]': "variant() === 'ticket'",
  },
})
export class CardComponent {
  readonly variant = input<CardVariant>('surface');
}
