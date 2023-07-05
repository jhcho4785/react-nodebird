import axios from 'axios';
import { backUrl } from '@/config/config';

//axios 기본 설정
axios.defaults.baseURL = backUrl; //도메인
axios.defaults.withCredentials = true; //백엔드와 프론트엔드 도메인이 다를 시 쿠키 공유

export const logInAPI = (data: { email: string; password: string }) => {
  return axios.post('/user/login', data).then((response) => response.data);
};

export const logOutAPI = () => {
  return axios.post('/user/logout').then((response) => response.data);
};

export const signUpAPI = (data: { email: string; nickname: string; password: string }) => {
  return axios.post('/user', data).then((response) => response.data);
};

export const loadMyInfoAPI = () => {
  return axios.get('/user').then((response) => response.data);
};

export const followAPI = (data: number) => {
  return axios.patch(`/user/${data}/follow`).then((response) => response.data);
};

export const unfollowAPI = (data: number) => {
  return axios.delete(`/user/${data}/follow`).then((response) => response.data);
};

export function changeNicknameAPI(data: string) {
  return axios.patch('/user/nickname', { nickname: data }).then((response) => response.data);
}

export function loadFollowersAPI(page: number) {
  return axios.get(`/user/followers?page=${page}`).then((response) => response.data);
}

export function loadFollowingsAPI(page: number) {
  return axios.get(`/user/followings?page=${page}`).then((response) => response.data);
}

export function removeFollowerAPI(data: number) {
  return axios.delete(`/user/follower/${data}`).then((response) => response.data);
}

export function loadUserAPI(data: number) {
  return axios.get(`/user/${data}`).then((response) => response.data);
}
