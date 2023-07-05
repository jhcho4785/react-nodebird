import User from '@/interfaces/user';
import Comment from '@/interfaces/comment';

export default interface Post {
  id: number;
  content: string;
  Likers: Partial<User>[];
  Images: Array<{ src: string }>;
  RetweetId?: number;
  Retweet?: Post;
  User: Partial<User> & { id: number };
  createdAt: string;
  Comments: Comment[];
}
