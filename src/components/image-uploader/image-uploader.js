import React from 'react';
import _ from 'lodash';
import DI from '../../di';
import message from '../message/message';
import { Upload, Icon, Modal } from 'antd';
import styles from './image-uploader.styl';

export default class ImageUploader extends React.Component {
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
    limit: React.PropTypes.number,
    qiniuToken: React.PropTypes.object
  };

  state = { fileList: [], previewImageUrl: '', previewVisible: false };

  componentWillReceiveProps(nextProps) {
    const { qiniuToken, value } = nextProps;
    const { fileList } = this.state;
    const uptoken = qiniuToken ? qiniuToken.token : '';
    const bucketUrl = qiniuToken ? qiniuToken.bucketUrl : '';
    this.setState({ uptoken, bucketUrl });
    if (value) {
      const valueList = value.split(',');
      if (valueList.length !== fileList.length) {
        const tmpFileList = [];

        valueList.forEach((img, index) => {
          tmpFileList.push({
            uid: ((index + 1) * (-1)),
            url: img
          });
        });

        this.setState({ fileList: tmpFileList });
      }
    } else {
      this.setState({ fileList: [], previewImageUrl: '', previewVisible: false });
    }
  }

  onFileChange(info) {
    const { bucketUrl } = this.state;
    const { file, fileList } = info;
    const that = this;

    if (file && file.status === 'done') {
      file.url = `${bucketUrl}/${file.response.key}`;
    }
    if (file && file.status === 'error') {
      message.error(`上传失败 请刷新页面后重试 ${file.error}`);
    }
    this.setState({ fileList }, () => {
      const urlArray = _.map(fileList, 'url');
      if ((urlArray.length === 0) || (urlArray[urlArray.length - 1] !== undefined)) {
        that.onFormChange(urlArray.join(','));
      }
    });
  }

  onFormChange(e) {
    const { onChange } = this.props;
    if (onChange) {
      onChange(e);
    }
  }

  showPreview(file) {
    this.setState({
      previewImageUrl: file.url || file.thumbUrl,
      previewVisible: true
    });
  }

  hidePreview() {
    this.setState({ previewImageUrl: '', previewVisible: false });
  }

  render() {
    const { limit } = this.props;
    const { fileList, previewImageUrl, previewVisible, uptoken } = this.state;
    const uploaderConfig = {
      action: DI.get('config').get('qiniu.url'),
      listType: 'picture-card',
      fileList,
      onPreview: (file) => this.showPreview(file),
      onChange: (info) => this.onFileChange(info),
      data: {
        token: uptoken
      }
    };
    const uploaderButton = (
      <div className={styles.uploaderButton}>
        <Icon
          type="plus"
          style={{ fontSize: 28, color: '#D8D8D8' }}
        />
        <p
          className={styles.uploaderInfo}
        >上传图片</p>
      </div>
    );

    return (
      <div>
        <Upload
          {...uploaderConfig}
        >
          {(limit && fileList.length >= limit) ? null : uploaderButton}
        </Upload>

        <Modal
          visible={previewVisible}
          onCancel={::this.hidePreview}
          footer={null}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImageUrl} />
        </Modal>
      </div>
    );
  }
}
