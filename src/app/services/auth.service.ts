import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/compat/firestore';
import IUser from '../models/user.model';
import {Observable, of} from 'rxjs';
import {getAuth, onAuthStateChanged} from '@angular/fire/auth';
import {delay, filter, map, switchMap} from 'rxjs/operators';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean> = of(false);
  public isAuthenticatedWithDelay$: Observable<boolean> = of(false);
  private redirect = false;


  constructor(private auth: AngularFireAuth,
              private db: AngularFirestore,
              private router: Router,
              private route: ActivatedRoute) {
    const authh = getAuth();
    this.usersCollection = db.collection('users');

    onAuthStateChanged(authh, (user) => {
      if (user) {
        this.isAuthenticated$ = of(true);
        this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
      } else {
        this.isAuthenticated$ = of(false);
        this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
      }
    });

    //TODO sa vad dc nu vad tipul obiectului

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(e => this.route.firstChild),
      switchMap(route => route?.data ?? of({}))
    ).subscribe(data => this.redirect = data.authOnly ?? false);
  }


  public async createUser(userData: IUser): Promise<void> {
    if (!userData.password) {
      throw new Error('Password not provided!');
    }
    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email as string, userData.password as string
    );

    if (!userCred.user) {
      throw new Error('User can\'t be found');
    }

    await this.usersCollection.doc(userCred.user?.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phoneNumber: userData.phoneNumber
    });

    await userCred.user.updateProfile({
      displayName: userData.name
    });
  }

  public async logout($event?: MouseEvent): Promise<void> {
    if ($event) {
      $event.preventDefault();
    }
    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
