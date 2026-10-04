import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from './auth.service';

export type ResourceId = number | string;

export interface KanbanList {
  id: ResourceId;
  title: string;
  position: number;
  ownerId: ResourceId;
  createdAt: string;
}

export class ListService {
  private http = inject(HttpClient);

  getLists(): Observable<KanbanList[]> {
    return this.http.get<KanbanList[]>(`${API_URL}/lists`);
  }

  createList(title: string): Observable<KanbanList> {
    return this.http.post<KanbanList>(`${API_URL}/lists`, {
      title,
    });
  }

  updateList(
    id: ResourceId,
    data: Partial<Pick<KanbanList, 'title' | 'position'>>,
  ): Observable<KanbanList> {
    return this.http.patch<KanbanList>(`${API_URL}/lists/${id}`, data);
  }

  deleteList(id: ResourceId): Observable<void> {
    return this.http.delete<void>(`${API_URL}/lists/${id}`);
  }
}
