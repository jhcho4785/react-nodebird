import { FC, ReactNode, useCallback } from 'react';
import Link from 'next/link';
import { Col, Menu, MenuProps, Row } from 'antd';
import UserProfile from '@/components/UserProfile';
import LoginForm from '@/components/LoginForm';
import { useQuery } from 'react-query';
import User from '@/interfaces/user';
import { loadMyInfoAPI } from '@/apis/user';
import { SearchInput } from '@/components/AppLayout/styles';
import useInput from '@/hooks/useInput';
import Router from 'next/router';

interface Props {
  children: ReactNode;
}

const AppLayout: FC<Props> = ({ children }) => {
  const { data: me } = useQuery<User>('user', loadMyInfoAPI);
  const [searchInput, onChangeSearchInput] = useInput('');

  const onSearch = useCallback(() => {
    Router.push(`/hashtag/${searchInput}`);
  }, [searchInput]);

  const items: MenuProps['items'] = [
    {
      // label: '노드버드',
      key: 'index',
      icon: (
        <Link href="/">
          <a>노드버드</a>
        </Link>
      ),
    },
    {
      // label: '프로필',
      key: 'profile',
      icon: (
        <Link href="/profile">
          <a>프로필</a>
        </Link>
      ),
    },
    {
      // label: '해시태그',
      key: 'hashtag',
      icon: <SearchInput enterButton value={searchInput} onChange={onChangeSearchInput} onSearch={onSearch} />,
    },
    {
      // label: '회원가입',
      key: 'signup',
      icon: (
        <Link href="/signup">
          <a>회원가입</a>
        </Link>
      ),
    },
  ];

  return (
    <>
      <Menu mode="horizontal" items={items} />
      <Row gutter={8}>
        <Col xs={24} md={6}>
          {me ? <UserProfile /> : <LoginForm />}
        </Col>
        <Col xs={24} md={12}>
          {children}
        </Col>
        <Col xs={24} md={6}>
          <a href="https://liss.co.kr/" target="_black" rel="noreferrer noopener">
            Made by Arumnuri
          </a>
        </Col>
      </Row>
    </>
  );
};

export default AppLayout;
