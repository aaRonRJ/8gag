import { Injectable } from '@angular/core';

import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import { ToastController } from 'ionic-angular';
import 'rxjs/add/operator/map';

@Injectable()
export class LoadFileProvider {
  images: LoadFile[] = [];
  lastKey: string;

  constructor(private toastCtrl: ToastController,
              private afDB: AngularFireDatabase) {
    this.loadLastKey()
    .subscribe(() => this.loadImages());
  }

  private loadLastKey() {
    return this.afDB.list('/post', ref => ref.orderByKey().limitToLast(1))
    .valueChanges()
    .map((post: any) => {
      this.lastKey = post[0].key;
      this.images.push(post[0]);
    });
  }

  loadImages() {
    return new Promise((resolve, reject) => {
      this.afDB.list('/post', ref => ref.limitToLast(3).orderByKey().endAt(this.lastKey))
                                      .valueChanges()
                                      .subscribe((posts: any) => {
                                        posts.pop();

                                        if(posts.length == 0) {
                                          console.log('Ya no hay más registros.');
                                          resolve(false);
                                          return;
                                        }

                                        this.lastKey = posts[0].key;

                                        for(let i = posts.length - 1; i >= 0; i--) {
                                          let post = posts[i];
                                          this.images.push(post);
                                        }

                                        resolve(true);
                                      });
    });
  }

  loadImageFirebase(loadFile: LoadFile) {
    let promise = new Promise(
      (resolve, reject) => {
        this.showToast('Cargando...');

        // Hacemos referencia al storage de nuestro firebase.
        let storeRef = firebase.storage().ref();
        
        let fileName: string = new Date().valueOf().toString(); // Le damos nombre al fichero.

        // Creamos una tarea de Firebase para subir el fichero al storage.
        let uploadTask: firebase.storage.UploadTask = 
        storeRef
        .child(`img8gag/${fileName}`)
        .putString(loadFile.img, 'base64', { contentType: 'image/jpeg' });

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          () => {}, // Mostrar el % de Mbs que se han subido hasta el momento.
          (error) => {
            console.log('ERROR EN LA CARGA');
            console.log(JSON.stringify(error));
            this.showToast(JSON.stringify(error));

            reject();
          },
          () => {
            // Cuando se ha subido 'BIEN' la imagen al storage de firebase.
            console.log('Archivo subido');
            this.showToast('Imagen cargada correctamente.');        

            uploadTask.snapshot.ref.getDownloadURL()
            .then((downloadURL) => {
              this.savePost(loadFile.title, downloadURL, fileName);
              
              resolve();
            });
          }
        );
      }
    );

    return promise;
  }

  showToast(msg: string) {
    this.toastCtrl.create({
      message: msg,
      duration: 2000
    }).present();
  }

  private savePost(title: string, url: string, fileName: string) {
    let post: LoadFile = {
      title: title,
      img: url,
      key: fileName
    };

    console.log('POST: ', JSON.stringify(post));

    // Se debería de hacer un 'then()' para comprobar que se ha insertado correctamente en la base de datos de firebase.
    this.afDB.object(`post/${fileName}`).update(post);
    
    this.images.push(post);
  }
}

interface LoadFile {
  title: string;
  img: string;
  key?: string;
}
