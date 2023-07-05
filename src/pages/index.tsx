import AppLayout from '@/components/AppLayout';
import PostForm from '@/components/PostForm';
import PostCard from '@/components/PostCard';
import { dehydrate, QueryClient, useInfiniteQuery, useQuery } from 'react-query';
import User from '@/interfaces/user';
import Post from '@/interfaces/post';
import { loadPostsAPI } from '@/apis/post';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { loadMyInfoAPI } from '@/apis/user';
import { GetServerSidePropsContext } from 'next';
import axios from 'axios';

export const getKey = (pageIndex: number, previousPageData: Post[] | null) => {
  // reached the end
  if (previousPageData && !previousPageData.length) return null;

  // first page, we don't have `previousPageData`
  if (pageIndex === 0) return `/posts?lastId=0`;

  // add the cursor to the API endpoint
  return `/posts?lastId=${previousPageData?.[previousPageData?.length - 1].id || 0}&limit=10`;
};

const Home = () => {
  // const [height, setHeight] = useState(0);
  const [ref, inView] = useInView();
  const { data: me } = useQuery<User>(['user'], loadMyInfoAPI);
  const { data, isLoading, fetchNextPage } = useInfiniteQuery<Post[]>(
    'posts',
    ({ pageParam = '' }) => loadPostsAPI(pageParam),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.[lastPage.length - 1]?.id;
      },
    },
  );

  const mainPosts = data?.pages.flat();
  const isEmpty = data?.pages[0].length === 0;
  const isReachingEnd = isEmpty || (data && data.pages[data.pages.length - 1]?.length < 10);
  const hasMorePosts = !isEmpty && !isReachingEnd;
  const readToLoad = hasMorePosts && !isLoading;

  // useEffect(() => {
  //   setHeight(document.documentElement.clientHeight);
  // }, []);

  useEffect(() => {
    if (inView && readToLoad) {
      fetchNextPage();
    }
  }, [inView, readToLoad, fetchNextPage]);

  return (
    <AppLayout>
      {me && <PostForm />}
      {/*{mainPosts && (*/}
      {/*  <FixedSizeList*/}
      {/*    height={height}*/}
      {/*    itemCount={mainPosts.length}*/}
      {/*    itemSize={1000}*/}
      {/*    width="100%"*/}
      {/*    // style={{ overflow: 'hidden' }}*/}
      {/*  >*/}
      {/*    {({ index, style }) => {*/}
      {/*      if (index > mainPosts.length - 5) {*/}
      {/*        fetchNextPage();*/}
      {/*      }*/}
      {/*      return (*/}
      {/*        <div style={style}>*/}
      {/*          <PostCard key={mainPosts[index].id} post={mainPosts[index]} />*/}
      {/*        </div>*/}
      {/*      );*/}
      {/*    }}*/}
      {/*  </FixedSizeList>*/}
      {/*)}*/}
      {mainPosts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={readToLoad ? ref : undefined} style={{ height: 50, background: 'yellow' }} />
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const queryClient = new QueryClient();
  await queryClient.prefetchInfiniteQuery('posts', () => loadPostsAPI());
  await queryClient.prefetchQuery('user', () => loadMyInfoAPI());
  return {
    props: { dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))) },
  };
};

export default Home;
