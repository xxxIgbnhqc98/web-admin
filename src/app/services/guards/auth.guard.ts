import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import * as Console from 'console-prefix';
@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    public auth: AuthService,
    public router: Router
  ) {
    //this.log('On Auth Guard');
  }

  get log() { return Console(`[Auth Guard]`).log; }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      this.log('state', state);
    return this.auth.authenticated.then( state => {
      this.log('auth state', state );
      if (state === false) {
        this.router.navigate(['login']);
      }
      return state;
    });
  }
}
