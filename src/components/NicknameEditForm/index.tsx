import { Input } from 'antd';
import { FormWrapper } from '@/components/NicknameEditForm/styles';
import * as React from 'react';
import { useCallback } from 'react';
import { changeNicknameAPI } from '@/apis/user';
import { useQuery, useQueryClient } from 'react-query';
import User from '@/interfaces/user';
import useInput from '@/hooks/useInput';

const NicknameEditForm = () => {
  const queryClient = useQueryClient();
  const { data: me } = useQuery<User>('user');
  const [nickname, onChangeNickname] = useInput<string>(me?.nickname || '');

  const onSubmit = useCallback(() => {
    if (!me) {
      return alert('로그인 후 이용 바랍니다.');
    }
    changeNicknameAPI(nickname).then((data) => {
      const user: User = {
        ...me,
        nickname: data.nickname,
      };
      queryClient.setQueryData<User>('user', user);
    });
  }, [me, nickname, queryClient]);

  return (
    <FormWrapper>
      <Input.Search
        value={nickname}
        onChange={onChangeNickname}
        addonBefore="닉네임"
        enterButton="수정"
        onSearch={onSubmit}
      />
    </FormWrapper>
  );
};

export default NicknameEditForm;
