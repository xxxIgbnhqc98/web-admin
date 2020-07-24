import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ShareDataService {
  avatar = new BehaviorSubject<any>(undefined);
  castAvatar = this.avatar.asObservable();
  constructor() { }

  setAvatarForEmployee(avatar: any) {
    this.avatar.next(avatar);
  }
}
