import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MarkedPipe} from '../pipes/marked.pipe';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';
import {SpinOnModule} from '../spin-on/spin-on.directive';

@NgModule({
  declarations: [
    MarkedPipe
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MarkedPipe,
    MatToolbarModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    SpinOnModule
  ]
})
export class SharedModule { }
