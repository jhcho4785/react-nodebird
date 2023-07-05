import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';
import { dehydrate, QueryClient, useQuery } from 'react-query';
import { loadMyInfoAPI } from '@/apis/user';
import { loadPostAPI } from '@/apis/post';
import AppLayout from '@/components/AppLayout';
import PostCard from '@/components/PostCard';
import Post from '@/interfaces/post';
import Head from 'next/head';

const SinglePost = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: singlePost } = useQuery<Post>(['post', id], () => loadPostAPI(Number(id)));

  if (!singlePost) {
    return <div>존재하지 않는 게시물입니다.</div>;
  }

  return (
    <AppLayout>
      <Head>
        <title>
          {singlePost.User.nickname}
          님의 글
        </title>
        <meta name="description" content={singlePost.content} />
        {/*og: 카카오톡 등 공유 시 미리보기에 표시됨*/}
        <meta property="og:title" content={`${singlePost.User.nickname}님의 게시글`} />
        <meta property="og:description" content={singlePost.content} />
        <meta
          property="og:image"
          content={singlePost.Images[0] ? singlePost.Images[0].src : 'https://nodebird.com/favicon.ico'}
        />
        <meta property="og:url" content={`https://nodebird.com/post/${id}`} />
      </Head>
      <PostCard post={singlePost} />
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const id = context.params?.id as string;
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery('user', () => loadMyInfoAPI());
  await queryClient.prefetchQuery(['post', id], () => loadPostAPI(Number(id)));

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  };
};

export default SinglePost;
