import axios, { AxiosResponse } from 'axios';
import { backUrl } from '@/config/config';
import Comment from '@/interfaces/comment';

axios.defaults.baseURL = backUrl;
axios.defaults.withCredentials = true;

export const addPost = (data: FormData) => {
  return axios.post('/post', data).then((response) => response.data);
};

export const addCommentAPI = (data: { postId: number; content: string; userId: number }) => {
  return axios.post(`/post/${data.postId}/comment`, data).then((response: AxiosResponse<Comment>) => response.data);
};

export function removePostAPI(data: number) {
  return axios.delete(`/post/${data}`).then((response) => response.data);
}

export const loadPostAPI = (data: number) => {
  return axios.get(`/post/${data}`).then((response) => response.data);
};

export const loadPostsAPI = (lastId?: number) => {
  return axios.get(`/posts?lastId=${lastId || 0}`).then((response) => response.data);
};

export function likePostAPI(data: number) {
  return axios.patch(`/post/${data}/like`).then((response) => response.data);
}

export function unlikePostAPI(data: number) {
  return axios.delete(`/post/${data}/like`).then((response) => response.data);
}

export function uploadImagesAPI<T>(data: FormData) {
  return axios.post<T>('/post/images', data).then((response) => response.data);
}

export function retweetAPI(data: number) {
  return axios.post(`/post/${data}/retweet`).then((response) => response.data);
}

export function loadUserPostsAPI(data: number, lastId?: number) {
  return axios.get(`/user/${data}/posts?lastId=${lastId || 0}`).then((response) => response.data);
}

export function loadHashtagPostsAPI(data: string, lastId?: number) {
  return axios.get(`/hashtag/${encodeURIComponent(data)}?lastId=${lastId || 0}`).then((response) => response.data);
}
