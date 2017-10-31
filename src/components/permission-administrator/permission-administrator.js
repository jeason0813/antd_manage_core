import React from 'react';
import DI from '../../di';
import Permission from '../permission/permission';
import Table from '../table/table';

import _ from 'lodash';
import { Tag, Popconfirm, message } from 'antd';
import PermissionAddAdminModal from '../permission-add-admin-modal/permission-add-admin-modal';
import PermissionAdminHasRolePreview from
  '../permission-admin-has-role-preview/permission-admin-has-role-preview';

export default class PermissionAdministrator extends React.Component {

  onAdminHasRolePreviewClose() {
    this.refs.table.fetchData();
  }

  onReset(id) {
    DI.get('permissionHttp').resetAdminKey(id)
      .then(() => {
        message.success('重置成功');
        this.refs.table.fetchData();
      })
      .catch(() => {
        message.error('重置失败');
      });
  }

  columns = [
    {
      title: '账户编号',
      dataIndex: 'account_id',
      show: true,
      draggable: false
    },
    {
      title: '姓名',
      dataIndex: 'real_name',
      show: true
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
      show: true
    },
    {
      title: '所属角色',
      show: true,
      render: (value, record) => (
        <div>
          {_.map(record.permission_roles, (role) =>
            <Tag key={role.id} >
              {role.name}
            </Tag>
          )}
        </div>
      )
    },
    {
      title: '二步验证状态',
      dataIndex: 'key_verified',
      show: true
    },
    {
      title: '操作',
      show: true,
      render: (value) => (
        <div className="table-operation">
          <Permission
            needPermission={['put@/v1/permission/account/:id/roles']}
          >
            <PermissionAdminHasRolePreview
              adminId={value.account_id}
              adminHasRole={value.permission_roles}
              handleClose={::this.onAdminHasRolePreviewClose}
            />
          </Permission>
          <Permission
            needPermission={['delete@/v1/permission/account/:id/administrator']}
          >
            <Popconfirm
              title={`确定要删除ID为:${value.account_id}的数据吗?`}
              okText="是"
              cancelText="否"
              onConfirm={() => this.refs.table.onDelete({ value: value.account_id })}
            >
              <a href="#">删除</a>
            </Popconfirm>
          </Permission>
          <Permission
            needPermission={['put@/v1/permission/account/:id/reset_two_factor_key']}
          >
            <Popconfirm
              title={`确定要为ID:${value.account_id}的重置二步验证吗?`}
              okText="是"
              cancelText="否"
              onConfirm={() => ::this.onReset(value.account_id)}
            >
              <a href="#">重置二步验证</a>
            </Popconfirm>
          </Permission>
        </div>
      )
    }
  ];


  render() {
    const name = 'Administrator';
    const tableConfigs = {
      tableColumnManageConfigs: {
        columns: this.columns,
        name,
        title: (
          <Permission
            needPermission={['post@/v1/permission/account/:id/administrator']}
          >
            <PermissionAddAdminModal
              originData={this}
            />
          </Permission>
        )
      },
      httpService: DI.get('permissionHttp'),
      tableColumnManage: true,
      fetchDataMethodName: 'getAllAdministrators',
      deleteMethodName: 'deleteAdmin'
    };

    return (
      <Table
        ref="table"
        {...tableConfigs}
      />
    );
  }
}
