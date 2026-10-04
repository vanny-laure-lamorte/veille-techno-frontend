import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root',
})
export class ListService {
  private readonly http = inject(HttpClient);

  getLists(): Observable<KanbanList[]> {
    return this.http.get<KanbanList[]>(`${API_URL}/lists`);
  }

  /* Creates a new list with the given title and returns an observable of the created KanbanList object.
  * @param title - The title of the new list.
  * @returns An observable of the created KanbanList object.
  */
  createList(title: string): Observable<KanbanList> {
    return this.http.post<KanbanList>(`${API_URL}/lists`, {
      title,
    });
  }

  /* Retrieves a specific list by its ID and returns an observable of the KanbanList object.
  * @param id - The ID of the list to retrieve.
  * @returns An observable of the KanbanList object.
  */
  getList(id: ResourceId): Observable<KanbanList> {
    return this.http.get<KanbanList>(`${API_URL}/lists/${id}`);
  }

  /* Updates a specific list with the given ID and data, and returns an observable of the updated KanbanList object.
  * @param id - The ID of the list to update.
  * @param data - An object containing the properties to update (title and/or position).
  * @returns An observable of the updated KanbanList object.
  */
  updateList(
    id: ResourceId,
    data: Partial<Pick<KanbanList, 'title' | 'position'>>,
  ): Observable<KanbanList> {
    return this.http.patch<KanbanList>(`${API_URL}/lists/${id}`, data);
  }

  /* Deletes a specific list by its ID and returns an observable of void.
  * @param id - The ID of the list to delete.
  * @returns An observable of void.
  */
  deleteList(id: ResourceId): Observable<void> {
    return this.http.delete<void>(`${API_URL}/lists/${id}`);
  }
}
