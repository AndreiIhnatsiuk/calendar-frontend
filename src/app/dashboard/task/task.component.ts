import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SubmissionService} from '../../services/submission.service';
import {SubmissionRequest} from '../../entities/submission-request';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SubmissionStatus} from '../../entities/submission-status';
import {SubmissionComponent} from '../submission/submission.component';
import {AcceptedSubmissionService} from '../../services/accepted-submission.service';
import {AceComponent} from 'ngx-ace-wrapper';

import 'brace';
import 'brace/mode/java';
import 'brace/theme/github';
import {Gtag} from 'angular-gtag';
import {Subject, Subscription, zip} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {StoredSolution} from '../../entities/stored-solution';
import {HintService} from '../../services/hint.services';
import {Hint} from '../../entities/hint';
import {MatAccordion} from '@angular/material/expansion';
import {ProblemService} from '../../services/problem.service';
import {FullProblem} from '../../entities/full-problem';
import {FullSubmission} from '../../entities/full-submission';
import {BestLastFullSubmission} from '../../entities/best-last-full-submission';
import {RunSubmissionRequest} from '../../entities/run-submission-request';
import {SplitAreaDirective, SplitComponent} from 'angular-split';
import {LocalStorageService} from '../../services/local-storage.service';
import {TaskPageConfig} from '../../entities/task-page-config';

