import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
// import { auth } from 'firebase/app'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(public afAuth: AngularFireAuth, public router: Router, public authService: AuthService, public cookie: CookieService) { }

  ngOnInit() {
  }

  onLoginGoogle(): void {
    this.authService.loginGoogleUser()
      .then((res) => {
        this.cookie.set('ui', JSON.stringify(res.additionalUserInfo.profile));        
        this.router.navigate(['/']);
      }).catch(err => console.log('err', err.message));
  }

}
