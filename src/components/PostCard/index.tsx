import { Avatar, Button, Card, List, Popover } from 'antd';
import { FC, useCallback, useState } from 'react';
import { EllipsisOutlined, HeartOutlined, HeartTwoTone, MessageOutlined, RetweetOutlined } from '@ant-design/icons';
import PostImages from '@/components/PostImages';
import CommentForm from '@/components/CommentForm';
import { Comment } from '@ant-design/compatible';
import PostCardContent from '@/components/PostCardContent';
import Post from '@/interfaces/post';
import { InfiniteData, useMutation, useQuery, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import { likePostAPI, removePostAPI, retweetAPI, unlikePostAPI } from '@/apis/post';
import FollowButton from '@/components/FollowButton';
import { loadMyInfoAPI } from '@/apis/user';
import { AxiosError } from 'axios';
import Link from 'next/link';
import dayjs from 'dayjs';

// eslint-disable-next-line no-undef
const PostCard: FC<{ post: Post }> = ({ post }) => {
  const queryClient = useQueryClient();
  const [commentFormOpened, setCommentFormOpened] = useState(false);
  const [loading, setLoading] = useState(false);
  const { data: me } = useQuery<User>('user', loadMyInfoAPI);
  const likeMutation = useMutation<Post, AxiosError, number>(['post', post.id], likePostAPI, {
    onMutate() {
      if (!me) return;
      queryClient.setQueryData<InfiniteData<Post[]>>('posts', (data) => {
        const found = data?.pages.flat().find((v) => v.id === post.id);
        if (found) {
          found.Likers.push({ id: me.id });
        }
        return {
          pageParams: data?.pageParams || [],
          pages: data?.pages || [],
        };
      });
    },
  });
  const unLikeMutation = useMutation<Post, AxiosError, number>(['post', post.id], unlikePostAPI, {
    onMutate() {
      if (!me) return;
      queryClient.setQueryData<InfiniteData<Post[]>>('posts', (data) => {
        const found = data?.pages.flat().find((v) => v.id === post.id);
        if (found) {
          const index = found.Likers.findIndex((v) => v.id === me.id);
          if (index || index === 0) {
            found.Likers.splice(index, 1);
          }
        }
        return {
          pageParams: data?.pageParams || [],
          pages: data?.pages || [],
        };
      });
    },
  });

  const onLike = useCallback(() => {
    if (!me?.id) {
      return alert('로그인이 필요합니다.');
    }
    likeMutation.mutate(post.id);
  }, [likeMutation, me?.id, post.id]);
  const onUnlike = useCallback(() => {
    if (!me?.id) {
      return alert('로그인이 필요합니다.');
    }
    unLikeMutation.mutate(post.id);
  }, [me?.id, post.id, unLikeMutation]);
  const onToggleComment = useCallback(() => {
    setCommentFormOpened((prev) => !prev);
  }, []);

  const onRemovePost = useCallback(() => {
    if (!me?.id) {
      return alert('로그인이 필요합니다.');
    }
    setLoading(true);
    removePostAPI(post.id).finally(() => {
      queryClient.setQueryData<InfiniteData<Post[]>>('posts', (data) => {
        const newData = data?.pages.filter((v) => v.filter((d) => d.id !== post.id));
        return {
          pageParams: data?.pageParams || [],
          pages: newData || [],
        };
      });
      setLoading(false);
    });
  }, [me?.id, post.id, queryClient]);

  const onRetweet = useCallback(() => {
    if (!me?.id) {
      return alert('로그인이 필요합니다.');
    }
    retweetAPI(post.id)
      .then(() => {})
      .catch((e) => alert(e.response?.data));
  }, [me?.id, post.id]);

  const liked = post.Likers.find((v) => me?.id && v.id === me.id);

  return (
    <div style={{ marginBottom: 20 }}>
      <Card
        cover={post.Images?.[0] && <PostImages images={post.Images} />}
        actions={[
          <RetweetOutlined key="retweet" onClick={onRetweet} />,
          liked ? (
            <HeartTwoTone twoToneColor="#eb2f96" key="heart" onClick={onUnlike} />
          ) : (
            <HeartOutlined key="heart" onClick={onLike} />
          ),
          <MessageOutlined key="comment" onClick={onToggleComment} />,
          <Popover
            key="more"
            content={
              <Button.Group>
                {me?.id && post.User.id === me?.id ? (
                  <>
                    <Button>수정</Button>
                    <Button danger onClick={onRemovePost} loading={loading}>
                      삭제
                    </Button>
                  </>
                ) : (
                  <Button>신고</Button>
                )}
              </Button.Group>
            }
          >
            <EllipsisOutlined />
          </Popover>,
        ]}
        title={post.RetweetId ? `${post.User.nickname}님이 리트윗하셨습니다.` : null}
        extra={me?.id && <FollowButton post={post} />}
      >
        {post.RetweetId && post.Retweet ? (
          <Card cover={post.Retweet.Images?.[0] && <PostImages images={post.Retweet.Images} />}>
            <div style={{ float: 'right' }}>{dayjs(post.createdAt).format('YYYY.MM.DD')}</div>
            <Card.Meta
              avatar={
                <Link href={`/user/${post.Retweet.User.id}`}>
                  <a>
                    <Avatar>{post.Retweet.User.nickname?.[0]}</Avatar>
                  </a>
                </Link>
              }
              title={post.User.nickname}
              description={<PostCardContent postData={post.Retweet.content} />}
            />
          </Card>
        ) : (
          <>
            <div style={{ float: 'right' }}>{dayjs(post.createdAt).format('YYYY.MM.DD')}</div>
            <Card.Meta
              avatar={
                <Link href={`/user/${post.User.id}`}>
                  <a>
                    <Avatar>{post.User.nickname?.[0]}</Avatar>
                  </a>
                </Link>
              }
              title={post.User.nickname}
              description={<PostCardContent postData={post.content} />}
            />
          </>
        )}
      </Card>
      {commentFormOpened && (
        <div>
          <CommentForm post={post} />
          <List
            header={`${post.Comments.length}개의 댓글`}
            itemLayout="horizontal"
            dataSource={post.Comments}
            renderItem={(item) => (
              <li>
                <Comment
                  author={item.User.nickname}
                  avatar={
                    <Link href={`/user/${item.User.id}`}>
                      <a>
                        <Avatar>{item.User.nickname}</Avatar>
                      </a>
                    </Link>
                  }
                  content={item.content}
                />
              </li>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default PostCard;
