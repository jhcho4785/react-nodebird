import AppLayout from '@/components/AppLayout';
import Head from 'next/head';
import { Button, Checkbox, Form, Input } from 'antd';
import { Callbacks } from 'rc-field-form/lib/interface';
import { ChangeEventHandler, useCallback, useState } from 'react';
import { Control, Controller, useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import axios, { AxiosError } from 'axios';
import { loadMyInfoAPI, signUpAPI } from '@/apis/user';
import Router from 'next/router';
import { GetServerSidePropsContext } from 'next';
import styled from '@emotion/styled';

interface FormInputType {
  email: string;
  password: string;
  nickname: string;
  passwordCheck: string;
  term: boolean;
  passwordError: boolean;
  termError: boolean;
}

const ErrorMessage = styled.div`
  color: red;
`;
const ButtonWrapper = styled.div`
  margin-top: 10px;
`;

const Signup = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const mutation = useMutation<User, AxiosError, { email: string; password: string; nickname: string }>(
    ['user'],
    signUpAPI,
    {
      onMutate: () => {
        setLoading(true);
      },
      onError: (error) => {
        alert(error.response?.data);
      },
      onSuccess: (data) => {
        queryClient.setQueryData(['user'], data);
        Router.replace('/');
      },
      onSettled: () => {
        setLoading(false);
      },
    },
  );

  const { control, handleSubmit, getValues, setValue } = useForm<FormInputType>({
    defaultValues: {
      term: false,
    },
  });

  const ErrorWatched = ({ control }: { control: Control<FormInputType> }) => {
    const passwordError = useWatch({
      control,
      name: 'passwordError',
      defaultValue: false,
    });

    const termError = useWatch({
      control,
      name: 'termError',
      defaultValue: false,
    });

    return passwordError ? (
      <ErrorMessage>비밀번호가 일치하지 않습니다.</ErrorMessage>
    ) : termError ? (
      <ErrorMessage>약관에 동의하셔야 합니다.</ErrorMessage>
    ) : null;
  };

  const onChangePasswordCheck: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const password = getValues('password');
      setValue('passwordError', password !== e.target.value);
    },
    [getValues, setValue],
  );

  const onChangeTerm: ChangeEventHandler<HTMLInputElement> = useCallback(() => {
    const term = getValues('term');
    setValue('termError', !term);
  }, [getValues, setValue]);

  const onSubmit: Callbacks['onFinish'] = useCallback(
    () =>
      handleSubmit((data) => {
        if (data.password !== data.passwordCheck) {
          setValue('passwordError', true);
          return;
        }
        if (!data.term) {
          setValue('termError', true);
          return;
        }
        mutation.mutate({ email: data.email, password: data.password, nickname: data.nickname });
      }),
    [handleSubmit, mutation, setValue],
  );

  return (
    <AppLayout>
      <Head>
        <title>회원가입 | NodeBird</title>
      </Head>
      <Form onFinish={onSubmit}>
        <div>
          <label htmlFor="user-email">이메일</label>
          <Controller
            render={({ field }) => <Input {...field} name="user-email" type="email" />}
            name="email"
            control={control}
            rules={{ required: true }}
          />
        </div>
        <div>
          <label htmlFor="user-nick">닉네임</label>
          <Controller
            render={({ field }) => <Input {...field} name="user-nick" />}
            name="nickname"
            control={control}
            rules={{ required: true }}
          />
        </div>
        <div>
          <label htmlFor="user-password">비밀번호</label>
          <Controller
            render={({ field }) => <Input {...field} type="password" name="user-password" />}
            name="password"
            control={control}
            rules={{ required: true }}
          />
        </div>
        <div>
          <label htmlFor="user-password-check">비밀번호체크</label>
          <Controller
            render={({ field }) => <Input {...field} type="password" name="user-password-check" />}
            name="passwordCheck"
            control={control}
            rules={{
              required: true,
              onChange: onChangePasswordCheck,
            }}
          />
        </div>
        <div>
          <Controller
            render={({ field }) => (
              <Checkbox
                {...field}
                name="user-term"
                checked={field.value}
                onChange={(e) => field.onChange(e.target.checked)}
              >
                회원가입에 동의합니다.
              </Checkbox>
            )}
            name="term"
            control={control}
            rules={{
              onChange: onChangeTerm,
            }}
          />
        </div>
        <ErrorWatched control={control} />
        <ButtonWrapper>
          <Button htmlType="submit" loading={loading}>
            회원가입
          </Button>
        </ButtonWrapper>
      </Form>
    </AppLayout>
  );
};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const cookie = context.req ? context.req.headers.cookie : '';
  axios.defaults.headers.Cookie = '';
  if (context.req && cookie) {
    axios.defaults.headers.Cookie = cookie;
  }
  const data = await loadMyInfoAPI();
  if (data) {
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

export default Signup;
