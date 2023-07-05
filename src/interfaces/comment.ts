import User from '@/interfaces/user';

export default interface Comment {
  id: string;
  content: string;
  createdAt: string;
  User: Partial<User>;
}
