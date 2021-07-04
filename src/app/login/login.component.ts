import { Component, OnInit } from '@angular/core';
import {Injectable, NgZone} from '@angular/core';
//import * as firebase from 'firebase/app';
import firebase from 'firebase/app'
import { Router } from '@angular/router';
import { AngularFireAuth } from "@angular/fire/auth";
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import{AuthServiceService} from '../auth-service.service';
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  userData: any; 
  loginForm: FormGroup |any;
  submitted = false;
  constructor(private afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public authService: AuthServiceService,
    private formBuilder: FormBuilder,
    public ngZone: NgZone,
    private router: Router) { 
      this.afAuth.authState.subscribe(user => {
        if (user) {
          this.userData = user;
          localStorage.setItem('user', JSON.stringify(this.userData));
          JSON.parse(localStorage.getItem('user') as string);
        } else {
          // @ts-ignore
          localStorage.setItem('user', null);
          JSON.parse(localStorage.getItem('user') as string);
        }
      });
    }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }


  onSubmit(): any {

    return this.afAuth.signInWithEmailAndPassword(this.loginForm.controls.username.value.toString(),
      this.loginForm.controls.password.value.toString())
      .then((result: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['home']);
        });
        this.SetUserData(result.user);
      }).catch((error: any) => {
        window.alert(error);
      });
  }

  GoogleAuth(): any {
    return this.AuthLogin(new firebase.auth.GoogleAuthProvider());
    //Firebase.Auth.GoogleAuthProvider
  }

  // Auth logic to run auth providers
  AuthLogin(provider: any): any {
    return this.afAuth.signInWithPopup(provider)
      .then((result: any) => {
        this.ngZone.run(() => {
          this.router.navigate(['home']);
        });
        this.SetUserData(result.user);
      }).catch((error: any) => {
        window.alert(error);
      });
  }

  SetUserData(user: any): any {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${user.uid}`);
    const userData: User = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
      // country: user.country,
      // Address: user.Address,
      // State: user.state,
      // zipCode: user.zipCode
    };
    return userRef.set(userData, {
      merge: true
    });
  }

}