import { Controller, useForm } from 'react-hook-form';
import { FormWrapper } from '@/components/PostForm/styles';
import { Button, Input } from 'antd';
import { ChangeEventHandler, useCallback, useRef, useState } from 'react';
import { Callbacks } from 'rc-field-form/lib/interface';
import { useMutation, useQueryClient } from 'react-query';
import Post from '@/interfaces/post';
import { AxiosError } from 'axios';
import { addPost, uploadImagesAPI } from '@/apis/post';
import Image from 'next/image';
import { backUrl } from '@/config/config';

interface PostFormType {
  content: string;
  image: File[];
}

const PostForm = () => {
  const queryClient = useQueryClient();
  const imageInput = useRef<HTMLInputElement>(null);
  const { control, handleSubmit, setValue } = useForm<PostFormType>();
  const [loading, setLoading] = useState(false);
  // const [imagePaths] = useFilePaths(images);
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const mutation = useMutation<Post, AxiosError, FormData>('posts', addPost, {
    onMutate: () => {
      setLoading(true);
    },
    onError: (error) => {
      alert(error.response?.data);
    },
    onSuccess: () => {
      setValue('content', '');
      setImagePaths([]);
      queryClient.refetchQueries('posts');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
  const onSubmit: Callbacks['onFinish'] = useCallback(
    () =>
      handleSubmit((data) => {
        if (!data.content || !data.content.trim()) {
          return alert('게시글을 작성하세요.');
        }
        const formData = new FormData();
        imagePaths.forEach((p) => {
          formData.append('image', p);
        });
        formData.append('content', data.content);
        mutation.mutate(formData);
      }),
    [handleSubmit, imagePaths, mutation],
  );
  const onClickImageUpload = useCallback(() => {
    imageInput.current?.click();
  }, []);

  const onChangeImages: ChangeEventHandler<HTMLInputElement> = useCallback((e) => {
    const imageFormData = new FormData();
    [].forEach.call(e.target.files, (f: File) => {
      imageFormData.append('image', f);
    });
    uploadImagesAPI<string>(imageFormData).then((result) => {
      setImagePaths((prev) => prev.concat(result));
    });
  }, []);

  const onRemoveImage = useCallback(
    (index: number) => () => {
      setImagePaths((prev) => prev.filter((v, i) => i !== index));
    },
    [],
  );

  return (
    <FormWrapper encType="multipart/form-data" onFinish={onSubmit}>
      <Controller
        render={({ field }) => <Input.TextArea {...field} maxLength={140} placeholder="어떤 신기한 일이 있었나요?" />}
        name="content"
        control={control}
      />
      <div>
        <input style={{ display: 'none' }} type="file" multiple ref={imageInput} onChange={onChangeImages} />
        <Button onClick={onClickImageUpload}>이미지 업로드</Button>
        <Button type="primary" style={{ float: 'right' }} htmlType="submit" loading={loading}>
          짹짹
        </Button>
      </div>
      <div>
        {imagePaths.map((v, i) => (
          <div key={v} style={{ display: 'inline-block' }}>
            <Image src={v.replace(/\/thumb\//, '/original/')} style={{ width: '200px' }} alt={v} />
            <div>
              <Button onClick={onRemoveImage(i)}>제거</Button>
            </div>
          </div>
        ))}
      </div>
    </FormWrapper>
  );
};

export default PostForm;
