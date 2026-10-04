import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';

import { API_URL } from './auth.service';
import { ResourceId } from './list.services';

export interface KanbanCard {
  id: ResourceId;
  title: string;
  description?: string;
  position: number;
  listId: ResourceId;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private http = inject(HttpClient);

  /*
  * Retrieves all cards associated with a specific list ID and returns an observable of an array of KanbanCard objects.
  * @param listId - The ID of the list for which to retrieve cards.
  * @returns An observable of an array of KanbanCard objects.
  */
  getCards(listId: ResourceId): Observable<KanbanCard[]> {
    return this.http.get<KanbanCard[]>(`${API_URL}/lists/${listId}/cards`);
  }

  /* Creates a new card in the specified list with the given title and optional description, and returns an observable of the created KanbanCard object.
  * @param listId - The ID of the list in which to create the card.
  * @param title - The title of the new card.
  * @param description - An optional description for the new card.
  * @returns An observable of the created KanbanCard object.
  */
  createCard(listId: ResourceId, title: string, description?: string): Observable<KanbanCard> {
    return this.http.post<KanbanCard>(`${API_URL}/lists/${listId}/cards`, {
      title,
      description,
    });
  }

  /* Retrieves a specific card by its ID and returns an observable of the KanbanCard object.
  * @param id - The ID of the card to retrieve.
  * @returns An observable of the KanbanCard object.
  */
  getCard(id: ResourceId): Observable<KanbanCard> {
    return this.http.get<KanbanCard>(`${API_URL}/cards/${id}`);
  }

  /* Updates a specific card with the given ID and data, and returns an observable of the updated KanbanCard object.
  * @param id - The ID of the card to update.
  * @param data - An object containing the properties to update (title, description, position, and/or listId).
  * @returns An observable of the updated KanbanCard object.
  */
  updateCard(
    id: ResourceId,
    data: Partial<Pick<KanbanCard, 'title' | 'description' | 'position' | 'listId'>>,
  ): Observable<KanbanCard> {
    return this.http.patch<KanbanCard>(`${API_URL}/cards/${id}`, data);
  }

  /* Deletes a specific card by its ID and returns an observable of void.
  * @param id - The ID of the card to delete.
  * @returns An observable of void.
  */
  deleteCard(id: ResourceId): Observable<void> {
    return this.http.delete<void>(`${API_URL}/cards/${id}`);
  }
}
