import React from 'react';
import { Upload, Icon, Modal, message } from 'antd';
import DI from '../../di';
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
    const uptoken = qiniuToken ? qiniuToken.token : '';
    const bucketUrl = qiniuToken ? qiniuToken.bucketUrl : '';
    this.setState({ uptoken, bucketUrl });
    if (value) {
      const valueList = value.split(',');
      if (valueList.length !== this.state.fileList.length) {
        const fileList = [];

        valueList.forEach((img, index) => {
          fileList.push({
            uid: ((index + 1) * (-1)),
            url: img
          });
        });

        this.setState({ fileList });
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
      const valueList = this.props.value.split(',');
      if ((file && file.status === 'done') || (valueList.length !== fileList.length)) {
        const urlArray = [];
        fileList.forEach((img) => {
          urlArray.push(img.url);
        });
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
