import { Component } from '@angular/core';
import { ModalController } from 'ionic-angular';

import { LoadFileProvider } from '../../providers/load-file/load-file';

import { UploadPage } from '../upload/upload';

import { SocialSharing } from '@ionic-native/social-sharing';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  moreImages: boolean = true;
  shareFacebook: boolean = false;
  
  constructor(private modalCtrl: ModalController,
              private loadFileProvider: LoadFileProvider,
              private socialSharing: SocialSharing) {
    this.socialSharing.canShareVia('facebook')
    .then(() => this.shareFacebook = true)
    .catch(() => this.shareFacebook = false);
  }

  showModal() {
    let modal = this.modalCtrl.create(UploadPage);
    modal.present();
  }

  doInfinite(infiniteScroll) {
    console.log('Begin async operation');

    this.loadFileProvider.loadImages()
    .then((moreImages: boolean) => {
      this.moreImages = moreImages;
      infiniteScroll.complete();
    });
  }

  share(post) {
    this.socialSharing.shareViaFacebook(post.title, post.img)
    .then(() => {
      // Se pudo compartir.
      console.log('Se ha compartido la imagen en FB');
    })
    .catch(() => {
      // No se ha compartido.
      console.error('No se ha compartido la imagen en FB');
    });
  }
}
