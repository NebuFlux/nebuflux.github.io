import { inject,} from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Authentication } from '../services/authentication';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  
  const authReq = req.clone({
    withCredentials: true
  });
  return next(authReq);
};
