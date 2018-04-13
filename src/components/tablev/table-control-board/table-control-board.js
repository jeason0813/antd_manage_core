import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Sortable from 'sortablejs';
import { Form, Modal, Button, Switch, Icon, InputNumber, Radio } from 'antd';
import styles from './table-control-board.styl';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@Form.create()
export default class TableControlBoard extends React.Component {

  static propTypes = {
    form: PropTypes.object,
    offlineColumns: PropTypes.array,
    getTableColumnsWidth: PropTypes.func,
    resetTableConfig: PropTypes.func
  };

  state = {
    visible: false,
    resetColumns: []
  };

  onShow() {
    const { getTableColumnsWidth, offlineColumns } = this.props;
    const needGetColumnsWidth = !(_.filter(offlineColumns, (c) => (c.show))[0].referenceWidth);
    if (needGetColumnsWidth) {
      getTableColumnsWidth().then(() => {
        this.initResetColumns();
      });
    } else {
      this.initResetColumns();
    }
  }

  onCancel() {
    this.setState({ visible: false });
  }

  onChange(e) {
    const { resetColumns } = this.state;
    if (e.key === 'width') {
      resetColumns[e.index].referenceWidth = e.value;
    }
    if (e.key === 'fixedWidth') {
      resetColumns[e.index].width =
        resetColumns[e.index].width || resetColumns[e.index].referenceWidth || 120;
    }
    if (e.key === 'textAlign') {
      resetColumns[e.index].className = `column-align-${e.value}`;
    }
    resetColumns[e.index][e.key] = e.value;
    delete resetColumns[e.index].textAlign;
    this.setState({ resetColumns });
  }

  onConfirm() {
    const { resetTableConfig } = this.props;
    const { resetColumns } = this.state;
    const orderRefs = this.orderRefs;
    const newOrder = this.getOrder(orderRefs[0]);
    const newResetColumns = this.sortColumnByOrder(resetColumns, newOrder);
    resetTableConfig(newResetColumns).then(() => {
      this.onCancel();
    });
  }

  onReset() {
    const { resetTableConfig } = this.props;
    resetTableConfig([], true).then(() => {
      this.onCancel();
    });
  }

  onEnd() {}

  getOrder = (o) => o.toArray().map(Number);

  initResetColumns() {
    const { offlineColumns } = this.props;
    const resetColumns = _.cloneDeep(offlineColumns);
    _.each(resetColumns, (column, index) => {
      resetColumns[index].priority = index + 1;
    });
    this.orderRefs = [];
    this.setState({ visible: true, resetColumns, listKey: Date.now() });
  }

  orderRefs = [];

  sortableGroupDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      const options = {
        draggable: 'tr',
        group: 'tableColumn',
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
    });
    return newColumns;
  }

  render() {
    const { visible, resetColumns, listKey } = this.state;

    return (
      <div className={styles.container} >
        <a
          className={styles.setting}
          onClick={::this.onShow}
        >
          <Icon type="setting" />
        </a>
        <Modal
          title="列表控制面板"
          width="55%"
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
                <th>定宽</th>
                <th>宽度(px)</th>
                <th>默认宽度</th>
                <th>对齐</th>
              </tr>
            </thead>
            <tbody ref={this.sortableGroupDecorator}>
              {_.map(resetColumns, (each, index) => (
                <tr key={index} data-id={each.priority} >
                  <td>{each.title}</td>
                  <td>
                    <FormItem>
                      <Switch
                        checked={each.show}
                        onChange={(e) => this.onChange({
                          value: e,
                          index,
                          key: 'show'
                        })}
                      />
                    </FormItem>
                  </td>
                  <td>
                    <FormItem>
                      <Switch
                        checked={each.fixedWidth}
                        onChange={(e) => this.onChange({
                          value: e,
                          index,
                          key: 'fixedWidth'
                        })}
                      />
                    </FormItem>
                  </td>
                  <td>
                    <FormItem>
                      <InputNumber
                        value={each.width}
                        onChange={(e) => this.onChange({
                          value: e,
                          index,
                          key: 'width'
                        })}
                      />
                    </FormItem>
                  </td>
                  <td>
                    <FormItem>
                      <InputNumber
                        value={each.referenceWidth}
                        disabled
                      />
                    </FormItem>
                  </td>
                  <td>
                    <FormItem>
                      <RadioGroup
                        value={each.className ? each.className.split('-').pop() : 'left'}
                        onChange={(e) => this.onChange({
                          value: e.target.value,
                          index,
                          key: 'textAlign'
                        })}
                      >
                        <RadioButton value="left" >左对齐</RadioButton>
                        <RadioButton value="center" >居中</RadioButton>
                        <RadioButton value="right" >右对齐</RadioButton>
                      </RadioGroup>
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
            >重置列表</Button>
          </FormItem>
        </Modal>
      </div>
    );
  }
}
