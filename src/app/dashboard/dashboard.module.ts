import {NgModule} from '@angular/core';
import {CommonModule, DatePipe, registerLocaleData} from '@angular/common';
import {DashboardComponent} from './dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {ModuleComponent} from './module/module.component';
import {TaskComponent} from './task/task.component';
import {MatTableModule} from '@angular/material/table';
import {SubmissionComponent} from './submission/submission.component';
import {ACE_CONFIG, AceConfigInterface, AceModule} from 'ngx-ace-wrapper';
import {NgxMaskModule} from 'ngx-mask';
import {OptionQuestionComponent} from './option-question/option-question.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {ChatComponent} from './chat/chat.component';
import {MatIconModule} from '@angular/material/icon';
import {ProgressComponent} from './progress/progress.component';
import {DashboardContentComponent} from './dashboard-content/dashboard-content.component';
import {NextStepComponent} from './next-step/next-step.component';
import * as url from './routes';
import {ProblemComponent} from './problem/problem.component';
import {SharedModule} from '../shared/shared.module';
import {AngularSplitModule} from 'angular-split';
import {MatMenuModule} from '@angular/material/menu';
import {GitTaskComponent} from './git-task/git-task.component';
import {GitSubmissionComponent} from './git-submission/git-submission.component';
import {ProfileComponent} from './profile/profile.component';
import {IMaskModule} from 'angular-imask';
import {PersonalPlanProgressComponent} from './personal-plan-progress/personal-plan-progress.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {CountdownModule} from 'ngx-countdown';
import {PersonalPlanComponent} from './personal-plan/personal-plan.component';
import {PersonalPlanContentComponent} from './personal-plan-content/personal-plan-content.component';
import {ButtonProblemComponent} from './button-problem/button-problem.component';
import {HelpDialogComponent} from './help-dialog/help-dialog.component';
import {MatBadgeModule} from '@angular/material/badge';
import {ButtonCopylinkComponent} from './button-copylink/button-copylink.component';
import {TheoryComponent} from './theory/theory.component';
import {InputQuestionComponent} from './input-question/input-question.component';
import {FeedbackProblemComponent} from './feedback-problem/feedback-problem.component';
import {NgxMaterialRatingModule} from 'ngx-material-rating';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {NotificationTableComponent} from './notification-table/notification-table.component';
import {ProfileGeneralComponent} from './profile-general/profile-general.component';
import {ManualTaskComponent} from './manual-task/manual-task.component';
import {TelegramTokenComponent} from './telegram-token/telegram-token.component';
import {ConsultationScheduleComponent} from './consultation-schedule/consultation-schedule.component';
import {CallScheduleComponent} from './call-schedule/call-schedule.component';
import {RatingComponent} from './rating/rating.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MAT_RADIO_DEFAULT_OPTIONS, MatRadioModule} from '@angular/material/radio';
import {CalendarCommonModule, CalendarWeekModule} from 'angular-calendar';
import localeRu from '@angular/common/locales/ru';
import {CalendarComponent} from '../../appNew/calendar/calendar.component';
import {EventDialogComponent} from '../../appNew/calendar/event-dialog/event-dialog.component';
import {AddEventDialogComponent} from '../../appNew/calendar/add-event-dialog/add-event-dialog.component';
import {VacationComponent} from './vacation/vacation.component';
import {VacationDialogComponent} from './vacation/vacation-dialog/vacation-dialog.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {ReactiveFormsModule} from '@angular/forms';
import {MAT_DATE_LOCALE, MatLineModule, MatNativeDateModule} from '@angular/material/core';
import {TopicComponent} from './topic/topic.component';
import {MatTreeModule} from '@angular/material/tree';

registerLocaleData(localeRu);
const DEFAULT_ACE_CONFIG: AceConfigInterface = {
  useSoftTabs: true
};

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardContentComponent,
      },
      {
        path: 'calendar',
        component: CalendarComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'call-schedule',
        component: CallScheduleComponent,
      },
      {
        path: 'plan',
        component: PersonalPlanComponent,
      },
      {
        path: 'vacation',
        component: VacationComponent,
      },
      {
        path: 'java/' + url.TOPIC + '/:topicId/' + url.PROBLEM + '/:problemId',
        redirectTo: url.MODULE + '/1/' + url.TOPIC + '/:topicId/' + url.PROBLEM + '/:problemId'
      },
      {
        path: 'java/' + url.TOPIC + '/:topicId',
        redirectTo: url.MODULE + '/1/' + url.TOPIC + '/:topicId'
      },
      {
        path: url.MODULE + '/:moduleId',
        component: ModuleComponent,
        children: [
          {
            path: url.TOPIC + '/:topicId',
            component: TopicComponent
          },
          {
            path: url.TOPIC + '/:topicId/' + url.PROBLEM + '/:problemId',
            component: ProblemComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    DashboardComponent,
    TopicComponent,
    ModuleComponent,
    TaskComponent,
    SubmissionComponent,
    OptionQuestionComponent,
    ChatComponent,
    ProgressComponent,
    DashboardContentComponent,
    NextStepComponent,
    ProblemComponent,
    GitTaskComponent,
    GitSubmissionComponent,
    ProfileComponent,
    PersonalPlanProgressComponent,
    PersonalPlanComponent,
    PersonalPlanContentComponent,
    ButtonProblemComponent,
    HelpDialogComponent,
    ButtonCopylinkComponent,
    TheoryComponent,
    InputQuestionComponent,
    FeedbackProblemComponent,
    ManualTaskComponent,
    NotificationTableComponent,
    ProfileGeneralComponent,
    TelegramTokenComponent,
    ConsultationScheduleComponent,
    CallScheduleComponent,
    RatingComponent,
    CalendarComponent,
    EventDialogComponent,
    AddEventDialogComponent,
    VacationComponent,
    VacationDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    AceModule,
    NgxMaskModule.forRoot(),
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    SharedModule,
    AngularSplitModule,
    MatMenuModule,
    IMaskModule,
    MatProgressBarModule,
    CountdownModule,
    MatBadgeModule,
    NgxMaterialRatingModule,
    MatSelectModule,
    MatTabsModule,
    MatTooltipModule,
    MatRadioModule,
    CalendarWeekModule,
    CalendarCommonModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatLineModule,
    MatTreeModule
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
export class DashboardModule {
}
