export class UpdatePollDto {
  title?: string;
  question?: string;
  status?: 'active' | 'closed' | 'draft';
  expiresAt?: Date;

  constructor(data: Partial<UpdatePollDto>) {
    if (data.title) this.title = data.title.trim();
    if (data.question) this.question = data.question.trim();
    if (data.status) this.status = data.status;
    if (data.expiresAt) this.expiresAt = data.expiresAt;
  }
}