@Component({
  selector: 'app-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TaskComponent implements OnChanges, OnDestroy {
  @Input() problemId: number;
  @Input() subtopicId: number;
  @Input() startDate: Date;
  @Input() endDate: Date;
  @ViewChild(AceComponent, {static: false}) ace?: AceComponent;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  @ViewChild('split') split: SplitComponent;
  @ViewChild('area1') area1: SplitAreaDirective;
  @ViewChild('area2') area2: SplitAreaDirective;
  @ViewChild('area3') area3: SplitAreaDirective;
  @ViewChild('area4') area4: SplitAreaDirective;
  @ViewChild('area5') area5: SplitAreaDirective;
  @ViewChild('area6') area6: SplitAreaDirective;
  @ViewChild('area7') area7: SplitAreaDirective;
  @ViewChild('area8') area8: SplitAreaDirective;

  problem: FullProblem;
  bestLastSubmission: BestLastFullSubmission;
  listSubmissions: Array<FullSubmission>;
  hints: Array<Hint> = [];
  solution: string;
  editSubject: Subject<string>;
  storedSolution: StoredSolution;
  submissionsSubscription: Subscription;
  status: boolean = null;
  panelOpenState = false;
  input: string;
  output: string;
  sending = false;
  running: boolean;
  size = window.innerHeight;
  taskPageConfig: TaskPageConfig = new TaskPageConfig();

  constructor(private route: ActivatedRoute,
              private problemService: ProblemService,
              private hintService: HintService,
              private submissionService: SubmissionService,
              private acceptedSubmissionService: AcceptedSubmissionService,
              private snackBar: MatSnackBar,
              private dialog: MatDialog,
              private gtag: Gtag,
              private localStorage: LocalStorageService) {
    this.editSubject = new Subject<string>();
    this.editSubject
      .pipe(debounceTime(1000))
      .subscribe(solution => this.storeSolution(solution));

    if (localStorage.getItem('taskPageConfig')) {
      this.taskPageConfig = JSON.parse(this.localStorage.getItem('taskPageConfig'));
      if (!this.taskPageConfig.areaAce) {
        this.taskPageConfig.areaAce = 70;
        this.taskPageConfig.areaInputAndOutput = 30;
      }
    }
  }

  closedPanelHints() {
    this.panelOpenState = false;
    this.area3.size = 90;
    this.area4.size = 10;
  }

  openedPanelHints() {
    this.panelOpenState = true;
    this.area3.size = this.taskPageConfig.areaTask;
    this.area4.size = this.taskPageConfig.areaHint;
  }

  dragEndLeft(unit, {sizes}) {
    this.taskPageConfig.areaTask = sizes[0];
    this.taskPageConfig.areaHint = sizes[1];
  }

  dragEnd(unit, {sizes}) {
    this.ace.directiveRef.ace().resize();
    this.taskPageConfig.areaAce = sizes[0];
    this.taskPageConfig.areaInputAndOutput = sizes[1];
  }

  dragEndWindow(unit, {sizes}) {
    this.taskPageConfig.areaWindowLeft = sizes[0];
    this.taskPageConfig.areaWindowRight = sizes[1];
  }

  dragEndInputAndOutput(unit, {sizes}) {
    this.taskPageConfig.areaInput = sizes[0];
    this.taskPageConfig.areaOutput = sizes[1];
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.size = event.target.innerHeight;
  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler() {
    this.localStorage.setItem('taskPageConfig', JSON.stringify(this.taskPageConfig));
  }

  ngOnChanges() {
    this.acceptedSubmissionService.getAccepted([this.problemId]).subscribe(answerOnTasks => {
      this.status = answerOnTasks.get(this.problemId);
    });
    this.problemService.getProblemById(this.problemId).subscribe(fullProblem => {
      this.problem = fullProblem;
      if (this.storedSolution == null || !this.storedSolution.solution) {
        this.initDefaultSolution();
      }
    });
    this.hintService.getAllOpenedHints(this.problemId).subscribe(hints => {
      this.hints = hints;
    });
    if (!this.endDate) {
      this.storedSolution = this.submissionService.getSolution(this.problemId);
      if (this.storedSolution) {
        this.solution = this.storedSolution.solution;
      }
    }
    if (this.submissionsSubscription) {
      this.submissionsSubscription.unsubscribe();
    }
    this.submissionsSubscription = this.submissionService
      .getSubmissionsByProblemId(this.problemId)
      .subscribe(bestLastSubmission => {
        this.bestLastSubmission = bestLastSubmission;
        this.parseBestAndLastInList(bestLastSubmission);
        if (bestLastSubmission.last != null) {
          this.running = this.isRunning(this.bestLastSubmission.last);
          if (this.storedSolution && this.storedSolution.submissionId) {
            let index;
            if (bestLastSubmission.last.id === this.storedSolution.submissionId) {
              index = 0;
            }
            if (index !== -1 && SubmissionStatus[bestLastSubmission.last.status] === SubmissionStatus.COMPILATION_ERROR) {
              this.submissionService.getSubmissionsByProblemId(bestLastSubmission.last.problemId)
                .subscribe(fullSubmission => this.parseErrors(fullSubmission.last.errorString));
            }
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.submissionsSubscription) {
      this.submissionsSubscription.unsubscribe();
    }
  }

  initDefaultSolution() {
    if (this.problem.tests && this.problem.tests.length && this.problem.tests[0].input) {
      if (this.problem.method.resultIndex === -1 &&
        this.problem.method.returnType === 'void' &&
        this.problem.method.name === 'main' &&
        this.problem.method.arguments[0] === 'String[]') {
        this.solution =
          'import java.util.Scanner;\n' +
          '\n' +
          'public class Program {\n' +
          '    public static void main(String[] args) {\n' +
          '        Scanner scanner = new Scanner(System.in);\n' +
          '        \n' +
          '    }\n' +
          '}\n' +
          '';
      } else {
        this.solution =
          'public class Program {\n' +
          '    \n' +
          '}\n' +
          '';
      }
    } else {
      this.solution =
        'public class Program {\n' +
        '    public static void main(String[] args) {\n' +
        '        \n' +
        '    }\n' +
        '}\n' +
        '';
    }
  }

  storeSolution(solution: string, submissionId?: string) {
    const old = submissionId ? null : this.submissionService.getSolution(this.problemId);
    if (!old || old.problemId !== this.problemId || old.solution !== solution) {
      const storedSolution: StoredSolution = {
        problemId: this.problemId,
        solution: solution,
        submissionId: submissionId
      };
      this.storedSolution = storedSolution;
      this.submissionService.storeSolution(storedSolution);
    }
  }

  sendHint() {
    if (this.panelOpenState || this.hints.length === 0) {
      this.hintService.postNextHintByTaskId(this.problemId).subscribe(hint => {
        this.hints.push(hint);
        this.accordion.openAll();
      });
      if (this.accordion) {
        this.accordion.openAll();
      }
    } else {
      this.accordion.openAll();
    }
  }

  send() {
    this.sending = true;
    this.ace.directiveRef.ace().getSession().setAnnotations([]);
    const submission = new SubmissionRequest(this.problemId, this.solution);
    this.submissionService.postSubmission(submission).subscribe(added => {
      this.gtag.event('sent', {
        event_category: 'submission',
        event_label: this.problemId.toString()
      });
      this.sending = false;
      this.running = true;
      this.snackBar.open('Решение отправлено.', undefined, {
        duration: 5000
      });
      this.bestLastSubmission.last = added;
      if (this.solution === submission.solution) {
        this.storeSolution(this.solution, added.id);
      }
    }, error => {
      this.gtag.event('sending-error', {
        event_category: 'submission',
        event_label: this.problemId.toString()
      });
      this.sending = false;
      this.snackBar.open(error.error.message, undefined, {
        duration: 5000
      });
    });
  }

  run() {
    this.sending = true;
    this.ace.directiveRef.ace().getSession().setAnnotations([]);
    console.log(this.input);
    const submission = new RunSubmissionRequest(this.problemId, this.solution, this.input);
    this.submissionService.postRunSubmission(submission).subscribe(added => {
      this.gtag.event('sent', {
        event_category: 'submission',
        event_label: this.problemId.toString()
      });
      this.sending = false;
      this.running = true;
      this.snackBar.open('Решение отправлено.', undefined, {
        duration: 5000
      });
      this.output = added.output;
      console.log(this.output);
      if (this.solution === submission.solution) {
        this.storeSolution(this.solution, added.id);
      }
    }, error => {
      this.gtag.event('sending-error', {
        event_category: 'submission',
        event_label: this.problemId.toString()
      });
      this.sending = false;
      this.snackBar.open(error.error.message, undefined, {
        duration: 5000
      });
    });
  }

  isRunning(submission: FullSubmission): boolean {
    return this.submissionService.isRunning(submission);
  }

  showMore(submission: FullSubmission): boolean {
    const status = SubmissionStatus[submission.status];
    return !(status === SubmissionStatus.IN_QUEUE || status === SubmissionStatus.RUNNING);
  }

  seeMore(submission: FullSubmission) {
    if (!this.showMore(submission)) {
      return;
    }
    this.dialog.open(SubmissionComponent, {data: submission});
  }

  isSendDisabled(): boolean {
    if (!this.endDate) {
      return false;
    }
    return this.endDate.getTime() - new Date().getTime() < 0;
  }

  parseErrors(out: string): void {
    const errors = out.split(/^.*\.java:(\d+): error: /gm);
    console.log(errors);
    const annotations = [];
    for (let i = 1; i < errors.length; i += 2) {
      annotations.push({
        row: +errors[i] - 1,
        column: 0,
        text: errors[i + 1].split(/^\d+ errors?/gm)[0],
        type: 'error'
      });
    }

    this.ace.directiveRef.ace().getSession().setAnnotations(annotations);
  }

  private parseBestAndLastInList(submissions: BestLastFullSubmission): void {
    if (submissions.last !== null) {
      this.listSubmissions = new Array<FullSubmission>();
      this.listSubmissions.push(submissions.last);
      this.listSubmissions.push(submissions.best);
    } else {
      this.listSubmissions = null;
    }
  }
}
