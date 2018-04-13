import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Form, Modal, Button, Icon, Radio } from 'antd';
import styles from './table-themes-board.styl';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@Form.create()
export default class TableThemesBoard extends React.Component {

  static propTypes = {
    form: PropTypes.object,
    offlineThemes: PropTypes.object,
    offlineColumns: PropTypes.array,
    getTableColumnsWidth: PropTypes.func,
    resetTableThemes: PropTypes.func
  };

  state = {
    visible: false,
    resetThemes: {}
  };

  componentWillMount() {
    const { offlineThemes } = this.props;
    const resetThemes = _.cloneDeep(offlineThemes);
    this.setState({ resetThemes });
  }

  onShow() {
    const { getTableColumnsWidth, offlineColumns } = this.props;
    const needGetColumnsWidth = !(_.filter(offlineColumns, (c) => (c.show))[0].referenceWidth);
    if (needGetColumnsWidth) {
      getTableColumnsWidth().then(() => {
        this.initResetThemes();
      });
    } else {
      this.initResetThemes();
    }
  }

  onCancel() {
    const { form } = this.props;
    form.resetFields();
    this.setState({ visible: false });
  }

  onConfirm() {
    const { form, resetTableThemes } = this.props;
    form.validateFields((errors, values) => {
      if (!errors) {
        const resetThemes = { ...values };
        resetTableThemes(resetThemes);
        this.onCancel();
      }
    });
  }

  onReset() {
    const { resetTableThemes } = this.props;
    const resetThemes = {};
    resetTableThemes(resetThemes);
    this.onCancel();
  }

  initResetThemes() {
    const { offlineThemes } = this.props;
    const resetThemes = _.cloneDeep(offlineThemes);
    this.setState({ visible: true, resetThemes });
  }

  render() {
    const { form } = this.props;
    const { resetThemes, visible } = this.state;
    const { getFieldDecorator } = form;
    const labelCol = { span: 4 };
    const wrapperCol = { span: 16 };
    const layout = {
      labelCol,
      wrapperCol
    };
    const defaultTableComponent = (
      <table className={styles.tableBordered}>
        <tbody><tr><td /></tr></tbody>
      </table>
    );

    return (
      <div className={styles.container} >
        <a
          className={styles.themes}
          onClick={::this.onShow}
        >
          <Icon type="smile-o" />
        </a>
        <Modal
          title="主题控制面板"
          width="50%"
          visible={visible}
          onCancel={::this.onCancel}
          footer={null}
          className={styles.ttbModal}
        >
          <Form>
            <FormItem
              {...layout}
              label="表格尺寸"
            >
              {getFieldDecorator('tableSize', {
                initialValue: resetThemes.tableSize || 'default',
                rules: [
                  { required: false }
                ]
              })(
                <RadioGroup>
                  <RadioButton value="default" >
                    <div className={styles.tableDefault}>
                      <div>默认表格</div>
                      {defaultTableComponent}
                    </div>
                  </RadioButton>
                  <RadioButton value="middle" >
                    <div className={styles.tableDefault}>
                      <div>中等表格</div>
                      <table className={styles.tableSizeMiddle}>
                        <tbody><tr><td /></tr></tbody>
                      </table>
                    </div>
                  </RadioButton>
                  <RadioButton value="small" >
                    <div className={styles.tableDefault}>
                      <div>迷你表格</div>
                      <table className={styles.tableSizeSmall}>
                        <tbody><tr><td /></tr></tbody>
                      </table>
                    </div>
                  </RadioButton>
                </RadioGroup>
              )}
            </FormItem>

            <FormItem
              {...layout}
              label="是否网格"
            >
              {getFieldDecorator('tableBordered', {
                initialValue: resetThemes.tableBordered || 'false',
                rules: [
                  { required: false }
                ]
              })(
                <RadioGroup>
                  <RadioButton value="false" >
                    <div className={styles.tableDefault}>
                      <div>无网格</div>
                      {defaultTableComponent}
                    </div>
                  </RadioButton>
                  <RadioButton value="true" >
                    <div className={styles.tableDefault}>
                      <div>有网格</div>
                      <table className={styles.tableBordered}>
                        <thead><tr><th /><th /><th /><th /></tr></thead>
                        <tbody>
                          <tr><td /><td /><td /><td /></tr>
                          <tr><td /><td /><td /><td /></tr>
                        </tbody>
                      </table>
                    </div>
                  </RadioButton>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              {...layout}
              label="头部固定"
            >
              {getFieldDecorator('tableFixedHeader', {
                initialValue: resetThemes.tableFixedHeader || 'false',
                rules: [
                  { required: false }
                ]
              })(
                <RadioGroup>
                  <RadioButton value="false" >
                    <div className={styles.tableDefault}>
                      <div>无固定</div>
                      {defaultTableComponent}
                    </div>
                  </RadioButton>
                  <RadioButton value="true" >
                    <div className={styles.tableDefault}>
                      <div>有固定</div>
                      <table className={styles.tableBordered}>
                        <thead><tr><th /></tr></thead>
                        <tbody><tr><td /></tr></tbody>
                      </table>
                    </div>
                  </RadioButton>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              {...layout}
              label="两侧固定"
            >
              {getFieldDecorator('tableFixedSides', {
                initialValue: resetThemes.tableFixedSides || 'none',
                rules: [
                  { required: false }
                ]
              })(
                <RadioGroup>
                  <RadioButton value="none" >
                    <div className={styles.tableDefault}>
                      <div>普通格式</div>
                      {defaultTableComponent}
                    </div>
                  </RadioButton>
                  <RadioButton value="onlyLeft" >
                    <div className={styles.tableDefault}>
                      <div>左侧固定</div>
                      <table className={`${styles.tableBordered} ${styles.tableBorderedLeft}`}>
                        <thead><tr><th /><th /><th /><th /></tr></thead>
                        <tbody>
                          <tr><td /><td /><td /><td /></tr>
                          <tr><td /><td /><td /><td /></tr>
                        </tbody>
                      </table>
                    </div>
                  </RadioButton>
                  <RadioButton value="onlyRight" >
                    <div className={styles.tableDefault}>
                      <div>右侧固定</div>
                      <table className={`${styles.tableBordered} ${styles.tableBorderRight}`}>
                        <thead><tr><th /><th /><th /><th /></tr></thead>
                        <tbody>
                          <tr><td /><td /><td /><td /></tr>
                          <tr><td /><td /><td /><td /></tr>
                        </tbody>
                      </table>
                    </div>
                  </RadioButton>
                  <RadioButton value="bothSides" >
                    <div className={styles.tableDefault}>
                      <div>两侧固定</div>
                      <table className={`${styles.tableBordered} ${styles.tableBorderBoth}`}>
                        <thead><tr><th /><th /><th /><th /></tr></thead>
                        <tbody>
                          <tr><td /><td /><td /><td /></tr>
                          <tr><td /><td /><td /><td /></tr>
                        </tbody>
                      </table>
                    </div>
                  </RadioButton>
                </RadioGroup>
              )}
            </FormItem>
            <FormItem
              {...layout}
              label="点击搜索"
            >
              {getFieldDecorator('searchButton', {
                initialValue: resetThemes.searchButton || 'hide',
                rules: [
                  { required: false }
                ]
              })(
                <RadioGroup>
                  <RadioButton value="hide" >隐藏搜索按钮</RadioButton>
                  <RadioButton value="show" >显示搜索按钮</RadioButton>
                </RadioGroup>
              )}
            </FormItem>

            <FormItem
              wrapperCol={{ offset: 4 }}
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
              >重置主题</Button>
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}
