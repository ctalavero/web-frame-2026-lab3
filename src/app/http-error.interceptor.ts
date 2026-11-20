import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  console.info(`[API] ${request.method} ${request.url}`);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.warn(`[API] ${request.method} ${request.url}`, error.status);

      if (error.status === 404) {
        return throwError(() => new Error('Товар не знайдено.'));
      }
      if (error.status === 0 || error.status === 502 || error.status === 504) {
        return throwError(() => new Error('Сервер каталогу недоступний. Спробуйте ще раз.'));
      }
      return throwError(() => new Error('Не вдалося виконати запит. Спробуйте ще раз.'));
    }),
  );
};
