import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './dashboard.component';
import {RouterModule, Routes} from '@angular/router';
import {LessonComponent} from './lesson/lesson.component';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {BeginnerComponent} from './beginner/beginner.component';
import {TaskComponent} from './task/task.component';
import {MatTableModule} from '@angular/material/table';
import {SubmissionComponent} from './submission/submission.component';
import {AceModule} from 'ngx-ace-wrapper';
import {ACE_CONFIG} from 'ngx-ace-wrapper';
import {AceConfigInterface} from 'ngx-ace-wrapper';
import {NgxMaskModule} from 'ngx-mask';
import {QuestionComponent} from './question/question.component';
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
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: url.JAVA,
        component: BeginnerComponent,
        children: [
          {
            path: '',
            redirectTo: url.LESSON + '/1'
          },
          {
            path: url.LESSON + '/:lessonId',
            component: LessonComponent
          },
          {
            path: url.LESSON + '/:lessonId/' + url.PROBLEM + '/:problemId',
            component: ProblemComponent
          },
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    DashboardComponent,
    LessonComponent,
    BeginnerComponent,
    TaskComponent,
    SubmissionComponent,
    QuestionComponent,
    ChatComponent,
    ProgressComponent,
    DashboardContentComponent,
    NextStepComponent,
    ProblemComponent,
    GitTaskComponent,
    GitSubmissionComponent,
    ProfileComponent
  ],
  entryComponents: [
    SubmissionComponent
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
    IMaskModule
  ],
  providers: [
    {
      provide: ACE_CONFIG,
      useValue: DEFAULT_ACE_CONFIG
    }
  ]
})
export class DashboardModule {
}
