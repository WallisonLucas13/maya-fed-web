import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerControlService {
  drawerOpened = new BehaviorSubject<boolean>(true);
  drawerMode = new BehaviorSubject<MatDrawerMode>('side');

  constructor() { }

  showDrawer(){
    this.drawerMode.next("side");
    this.drawerOpened.next(true);
  }

  hideDrawer(){
    this.drawerMode.next("over");
    this.drawerOpened.next(false);
  }

  getDrawerMode(){
    return this.drawerMode.asObservable();
  }

  getDrawerOpened(){
    return this.drawerOpened.asObservable();
  }
}
