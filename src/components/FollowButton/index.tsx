import Post from '@/interfaces/post';
import { Button } from 'antd';
import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import { followAPI, loadMyInfoAPI, unfollowAPI } from '@/apis/user';

const FollowButton = ({ post }: { post: Post }) => {
  const queryClient = useQueryClient();
  const { data: me } = useQuery<User>('user', loadMyInfoAPI);
  const [loading, setLoading] = useState(false);
  const isFollowing = me?.Followings.find((v) => v.id === post.User.id);

  const onClickButton = useCallback(() => {
    if (!me) {
      return alert('로그인 후 이용 바랍니다.');
    }
    setLoading(true);
    if (isFollowing) {
      unfollowAPI(post.User.id)
        .then(() => {
          me.Followings = me.Followings.filter((v) => v.id !== post.User.id);
          queryClient.setQueryData<User>('user', me);
        })
        .finally(() => setLoading(false));
    } else {
      followAPI(post.User.id)
        .then(() => {
          me.Followings.push(post.User);
          queryClient.setQueryData<User>('user', me);
        })
        .finally(() => setLoading(false));
    }
  }, [me, isFollowing, post.User, queryClient]);

  if (post.User.id === me?.id) {
    return null;
  }

  return (
    <Button onClick={onClickButton} loading={loading}>
      {isFollowing ? '언팔로우' : '팔로우'}
    </Button>
  );
};

export default FollowButton;
