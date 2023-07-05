import { Button, Input } from 'antd';
import { FC, useCallback } from 'react';
import Link from 'next/link';
import { ButtonWrapper, FormWrapper } from '@/components/LoginForm/styles';
import { Callbacks } from 'rc-field-form/lib/interface';
import { Controller, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import { AxiosError } from 'axios';
import { logInAPI } from '@/apis/user';

interface LoginInputType {
  email: string;
  password: string;
}

const LoginForm: FC = () => {
  const queryClient = useQueryClient();
  const { handleSubmit, control } = useForm<LoginInputType>();

  const { mutate, isLoading } = useMutation<User, AxiosError, { email: string; password: string }>(['user'], logInAPI, {
    onMutate: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    },
    //실패 시
    onError: (error) => {
      alert(error.response?.data);
    },
    //성공 시
    onSuccess: (user) => {
      queryClient.setQueryData(['user'], user); //key에 해당하는 상태 업데이트
    },
  });

  const onSubmitForm: Callbacks['onFinish'] = useCallback(
    () =>
      handleSubmit((data) => {
        mutate({ email: data.email, password: data.password });
      }),
    [handleSubmit, mutate],
  );

  return (
    <FormWrapper onFinish={onSubmitForm}>
      <div>
        <label htmlFor="email">이메일</label>
        <br />
        <Controller render={({ field }) => <Input {...field} />} name="email" control={control} defaultValue="" />
      </div>
      <div>
        <label htmlFor="password">비밀번호</label>
        <br />
        <Controller render={({ field }) => <Input {...field} />} name="password" control={control} defaultValue="" />
      </div>
      <ButtonWrapper>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          로그인
        </Button>
        <Link href="/signup">
          <Button>회원가입</Button>
        </Link>
      </ButtonWrapper>
      <div></div>
    </FormWrapper>
  );
};

export default LoginForm;
