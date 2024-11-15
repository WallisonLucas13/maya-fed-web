import { Injectable } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DrawerControlService {
  drawerOpened = new BehaviorSubject<boolean>(false);
  drawerMode = new BehaviorSubject<MatDrawerMode>('side');
  showMenuIcon = new BehaviorSubject<boolean>(true);
  isAndroid = new BehaviorSubject<boolean>(true);

  constructor() { }

  showDrawer(){
    this.drawerMode.next("side");
    this.drawerOpened.next(true);
  }

  hideDrawer(){
    this.drawerMode.next("over");
    this.drawerOpened.next(false);
    this.showMenuIcon.next(true);
  }

  hideMenuIcon(){
    this.showMenuIcon.next(false);
  }

  toggleDrawer(){
    this.drawerOpened.next(!this.drawerOpened.getValue());
  }

  setIsAndroid(isAndroid: boolean){
    this.isAndroid.next(isAndroid);
  };

}
