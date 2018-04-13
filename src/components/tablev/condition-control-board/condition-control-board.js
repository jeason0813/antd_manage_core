import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Sortable from 'sortablejs';
import { Form, Modal, Button, Switch, Icon } from 'antd';
import styles from './condition-control-board.styl';

const FormItem = Form.Item;

@Form.create()
export default class ConditionControlBoard extends React.Component {

  static propTypes = {
    form: PropTypes.object,
    offlineItems: PropTypes.array,
    resetConditionConfig: PropTypes.func
  };

  state = {
    visible: false,
    resetItems: []
  };

  onShow() {
    const { offlineItems } = this.props;
    const resetItems = _.cloneDeep(offlineItems);
    _.each(resetItems, (column, index) => {
      resetItems[index].priority = index + 1;
    });
    this.orderRefs = [];
    this.setState({ visible: true, resetItems, listKey: Date.now() });
  }

  onCancel() {
    this.setState({ visible: false });
  }

  onChange(e) {
    const { resetItems } = this.state;
    resetItems[e.index][e.key] = !resetItems[e.index][e.key];
    this.setState({ resetItems });
  }

  onConfirm() {
    const { resetConditionConfig } = this.props;
    const { resetItems } = this.state;
    const orderRefs = this.orderRefs;
    const newOrder = this.getOrder(orderRefs[0]);
    const newResetColumns = this.sortColumnByOrder(resetItems, newOrder);
    resetConditionConfig(newResetColumns);
    this.onCancel();
  }

  onReset() {
    const { resetConditionConfig } = this.props;
    resetConditionConfig([], true);
    this.onCancel();
  }

  onEnd() {}

  getOrder = (o) => o.toArray().map(Number);

  orderRefs = [];

  sortableGroupDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      const options = {
        draggable: 'tr',
        group: 'conditionColumn',
        animation: 150,
        onEnd: (e) => {
          this.onEnd(e);
        }
      };
      this.orderRefs.push(Sortable.create(componentBackingInstance, options));
    }
  };

  sortColumnByOrder(columns, orderArray) {
    const newColumns = [];
    _.each(orderArray, (value) => {
      newColumns.push(_.find(columns, (column) => (
        column.priority === value
      )));
    });
    _.each(newColumns, (value, index) => {
      delete newColumns[index].priority;
      if (!value.hide) {
        delete newColumns[index].hide;
      }
    });
    return newColumns;
  }

  render() {
    const { visible, resetItems, listKey } = this.state;

    return (
      <div className={styles.container} >
        <a
          className={styles.setting}
          onClick={::this.onShow}
        >
          <Icon type="setting" />
        </a>
        <Modal
          title="搜索控制面板"
          width="28%"
          visible={visible}
          onCancel={::this.onCancel}
          footer={null}
          className={styles.tcbModal}
        >
          <table className={styles.tcbTable} key={listKey}>
            <thead>
              <tr>
                <th>列名</th>
                <th>显示</th>
              </tr>
            </thead>
            <tbody ref={this.sortableGroupDecorator}>
            {_.map(resetItems, (each, index) => (
              <tr key={index} data-id={each.priority} >
                <td>{each.title}</td>
                <td>
                  <FormItem>
                    <Switch
                      checked={!each.hide}
                      onChange={(e) => this.onChange({
                        value: e,
                        index,
                        key: 'hide'
                      })}
                    />
                  </FormItem>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          <FormItem
            style={{ marginTop: 24 }}
          >
            <Button
              type="primary"
              style={{ marginRight: 24 }}
              onClick={() => this.onConfirm()}
            >确定</Button>
            <Button
              type="normal"
              style={{ marginRight: 24 }}
              onClick={() => this.onCancel()}
            >取消</Button>
            <Button
              type="danger"
              onClick={() => this.onReset()}
            >重置</Button>
          </FormItem>
        </Modal>
      </div>
    );
  }
}
