import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  constructor(private readonly http: HttpClient) {}

  getCards(listId: ResourceId): Observable<KanbanCard[]> {
    return this.http.get<KanbanCard[]>(`${API_URL}/lists/${listId}/cards`);
  }

  createCard(listId: ResourceId, title: string, description?: string): Observable<KanbanCard> {
    return this.http.post<KanbanCard>(`${API_URL}/lists/${listId}/cards`, {
      title,
      description,
    });
  }

  getCard(id: ResourceId): Observable<KanbanCard> {
    return this.http.get<KanbanCard>(`${API_URL}/cards/${id}`);
  }

  updateCard(
    id: ResourceId,
    data: Partial<Pick<KanbanCard, 'title' | 'description' | 'position' | 'listId'>>,
  ): Observable<KanbanCard> {
    return this.http.patch<KanbanCard>(`${API_URL}/cards/${id}`, data);
  }

  deleteCard(id: ResourceId): Observable<void> {
    return this.http.delete<void>(`${API_URL}/cards/${id}`);
  }
}
