export class GitTaskSubmissionRequest {
  problemId: number;
  pullRequestId: number;
  type: string;

  constructor(problemId: number, pullRequestId: number) {
    this.problemId = problemId;
    this.pullRequestId = pullRequestId;
    this.type = 'GitTask';
  }
}
