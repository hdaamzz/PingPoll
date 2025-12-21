export interface CreatePollOptionDto {
  id: string;
  text: string;
}
export interface PollOptionDto {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}