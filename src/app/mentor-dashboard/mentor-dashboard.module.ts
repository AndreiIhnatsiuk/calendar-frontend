import {NgModule} from '@angular/core';
import {CommonModule, DatePipe, registerLocaleData} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {MentorDashboardComponent} from './mentor-dashboard.component';
import {ACE_CONFIG, AceConfigInterface} from 'ngx-ace-wrapper';
import {MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule} from '@angular/material/radio';
import {SharedModule} from '../shared/shared.module';
import {CheckTasksComponent} from './check-tasks/check-tasks.component';
import {MentorSubmissionDialogComponent} from './check-tasks/mentor-submission-dialog/mentor-submission-dialog.component';
import {CalendarCommonModule, CalendarWeekModule} from 'angular-calendar';
import localeRu from '@angular/common/locales/ru';
import {MentorCalendarComponent} from '../../appNew/mentor-calendar/mentor-calendar.component';
import {MentorEventDialogComponent} from '../../appNew/mentor-calendar/event-dialog/event-dialog.component';
import {MentorAddEventDialogComponent} from '../../appNew/mentor-calendar/add-event-dialog/add-event-dialog.component';
import {DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, MatOptionModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {AddSlotsDialogComponent} from '../../appNew/mentor-calendar/add-slots-dialog/add-slots-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatDatepickerModule} from '@angular/material/datepicker';

registerLocaleData(localeRu);

const DEFAULT_ACE_CONFIG: AceConfigInterface = {
  useSoftTabs: true
};

const routes: Routes = [
  {
    path: '',
    component: MentorDashboardComponent,
    children: [
      {
        path: 'check-tasks',
        component: CheckTasksComponent,
      },
      {
        path: 'calendar',
        component: MentorCalendarComponent,
      },
    ]
  }
];

@NgModule({
  declarations: [
    MentorDashboardComponent,
    MentorSubmissionDialogComponent,
    CheckTasksComponent,
    MentorCalendarComponent,
    MentorEventDialogComponent,
    MentorAddEventDialogComponent,
    AddSlotsDialogComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    MatRadioModule,
    CalendarWeekModule,
    CalendarCommonModule,
    MatOptionModule,
    MatIconModule,
    MatSelectModule,
    MatTooltipModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
  ],
  providers: [
    DatePipe,
    {
      provide: ACE_CONFIG,
      useValue: DEFAULT_ACE_CONFIG
    },
    {
      provide: MAT_DATE_LOCALE, useValue: 'ru-Ru'
    },
    {
      provide: MAT_RADIO_DEFAULT_OPTIONS,
      useValue: {color: 'primary'},
    }
  ]
})
export class MentorDashboardModule {
  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('en-en');
  }
}
