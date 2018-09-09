import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { Observable } from 'rxjs';

import { UploadPage } from '../upload/upload';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  posts: Observable<any[]>;

  constructor(private modalCtrl: ModalController,
              private afDB: AngularFireDatabase) {
    this.posts = afDB.list('post').valueChanges();
  }

  showModal() {
    let modal = this.modalCtrl.create(UploadPage);
    modal.present();
  }
}
