import { AngularFireAuth } from '@angular/fire/auth';
import { Injectable } from '@angular/core';
import { auth } from 'firebase/app';
import { map } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // userCollection: AngularFirestoreCollection<User>;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    // this.users = this.afs.collection('users').valueChanges();
  }


  loginGoogleUser() {
    return this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }


  logoutUser() {
    return this.afAuth.auth.signOut();
  }

  isAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  saveFavorites(data) {
    this.afs.collection('favorites', ref => ref.where('email', '==', data.email).where('favorite', '==', data.favorite)).get().subscribe(favorites => {
      if (favorites.size == 0) {
        this.afs.collection('favorites').add(data);
        console.log(1);
        return 1; //Favorite saved
      } else {        
        console.log(2);       
        return 2; //Isset favorite

      }
    });
  }


  getFavorites(data){
    let items = this.afs.collection('favorites', ref => ref.where('email', '==', data.email)).valueChanges();
    return items;
  }

  



}
