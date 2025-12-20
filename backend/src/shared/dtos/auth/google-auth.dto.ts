export class GoogleAuthDto {
  constructor(public firebaseToken: string) {}

  static fromRequest(body: any): GoogleAuthDto {
    return new GoogleAuthDto(body.firebaseToken);
  }
}
