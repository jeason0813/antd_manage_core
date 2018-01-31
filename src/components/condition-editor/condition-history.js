import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Table, Popover } from 'antd';
import styles from './condition-history.styl';
import _ from 'lodash';
import { datetimeFormat } from '../../utils/common';
import ConditionPreview from './blocks/condition-preview';
import { arrayToStateConditions } from './conditions-utils';
import DI from '../../di';

export default class ConditionHistory extends React.Component {

  static defaultProps = {
    fieldConfigs: {},
    userFieldConfigs: {},
    actionConfigs: {},
    shortcutConfigs: {},
    onUse: _.noop,
    advanced: true,
    historyOfflineMaxSize: DI.get('config').get(
      'core.conditionEditor.historyOfflineMaxSize'
    )
  };

  static propTypes = {
    name: PropTypes.string,
    fieldConfigs: PropTypes.object,
    userFieldConfigs: PropTypes.object,
    actionConfigs: PropTypes.object,
    shortcutConfigs: PropTypes.any,
    onUse: PropTypes.func,
    advanced: PropTypes.bool,
    historyOfflineMaxSize: PropTypes.number,
    store: PropTypes.object
  };

  constructor() {
    super();
    this.store = DI.get('offlineStorageFactory')(
      DI.get('config').get('core.conditionEditor.historyStorageName')
    );
  }

  state = {
    historyConditions: [],
    visible: false
  };

  componentWillMount() {
    const { name } = this.props;
    this.store.get(name).then((historyConditions) => {
      if (historyConditions) {
        let dataKeyChanged = false;
        historyConditions.map((h) => {
          const c = h;
          const conditions = arrayToStateConditions(c.conditions, this);
          let userConditions = '';
          if (c.userConditions) {
            userConditions = arrayToStateConditions(c.userConditions, this, true);
          }
          if (conditions.length === 0 && userConditions.length === 0) {
            dataKeyChanged = true;
          } else {
            c.preview = conditions;
            c.userPreview = userConditions;
          }
          return conditions;
        });
        if (dataKeyChanged) {
          this.store.clear(name);
        } else {
          this.setState({
            historyConditions
          });
        }
      }
    });
  }

  onShow() {
    this.setState({
      visible: true
    });
  }

  onCancel() {
    this.setState({
      visible: false
    });
  }

  onUseProxy(e) {
    const index = e.target.getAttribute('data-index');
    const { historyConditions } = this.state;
    const { onUse } = this.props;
    onUse({ value: historyConditions[index] });
    this.onCancel();
  }

  onDelete(e) {
    const index = e.target.getAttribute('data-index');
    const { historyConditions } = this.state;
    const { name } = this.props;
    historyConditions.splice(index, 1);
    this.store.add(name, historyConditions).then(() => {
      this.setState({
        historyConditions
      });
    });
  }

  addConditions(conditions, type, userConditions) {
    const { name, historyOfflineMaxSize } = this.props;

    this.store.get(name).then((offlineConditions) => {
      let historyConditions = offlineConditions;

      if (!historyConditions) {
        historyConditions = [];
      }

      historyConditions.splice(
        historyOfflineMaxSize - 2,
        historyConditions.length - 1
      );
      historyConditions.unshift({
        date: new Date,
        type,
        conditions,
        userConditions
      });

      this.store.add(name, historyConditions).then(() => {
        this.setState({
          historyConditions
        });
      });
    });
  }

  render() {
    const { visible } = this.state;
    const { advanced } = this.props;
    let historyConditions = this.state.historyConditions;

    if (!historyConditions) {
      historyConditions = [];
    }

    if (!advanced && historyConditions.length) {
      historyConditions = _.filter(historyConditions, (historyCondition) => {
        if (historyCondition.type === 'ConditionEditor') {
          return false;
        }
        return true;
      });
    }

    const columns = [
      {
        title: '类型',
        dataIndex: 'type',
        render: (text) => {
          if (text === 'ConditionEditor') {
            return (<span className={styles.advanced}>高级搜索</span>);
          }
          return '搜索';
        }
      }, {
        title: '时间',
        dataIndex: 'date',
        key: 'date',
        render: datetimeFormat
      },
      {
        title: '预览',
        key: 'preview',
        render: (text, record) => {
          let conditions = record.preview;
          let userConditions = record.userPreview;
          if (!conditions) {
            conditions = arrayToStateConditions(record.conditions, this);
          }
          if (!userConditions) {
            userConditions = arrayToStateConditions(record.userConditions, this, true);
          }
          const content = (
            <ConditionPreview conditions={conditions} userConditions={userConditions} />
          );
          return (
            <Popover placement="bottom" content={content}>
              <a>预览</a>
            </Popover>
          );
        }
      },
      {
        title: '操作',
        key: 'operation',
        render: (text, record, index) => (
          <div>
            <a data-index={index} onClick={::this.onUseProxy}>使用</a>
            <span className="ant-divider"></span>
            <a data-index={index} onClick={::this.onDelete}>删除</a>
          </div>
        )
      }
    ];

    const pagination = {
      total: historyConditions.length
    };

    return (
      <div className={styles.container}>
        <a onClick={::this.onShow}>搜索历史</a>
        <Modal
          className={styles.modal}
          title="搜索历史"
          visible={visible}
          onCancel={::this.onCancel}
          onOk={::this.onCancel}
        >
          <Table
            dataSource={historyConditions}
            columns={columns}
            pagination={pagination}
            rowKey={record => `${record.type}_${+record.date}`}
            bordered
          />
        </Modal>
      </div>
    );
  }
}
