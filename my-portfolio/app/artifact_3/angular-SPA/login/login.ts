import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { Authentication } from '../services/authentication';
import { User } from '../models/user';
import { Observable } from 'rxjs'; 

@Component({
  selector: 'app-login',
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  loginForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });

  signupForm = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
    verifypwd: new FormControl('')
  });
  
  isSignupView = false;
  public formError: string='';
  submitted = false;

  constructor(
    private router: Router,
    private authenticationService: Authentication
  ){}

  ngOnInit(): void{

  }

  doLogin(): void {
    if (this.loginForm.invalid){
      alert('Please fill out all fields correctly');
      return;
    }

    const newUser = this.loginForm.value;

    //console.log('LoginComponent::doLogin');
    //console.log(this.credentials);

    this.authenticationService.login(
      {username: newUser.username} as User,
      newUser.password!).subscribe({
        next: () => {
          this.router.navigate(['/alerts']);
        },
        error: (err) => {
          this.formError = 'Login failed. Please check your credentials.';
        }
      });
  }

  doSignup(): void{
    if(this.signupForm.invalid){
      alert('Please fill out all fields correctly');
      return;
    }

    const newUser = this.signupForm.value;
    // Verify Password
    if (newUser.password !== newUser.verifypwd){
      alert('Passwords do not match!');
      return;
    }

    // Call AuthenticationService
    this.authenticationService.register(
      {username: newUser.username } as User,
      newUser.password!).subscribe({
        next: () => {
          alert('Account created successfully!');
          this.router.navigate(['/alerts']);
        },
        error: (err) => {
          alert('Registration failed. Please try again');
        }
      });  
  }

  showSignup() {
    // Clear forms and switch view
    this.signupForm.reset();
    this.loginForm.reset();
    this.isSignupView = true;
  }

  showLogin() {
    // Clear forms and switch view
    this.signupForm.reset();
    this.loginForm.reset();
    this.isSignupView = false;
  }
}
