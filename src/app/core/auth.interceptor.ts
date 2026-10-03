import { HttpInterceptorFn } from '@angular/common/http';
import { ACCESS_TOKEN_STORAGE_KEY, API_URL } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (!accessToken || !request.url.startsWith(`${API_URL}/`)) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken}` },
    }),
  );
};