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
import { BoardCardComponent } from './board-card.component';
import { MatInputModule } from '@angular/material/input';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog';

interface BoardColumn extends KanbanList {
  cards: KanbanCard[];
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    BoardCardComponent,
    CdkDrag,
    CdkDropList,
    CdkDropListGroup,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    ConfirmDialogComponent,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
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
  readonly currentUserName = signal('My account');
  readonly currentUserEmail = signal('My email');
  readonly currentUserRole = signal('My role');
  readonly userCreatedAt = signal('Joined');
  readonly listToDelete = signal<BoardColumn | null>(null);
  readonly cardToDelete = signal<KanbanCard | null>(null);
  readonly editingCard = signal<KanbanCard | null>(null);
  readonly editingColumnId = signal<ResourceId | null>(null);

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

  readonly userRole = computed(() => this.currentUserRole().trim().split(/\s+/));

  readonly userEmail = computed(() => this.currentUserEmail().trim().split(/\s+/));

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
      next: (user) => {
        this.currentUserName.set(user.name);
        this.currentUserEmail.set(user.email);
        this.currentUserRole.set(user.role);
        this.userCreatedAt.set(new Date(user.createdAt).toLocaleDateString());
      },
      error: () => {
        this.currentUserName.set('My account');
        this.currentUserRole.set('My role');
      },
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

  submitCardForm(
    event: Event,
    title: string,
    description: string,
    listId: string,
    titleInput: HTMLInputElement,
    descriptionInput: HTMLTextAreaElement,
  ): void {
    event.preventDefault();

    const editingCard = this.editingCard();

    if (editingCard) {
      this.cardService
        .updateCard(editingCard.id, {
          title: title.trim(),
          description: description.trim(),
          listId,
        })
        .subscribe({
          next: () => {
            this.editingCard.set(null);
            this.showIssueForm.set(false);
            this.mutationError.set('');
            this.loadBoard();
          },
          error: () => {
            this.mutationError.set('The ticket could not be updated.');
          },
        });

      return;
    }

    this.createCard(event, title, description, listId, titleInput, descriptionInput);
  }

  startEdit(column: BoardColumn): void {
    this.editingColumnId.set(column.id);
    this.mutationError.set('');
  }

  cancelEdit(): void {
    this.editingColumnId.set(null);
    this.mutationError.set('');
  }

  startEditCard(card: KanbanCard): void {
    this.editingCard.set(card);
    this.showIssueForm.set(true);
  }

  cancelEditCard(): void {
    this.editingCard.set(null);
    this.showIssueForm.set(false);
  }

  /*
   * Updates the title of a specific list (column) with the given new title.
   * @param column - The BoardColumn object representing the list to update.
   * @param newTitle - The new title for the list.
   */
  updateListTitle(column: BoardColumn, newTitle: string): void {
    const title = newTitle.trim();

    // check if the new title is empty
    if (!title) {
      this.mutationError.set('The list title cannot be empty.');
      return;
    }

    // Check if the new title already exists in another column
    const titleAlreadyExists = this.columns().some(
      (currentColumn) =>
        currentColumn.id !== column.id &&
        currentColumn.title.trim().toLocaleLowerCase() === title.toLocaleLowerCase(),
    );
    if (titleAlreadyExists) {
      this.mutationError.set('A list with this name already exists.');
      return;
    }

    // If the title is valid and unique, proceed to update the list
    this.listService.updateList(column.id, { title }).subscribe({
      next: () => {
        this.editingColumnId.set(null);
        this.loadBoard();
      },
      error: () => this.mutationError.set('The list title could not be updated.'),
    });
  }

  deleteList(column: BoardColumn): void {
    if (!window.confirm(`Delete the list "${column.title}"?`)) return;

    this.listService.deleteList(column.id).subscribe({
      next: () => this.loadBoard(),
      error: () => this.mutationError.set('The list could not be deleted.'),
    });
  }

  askDeleteList(column: BoardColumn): void {
    this.listToDelete.set(column);
  }

  cancelDeleteList(): void {
    this.listToDelete.set(null);
  }

  confirmDeleteList(): void {
    const column = this.listToDelete();

    if (!column) {
      return;
    }

    this.listService.deleteList(column.id).subscribe({
      next: () => {
        this.listToDelete.set(null);
        this.loadBoard();
      },
      error: () => {
        this.listToDelete.set(null);
        this.mutationError.set('The list could not be deleted.');
      },
    });
  }

  askDeleteCard(card: KanbanCard): void {
    this.cardToDelete.set(card);
  }

  cancelDeleteCard(): void {
    this.cardToDelete.set(null);
  }

  confirmDeleteCard(): void {
    const card = this.cardToDelete();

    if (!card) {
      return;
    }

    this.cardService.deleteCard(card.id).subscribe({
      next: () => {
        this.cardToDelete.set(null);
        this.loadBoard();
      },
      error: () => {
        this.cardToDelete.set(null);
        this.mutationError.set('The ticket could not be deleted.');
      },
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
