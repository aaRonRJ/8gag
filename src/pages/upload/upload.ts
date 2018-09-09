import { Component } from '@angular/core';

import { ViewController } from 'ionic-angular';

import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker, ImagePickerOptions } from '@ionic-native/image-picker';

import { LoadFileProvider } from '../../providers/load-file/load-file';

@Component({
  selector: 'page-upload',
  templateUrl: 'upload.html',
})
export class UploadPage {
  title: string = '';
  imagePreview: string = '';
  image64: string;
  
  constructor(private viewCtrl: ViewController,
              private camera: Camera,
              private imagePicker: ImagePicker,
              public loadFileProvider: LoadFileProvider) {}

  closeModal() {
    this.viewCtrl.dismiss();
  }

  openCamera() {
    const options: CameraOptions = {
      quality: 50,
      destinationType: 0,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }
    
    this.camera.getPicture(options).then(
      (imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      this.imagePreview = 'data:image/jpeg;base64,' + imageData;
      this.image64 = imageData;
      },
      (err) => {
        console.log('ERROR EN CÁMARA', JSON.stringify(err));
      }
    );
  }

  selectPhoto() {
    let options: ImagePickerOptions = {
      quality: 70,
      outputType: 1,
      maximumImagesCount: 1
    };

    this.imagePicker.getPictures(options).then(
      (results) => {
        for (var i = 0; i < results.length; i++) {
          this.imagePreview = 'data:image/jpeg;base64,' + results[i];
          this.image64 = results[i];
        }
      },
      (err) => console.log("ERROR en selector", JSON.stringify(err))
    );
  }

  createPost() {
    let file = {
      title: this.title,
      img: this.image64
    };

    this.loadFileProvider.loadImageFirebase(file)
    .then(() => this.closeModal());
  }
}
