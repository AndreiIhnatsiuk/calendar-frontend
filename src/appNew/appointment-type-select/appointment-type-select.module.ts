import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AppointmentTypeSelectComponent} from './appointment-type-select.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from '@angular/forms';



@NgModule({
  declarations: [
    AppointmentTypeSelectComponent
  ],
  exports: [
    AppointmentTypeSelectComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    FormsModule
  ]
})
export class AppointmentTypeSelectModule { }
