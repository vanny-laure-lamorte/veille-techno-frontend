import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CardService, KanbanCard } from '../../core/card.service';
import { KanbanList, ListService, ResourceId } from '../../core/list.services';

interface BoardColumn extends KanbanList {
  cards: KanbanCard[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CdkDrag, CdkDropList, CdkDropListGroup, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly listService = inject(ListService);
  private readonly cardService = inject(CardService);

  readonly searchQuery = signal('');
  readonly columns = signal<BoardColumn[]>([]);
  readonly loading = signal(true);
  readonly boardError = signal('');
  readonly mutationError = signal('');
  readonly showListForm = signal(false);
  readonly showIssueForm = signal(false);
  readonly currentUserName = signal('Mon compte');

  readonly totalCards = computed(() =>
    this.columns().reduce((total, column) => total + column.cards.length, 0),
  );

  readonly userInitials = computed(
    () =>
      this.currentUserName()
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toLocaleUpperCase() || 'U',
  );

  readonly visibleColumns = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase();
    if (!query) return this.columns();

    return this.columns().map((column) => ({
      ...column,
      cards: column.cards.filter((card) =>
        [String(card.id), card.title, card.description ?? ''].some((value) =>
          value.toLocaleLowerCase().includes(query),
        ),
      ),
    }));
  });

  ngOnInit(): void {
    this.loadBoard();
    this.authService.getCurrentUser().subscribe({
      next: (user) => this.currentUserName.set(user.name || user.email),
      error: () => this.currentUserName.set('Mon compte'),
    });
  }

  private loadBoard(): void {
    this.loading.set(true);
    this.boardError.set('');

    this.listService
      .getLists()
      .pipe(
        switchMap((lists) => {
          const orderedLists = [...lists].sort((left, right) => left.position - right.position);
          if (orderedLists.length === 0) return of([] as BoardColumn[]);

          return forkJoin(
            orderedLists.map((list) =>
              this.cardService.getCards(list.id).pipe(
                map((cards) => ({
                  ...list,
                  cards: [...cards].sort((left, right) => left.position - right.position),
                })),
              ),
            ),
          );
        }),
      )
      .subscribe({
        next: (columns) => {
          this.columns.set(columns);
          this.loading.set(false);
        },
        error: () => {
          this.boardError.set('Unable to load the board. Check your connection to the server.');
          this.loading.set(false);
        },
      });
  }

  updateSearch(value: string): void {
    this.searchQuery.set(value);
  }

  dropCard(event: CdkDragDrop<KanbanCard[]>, targetListId: ResourceId): void {
    const nextColumns = this.columns().map((column) => ({
      ...column,
      cards: [...column.cards],
    }));
    const sourceId = event.previousContainer.id.slice('list-'.length);
    const source = nextColumns.find((column) => String(column.id) === sourceId);
    const target = nextColumns.find((column) => String(column.id) === String(targetListId));

    if (!source || !target) return;

    if (source.id === target.id) {
      moveItemInArray(source.cards, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(source.cards, target.cards, event.previousIndex, event.currentIndex);
    }

    this.columns.set(nextColumns);
    const changedColumns = source.id === target.id ? [target] : [source, target];
    forkJoin(
      changedColumns.flatMap((column) =>
        column.cards.map((card, position) =>
          this.cardService.updateCard(card.id, { listId: column.id, position }),
        ),
      ),
    ).subscribe({
      error: () => {
        this.mutationError.set('The move could not be saved.');
        this.loadBoard();
      },
    });
  }

  toggleListForm(): void {
    this.showListForm.update((isOpen) => !isOpen);
    this.showIssueForm.set(false);
    this.mutationError.set('');
  }

  toggleIssueForm(): void {
    if (this.columns().length === 0) {
      this.mutationError.set('Create a list before adding a ticket.');
      return;
    }
    this.showIssueForm.update((isOpen) => !isOpen);
    this.showListForm.set(false);
    this.mutationError.set('');
  }

  createList(event: Event, title: string, input: HTMLInputElement): void {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    this.listService.createList(cleanTitle).subscribe({
      next: () => {
        input.value = '';
        this.showListForm.set(false);
        this.mutationError.set('');
        this.loadBoard();
      },
      error: () => this.mutationError.set('The list could not be created.'),
    });
  }

  createCard(
    event: Event,
    title: string,
    description: string,
    listId: string,
    titleInput: HTMLInputElement,
    descriptionInput: HTMLTextAreaElement,
  ): void {
    event.preventDefault();
    const targetList = this.columns().find((column) => String(column.id) === listId);
    const cleanTitle = title.trim();
    if (!targetList || !cleanTitle) return;

    this.cardService
      .createCard(targetList.id, cleanTitle, description.trim() || undefined)
      .subscribe({
        next: () => {
          titleInput.value = '';
          descriptionInput.value = '';
          this.showIssueForm.set(false);
          this.mutationError.set('');
          this.loadBoard();
        },
        error: () => this.mutationError.set('The ticket could not be created.'),
      });
  }

  deleteList(column: BoardColumn): void {
    if (!window.confirm(`Delete the list "${column.title}"?`)) return;

    this.listService.deleteList(column.id).subscribe({
      next: () => this.loadBoard(),
      error: () => this.mutationError.set('The list could not be deleted.'),
    });
  }

  deleteCard(card: KanbanCard): void {
    if (!window.confirm(`Delete the ticket "${card.title}"?`)) return;

    this.cardService.deleteCard(card.id).subscribe({
      next: () => this.loadBoard(),
      error: () => this.mutationError.set('The ticket could not be deleted.'),
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
