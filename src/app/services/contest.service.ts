import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiUrls } from '../../apiurls';

@Injectable()
export class ContestService {

  baseUrl = ApiUrls.URL;
  headers;

  constructor(public httpClient: HttpClient) {
    this.headers = new Headers();
    this.headers.append("content-Type", "Application/json");
  }

  sendEmail({ name, email, subject, message }) {
    return this.httpClient.post('/email/send', { name, email, subject, message })
      .toPromise()
      .then(res => res)
      .catch(err => err)
  }

  getContests() {
    return this.httpClient.get('/contests', { headers: this.headers })
      .toPromise()
      .then(res => res)
      .catch(err => err)
  }

  getContestBySlug(slug, userId) {
    let headers = new HttpHeaders({ userId });
    return this.httpClient.get(`/contests/findBySlug/${slug}`, { headers })
      .toPromise()
      .then(res => res)
      .catch(err => err);
  }

  getContestIdBySlug(slug) {
    return this.httpClient.get(`/contests/findIdBySlug/${slug}`)
      .toPromise()
      .then(res => res)
      .catch(err => err);
  }

  joinFreeContest(userId, contestId) {
    let headers = new HttpHeaders({ userId });
    return this.httpClient.post('/users/joinFreeContest', { userId, contestId }, { headers })
      .toPromise()
      .then(res => res)
      .catch(err => err);
  }

  notifyUser(name, email) {
    return this.httpClient.post('/users/notify', { name, email })
      .toPromise()
      .then(res => res)
      .catch(err => err);
  }

  getAccesCode({ email, lang }) {
    return this.httpClient.get(`/users/email/${email}/${lang}`, { headers: this.headers })
      .toPromise()
      .then(res => res)
      .catch(err => err)
  }

  varifyCode({ email, acess_code }) {
    return this.httpClient.post('/users/verify', { email, acess_code }, { headers: this.headers })
      .toPromise()
      .then(res => res)
      .catch(err => err)
  }

  uploadimages(data) {
    return this.httpClient.post('/images/uploads', data)
      .toPromise()
      .then(res => res)
      .catch(err => err)
  }

  getUserImages(id) {
    return this.httpClient.get(`/users/${id}/images`)
      .toPromise()
      .then(res => res)
      .catch(err => err)
  }

}
