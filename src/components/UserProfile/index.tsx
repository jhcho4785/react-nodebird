import { Avatar, Card } from 'antd';
import { FC, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import { AxiosError } from 'axios';
import { loadMyInfoAPI, logOutAPI } from '@/apis/user';
import { ButtonWrapper } from '@/components/UserProfile/styles';
import Link from 'next/link';

const UserProfile: FC = () => {
  const queryClient = useQueryClient();
  const { data: me } = useQuery<User>('user', loadMyInfoAPI);
  const { mutate, isLoading } = useMutation<void, AxiosError>(logOutAPI, {
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
    },
  });
  const onLogOut = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <Card
      actions={[
        <div key="twit">
          <Link href={`user/${me?.id}`}>
            <a>
              짹짹
              <br />
              {me?.Posts?.length}
            </a>
          </Link>
        </div>,
        <div key="followings">
          <Link href="/profile">
            <a>
              팔로잉
              <br />
              {me?.Followings?.length}
            </a>
          </Link>
        </div>,
        <div key="followers">
          <Link href="/profile">
            <a>
              팔로워
              <br />
              {me?.Followers?.length}
            </a>
          </Link>
        </div>,
      ]}
    >
      <Card.Meta
        avatar={
          <Link href={`/user/${me?.id}`}>
            <a>
              <Avatar>{me?.nickname?.[0]}</Avatar>
            </a>
          </Link>
        }
        title={me?.nickname}
      />
      <ButtonWrapper onClick={onLogOut} loading={isLoading}>
        로그아웃
      </ButtonWrapper>
    </Card>
  );
};

export default UserProfile;
