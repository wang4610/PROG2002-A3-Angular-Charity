import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { SearchComponent } from './search/search';
import { EventDetailComponent } from './event-detail/event-detail';
import { RegistrationComponent } from './registration/registration';
import { AboutComponent } from './about/about';
import { ImpactComponent } from './impact/impact';
import { AdminListComponent } from './admin-list/admin-list';
import { AdminNewComponent } from './admin-new/admin-new';
import { AdminEditComponent } from './admin-edit/admin-edit';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'search', component: SearchComponent },
  { path: 'event/:id', component: EventDetailComponent },
  { path: 'register/:id', component: RegistrationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'impact', component: ImpactComponent },
  { path: 'admin', component: AdminListComponent },
  { path: 'admin/new', component: AdminNewComponent },
  { path: 'admin/edit/:id', component: AdminEditComponent },
  { path: '**', redirectTo: '' }
];
