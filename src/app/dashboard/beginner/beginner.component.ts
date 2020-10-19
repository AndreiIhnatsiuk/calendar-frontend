import {Component, OnDestroy, OnInit} from '@angular/core';
import {SubtopicService} from '../../services/subtopic.service';
import {Topic} from '../../entities/topic';
import {Task} from '../../entities/task';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {TaskService} from '../../services/task.service';
import {filter, map, switchMap} from 'rxjs/operators';
import {concat, of, Subscription} from 'rxjs';
import {AcceptedSubmissionService} from '../../services/accepted-submission.service';
import {Question} from '../../entities/question';
import {QuestionService} from '../../services/question.service';
import {Subtopic} from '../../entities/subtopic';
import {AvailableSubtopicsService} from '../../services/available-subtopics.service';

@Component({
  selector: 'app-beginner',
  templateUrl: './beginner.component.html',
  styleUrls: ['./beginner.component.scss']
})
export class BeginnerComponent implements OnInit, OnDestroy {
  topics: Array<Topic>;
  subtopicId: number;
  availableSubtopics: Set<number>;
  acceptedSubtopics: Set<number>;
  acceptedTasksBySubtopics: Map<number, number>;
  countTasksBySubtopics: Map<number, number>;
  acceptedQuestionsBySubtopics: Map<number, number>;
  countQuestionsBySubtopics: Map<number, number>;
  private acceptedTasksBySubtopicsSubscription: Subscription;
  private acceptedQuestionsBySubtopicsSubscription: Subscription;
  private availableSubtopicsSubscription: Subscription;

  constructor(private subtopicService: SubtopicService,
              private taskService: TaskService,
              private questionService: QuestionService,
              private acceptedSubmissionService: AcceptedSubmissionService,
              private availableTopicsService: AvailableSubtopicsService,
              private router: Router,
              private route: ActivatedRoute) {
    this.acceptedSubtopics = new Set<number>();
    this.availableSubtopics = new Set<number>();
  }

  ngOnInit() {
    this.subtopicService.getTopics()
      .subscribe(topics => this.topics = topics);
    this.acceptedTasksBySubtopicsSubscription = this.acceptedSubmissionService.getAcceptedBySubtopics()
      .subscribe(accepted => this.acceptedTasksBySubtopics = accepted);
    this.taskService.countBySubtopic()
      .subscribe(number => this.countTasksBySubtopics = number);
    this.acceptedQuestionsBySubtopicsSubscription = this.questionService.getAcceptedBySubtopics()
      .subscribe(accepted => this.acceptedQuestionsBySubtopics = accepted);
    this.questionService.countBySubtopic()
      .subscribe(number => this.countQuestionsBySubtopics = number);
    this.availableSubtopicsSubscription = this.availableTopicsService.getAvailableSubtopics()
      .subscribe(availableTopics => this.availableSubtopics = availableTopics);

    concat(
      of(this.route.firstChild),
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.route.firstChild)
      )
    )
      .pipe(switchMap(route => route.paramMap))
      .subscribe(paramMap => {
        const subtopicId = +paramMap.get('subtopicId');
        if (subtopicId !== this.subtopicId) {
          this.subtopicId = subtopicId;
        }
      });
  }

  ngOnDestroy(): void {
    if (this.acceptedTasksBySubtopicsSubscription) {
      this.acceptedTasksBySubtopicsSubscription.unsubscribe();
    }
    if (this.acceptedQuestionsBySubtopicsSubscription) {
      this.acceptedQuestionsBySubtopicsSubscription.unsubscribe();
    }
    if (this.availableSubtopicsSubscription) {
      this.availableSubtopicsSubscription.unsubscribe();
    }
  }

  public getAcceptedTask(id: number) {
    if (!this.acceptedTasksBySubtopics) {
      return '';
    }
    const accepted = this.acceptedTasksBySubtopics.get(id);
    return accepted ? accepted : 0;
  }

  public getAcceptedQuestion(id: number) {
    if (!this.acceptedQuestionsBySubtopics) {
      return '';
    }
    const accepted = this.acceptedQuestionsBySubtopics.get(id);
    return accepted ? accepted : 0;
  }

  public getTotalTask(id: number) {
    if (!this.countTasksBySubtopics) {
      return '';
    }
    const count = this.countTasksBySubtopics.get(id);
    return count ? count : 0;
  }

  public getTotalQuestion(id: number) {
    if (!this.countQuestionsBySubtopics) {
      return '';
    }
    const count = this.countQuestionsBySubtopics.get(id);
    return count ? count : 0;
  }

  public getAcceptedInTopic(subtopics: Array<Subtopic>): boolean {
    for (const subtopic of subtopics) {
      if (this.getAcceptedTask(subtopic.id) !== this.getTotalTask(subtopic.id)
        || this.getAcceptedQuestion(subtopic.id) !== this.getTotalQuestion(subtopic.id)) {
        return false;
      }
    }
    return true;
  }

  public getAcceptedInSubtopic(subtopic: Subtopic): boolean {
    return this.getAcceptedTask(subtopic.id) === this.getTotalTask(subtopic.id)
      && this.getAcceptedQuestion(subtopic.id) === this.getTotalQuestion(subtopic.id);
  }

  public hasAvailableSubtopics(subtopics: Array<Subtopic>) {
    for (const subtopic of subtopics) {
      if (this.availableSubtopics.has(subtopic.id)) {
        return true;
      }
    }
    return false;
  }
}
