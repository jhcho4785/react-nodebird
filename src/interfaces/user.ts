import Post from '@/interfaces/post';

export default interface User {
  id: number;
  email: string;
  password: string;
  nickname: string;
  Posts: Post[];
  Followings: Partial<User>[];
  Followers: Partial<User>[];
}
