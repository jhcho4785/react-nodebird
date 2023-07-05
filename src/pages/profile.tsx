import AppLayout from '@/components/AppLayout';
import Head from 'next/head';
import NicknameEditForm from '@/components/NicknameEditForm';
import FollowList from '@/components/FollowList';
import { useInfiniteQuery, useQuery } from 'react-query';
import User from '@/interfaces/user';
import { useEffect } from 'react';
import Router from 'next/router';
import { loadFollowersAPI, loadFollowingsAPI, loadMyInfoAPI } from '@/apis/user';
import axios, { AxiosError } from 'axios';
import { GetServerSidePropsContext } from 'next';

const Profile = () => {
  const { data: me } = useQuery<User>('user', loadMyInfoAPI);
  const {
    data: followings,
    isLoading: followingsLoading,
    fetchNextPage: fetchNextFollowings,
    error: followingsError,
    hasNextPage: hasNextFollowings,
  } = useInfiniteQuery<User[], AxiosError>('followings', ({ pageParam = 0 }) => loadFollowingsAPI(pageParam), {
    getNextPageParam: (lastPages, pages) => {
      if (lastPages.length < 3) {
        return;
      }
      return pages.length;
    },
  });

  const {
    data: followers,
    isLoading: followersLoading,
    fetchNextPage: fetchNextFollowers,
    error: followersError,
    hasNextPage: hasNextFollowers,
  } = useInfiniteQuery<User[], AxiosError>('followers', ({ pageParam = 0 }) => loadFollowersAPI(pageParam), {
    getNextPageParam: (lastPages, pages) => {
      if (lastPages.length < 3) {
        return;
      }
      return pages.length;
    },
  });

  const followingsData = followings?.pages.flat();
  const followersData = followers?.pages.flat();

  useEffect(() => {
    if (!me?.id) {
      Router.push('/');
    }
  }, [me]);

  if (!me) {
    return '내 정보 로딩 중...';
  }

  if (followersError || followingsError) {
    return <div>팔로잉/팔로워 로딩 중 에러가 발생했습니다.</div>;
  }

  return (
    <>
      <Head>
        <title>내 프로필 | NodeBird</title>
      </Head>
      <AppLayout>
        <NicknameEditForm />
        <FollowList
          header="팔로잉"
          data={followingsData}
          onClickMore={fetchNextFollowings}
          loading={followingsLoading}
          hasNext={hasNextFollowings}
        />
        <FollowList
          header="팔로워"
          data={followersData}
          onClickMore={fetchNextFollowers}
          loading={followersLoading}
          hasNext={hasNextFollowers}
        />
      </AppLayout>
    </>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const data = await loadMyInfoAPI();
  if (!data) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};

export default Profile;
