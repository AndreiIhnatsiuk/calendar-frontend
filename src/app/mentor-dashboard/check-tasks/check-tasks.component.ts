import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Gtag} from 'angular-gtag';
import {Personal} from '../../entities/personal';
import {MentorSubmission} from '../../entities/mentor-submission';
import {MentorSubmissionService} from '../../services/mentor-submission.service';
import {AuthService} from '../../services/auth.service';
import {MentorSubmissionDialogComponent} from './mentor-submission-dialog/mentor-submission-dialog.component';

@Component({
  selector: 'app-check-tasks',
  templateUrl: './check-tasks.component.html',
  styleUrls: ['./check-tasks.component.scss']
})
export class CheckTasksComponent implements OnInit {
  personal: Personal;
  mentorSubmissions: Array<MentorSubmission>;
  dialogRef: any;

  constructor(private mentorService: MentorSubmissionService,
              private authService: AuthService,
              private gtag: Gtag,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.getSubmissionsInQueue();
  }

  getSubmissionsInQueue() {
    this.mentorService.getManualSubmissionInQueue().subscribe(mentorSubmission => {
      this.mentorSubmissions = mentorSubmission;
    });
  }

  useDialog(id: string) {
    this.dialogRef = this.dialog.open(MentorSubmissionDialogComponent, {data: id});
    this.dialogRef.afterClosed().subscribe(() => this.getSubmissionsInQueue());
  }

  check(id: string): void {
    this.useDialog(id);
  }

}
