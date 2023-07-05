import { FC, useCallback, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import Post from '@/interfaces/post';
import { InfiniteData, useQuery, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import { addCommentAPI } from '@/apis/post';
import { loadMyInfoAPI } from '@/apis/user';

interface CommentFormType {
  comment: string;
}

const CommentForm: FC<{ post: Post }> = ({ post }) => {
  const queryClient = useQueryClient();
  const { data: me } = useQuery<User>('user', loadMyInfoAPI);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, setValue } = useForm<CommentFormType>();

  const onSubmitComment = useCallback(
    () =>
      handleSubmit((data) => {
        if (me) {
          setLoading(true);
          addCommentAPI({ content: data.comment, postId: post.id, userId: me.id })
            .then((comment) => {
              queryClient.setQueryData<InfiniteData<Post[]>>('posts', (posts) => {
                const found = posts?.pages.flat().find((v) => v.id === post.id);
                if (found) {
                  found.Comments.unshift(comment);
                }
                return {
                  pageParams: posts?.pageParams || [],
                  pages: posts?.pages || [],
                };
              });
              setValue('comment', '');
            })
            .finally(() => {
              setLoading(false);
            });
        }
      }),
    [handleSubmit, me, post.id, queryClient, setValue],
  );

  return (
    <Form onFinish={onSubmitComment}>
      <Form.Item style={{ position: 'relative', margin: 0 }}>
        <Controller render={({ field }) => <Input.TextArea {...field} rows={4} />} name="comment" control={control} />
        <Button
          style={{ position: 'absolute', right: 0, bottom: -40, zIndex: 1 }}
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          삐약
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CommentForm;
