import { Button, Card, List } from 'antd';
import { StopOutlined } from '@ant-design/icons';
import { FC, useCallback } from 'react';
import User from '@/interfaces/user';
import { removeFollowerAPI, unfollowAPI } from '@/apis/user';
import { useQueryClient } from 'react-query';

interface Props {
  header: string;
  data?: Partial<User>[];
  onClickMore: () => void;
  loading: boolean;
  hasNext?: boolean;
}

const FollowList: FC<Props> = ({ header, data, onClickMore, loading, hasNext }) => {
  const queryClient = useQueryClient();
  const onCancel = useCallback(
    (id: number) => () => {
      if (header === '팔로잉') {
        unfollowAPI(id).then(() => queryClient.refetchQueries('followings'));
      }
      removeFollowerAPI(id).then(() => queryClient.refetchQueries('followers'));
    },
    [header, queryClient],
  );

  return (
    <List
      style={{ marginBottom: 20 }}
      grid={{ gutter: 4, xs: 2, md: 3 }}
      size="small"
      header={<div>{header}</div>}
      loadMore={
        hasNext && (
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <Button loading={loading} onClick={onClickMore}>
              더 보기
            </Button>
          </div>
        )
      }
      bordered
      dataSource={data}
      renderItem={(item) => (
        <List.Item style={{ marginTop: 20 }}>
          {item.id && (
            <Card actions={[<StopOutlined key="stop" onClick={onCancel(item.id)} />]}>
              <Card.Meta description={item.nickname} />
            </Card>
          )}
        </List.Item>
      )}
    ></List>
  );
};

export default FollowList;
