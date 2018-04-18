import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { Table, Card, Icon, message } from 'antd';
import DI from '../../di';
import HashHistory from '../../router/hash-history';
import OfflineStorge from '../../services/offline-storge';
import AlertError from '../alert-error/alert-error';
import TablevCondition from './tablev-condition/tablev-condition';
import TableControlBoard from './table-control-board/table-control-board';
import TableThemesBoard from './table-themes-board/table-themes-board';
import TableToExcel from '../table-to-excel/table-to-excel';
import styles from './tablev.styl';

import {
  generateQuery, generatePagination,
  generateOfflineColumns, generateFilterColumns,
  compareOfflineConfigs, formatSearchStr
} from './tablev-utils/tablev-utils';

export default class TableV extends React.Component {

  static propTypes = {
    searchObj: PropTypes.object,
    httpService: PropTypes.object,
    fetchDataMethodName: PropTypes.string,
    deleteMethodName: PropTypes.string,
    handleFetchOptions: PropTypes.func,
    onDataChange: PropTypes.func,
    conditionSearch: PropTypes.bool,
    conditionSearchConfigs: PropTypes.object,
    tableProps: PropTypes.object,
    pageSize: PropTypes.number,
    pageSizeChanger: PropTypes.bool,
    formatSorter: PropTypes.func,
    tableColumnManage: PropTypes.bool,
    tableColumnManageConfigs: PropTypes.object,
    formatConditionQuery: PropTypes.func,
    qsFormatSearchQuery: PropTypes.bool,
    exportExcel: PropTypes.bool,
    exportExcelLimit: PropTypes.number,
    exportExcelMethodName: PropTypes.string,
    handleExportExcelOptions: PropTypes.func
  };

  static defaultProps = {
    searchObj: {},
    fetchDataMethodName: 'getAll',
    deleteMethodName: 'delete',
    exportExcel: false,
    onDataChange: _.noop,
    exportExcelLimit: 30000,
    handleFetchOptions: (v) => v,
    handleExportExcelOptions: (v) => v,
    exportExcelMethodName: 'addTableToExcelTask',
    pageSizeChanger: true
  };

  state = {
    data: [],
    pagination: {},
    offlineThemes: {},
    offlineColumns: [],
    filterColumns: [],
    query: {},
    queryString: '',
    visible: false,
    dataLoading: false,
    dataLoadError: false,
    dataLoadErrorMessage: '数据加载失败,点击重新更新...',
    searchStr: ''
  };

  componentWillMount() {
    Promise.all([
      this.initStateQuery(),
      this.initStateColumns(),
      this.initTableThemes()
    ])
      .then(() => {
        this.locationHasChanged();
        this.unsubscribed = HashHistory.listen(::this.locationHasChanged);
      });
  }

  componentWillUnmount() {
    this.unsubscribed();
  }

  onDelete(e) {
    const { httpService, deleteMethodName } = this.props;
    httpService[deleteMethodName](e.value)
      .then(() => {
        message.success('删除成功');
        this.fetchData();
      })
      .catch(() => message.success('删除失败'));
  }

  getTableColumnsWidth() {
    return new Promise((resolve) => {
      const { offlineColumns } = this.state;
      const newOfflineColumns = [];
      const tableElement = ReactDOM.findDOMNode(this.refs.AntdTable);
      const thElements = tableElement.getElementsByTagName('thead')[0].getElementsByTagName('th');
      _.each(offlineColumns, (value) => {
        const thElem = _.find(thElements, (ele) => (ele.innerText === value.title));
        newOfflineColumns.push({
          ...value,
          width: thElem ? thElem.offsetWidth : null,
          referenceWidth: thElem ? thElem.offsetWidth : null
        });
      });
      this.setState({ offlineColumns: newOfflineColumns }, resolve);
    });
  }

  locationHasChanged() {
    const { searchObj } = this.props;
    let searchStr;
    if (!_.isEmpty(searchObj)) {
      searchStr = formatSearchStr(searchObj);
    } else {
      searchStr = HashHistory.location.search.trim().replace(/^[?#&]/, '');
    }
    if (searchStr) {
      this.setState({ searchStr });
    } else {
      this.fetchData();
    }
  }

  initStateQuery() {
    return new Promise((resolve) => {
      const { tableColumnManageConfigs, pageSize } = this.props;
      const { name } = tableColumnManageConfigs;
      let query = {};
      query = generateQuery({ pagination: { pageSize } });
      this.offlineStorgeOfTablePage = new OfflineStorge(
        DI.get('config').get('core.table.configStorageName')
      );
      this.offlineStorgeOfTablePage.get(name)
        .then((offlineConfigs) => {
          if (offlineConfigs && offlineConfigs.pageSize) {
            query = generateQuery(offlineConfigs);
          }
          this.setState({ query }, resolve);
        });
    });
  }

  initStateColumns() {
    return new Promise((resolve) => {
      const { tableColumnManageConfigs } = this.props;
      const { name, columns } = tableColumnManageConfigs;
      let offlineColumns = [];
      let filterColumns = [];
      this.offlineStorgeOfTableColumn = new OfflineStorge(
        DI.get('config').get('core.table.columnManageStorageName')
      );
      this.offlineStorgeOfTableColumn.get(name)
        .then((offlineConfigs) => {
          if (!offlineConfigs || !_.isArray(offlineConfigs) ||
            offlineConfigs.length !== columns.length ||
            compareOfflineConfigs(columns, offlineConfigs).length !== 0) {
            offlineColumns = generateOfflineColumns(columns);
          } else {
            offlineColumns = offlineConfigs;
          }
          filterColumns = generateFilterColumns(columns, offlineColumns);
          this.setState({ offlineColumns, filterColumns }, resolve);
        });
    });
  }

  initTableThemes() {
    return new Promise((resolve) => {
      const { tableColumnManageConfigs } = this.props;
      const { name } = tableColumnManageConfigs;
      let offlineThemes = {};
      this.offlineStorgeOfTableThemes = new OfflineStorge(
        DI.get('config').get('core.table.themesStorageName')
      );
      this.offlineStorgeOfTableThemes.get(name)
        .then((offlineConfigs) => {
          if (offlineConfigs) {
            offlineThemes = offlineConfigs;
          }
          this.setState({ offlineThemes }, resolve);
        });
    });
  }

  fetchData(showDataLoading) {
    const {
      httpService, fetchDataMethodName, onDataChange, handleFetchOptions, pageSizeChanger
    } = this.props;
    const { query, queryString, offlineThemes } = this.state;
    this.setState({
      dataLoading: showDataLoading === undefined ? true : showDataLoading,
      dataLoadError: false
    });

    const fetchQueryObj = handleFetchOptions({
      query,
      queryString
    });

    httpService[fetchDataMethodName](fetchQueryObj)
      .then((response) => {
        const data = response.results;
        const pagination = generatePagination(response.pagination, pageSizeChanger);
        this.setState({
          data,
          pagination,
          dataLoading: false
        }, () => {
          onDataChange({ value: data });
          if (offlineThemes.tableFixedSides && offlineThemes.tableFixedSides !== 'none'
            && (showDataLoading === undefined)) {
            this.fetchData(false);
          }
        });
      })
      .catch((e) => {
        const reqTimeout = e.message.indexOf('request timeout') !== -1;
        this.setState({
          dataLoading: false,
          dataLoadError: true,
          dataLoadErrorMessage: reqTimeout ? '数据加载超时,点击重新更新...' : '数据加载失败,点击重新更新...'
        });
      });
  }

  handleTableChange(pagination, filters, sorter) {
    const { tableColumnManageConfigs, formatSorter } = this.props;
    const { name } = tableColumnManageConfigs;
    let sorterQuery = sorter;
    if (_.isFunction(formatSorter)) {
      sorterQuery = formatSorter(sorter);
    }
    this.offlineStorgeOfTablePage.add(name, { pageSize: pagination.pageSize });
    this.setState({
      query: generateQuery({ pagination, filters, sorter: sorterQuery })
    }, () => {
      this.fetchData();
    });
  }

  resetQueryString(queryString) {
    const { query } = this.state;
    query.offset = 0;
    this.setState({
      query, queryString
    }, () => {
      this.fetchData();
    });
  }

  resetTableConfig(resetColumns, resetOrigin) {
    return new Promise((resolve) => {
      const { tableColumnManageConfigs } = this.props;
      const { name, columns } = tableColumnManageConfigs;
      let offlineColumns;
      let filterColumns;
      if (!resetOrigin) {
        offlineColumns = generateOfflineColumns(resetColumns);
        filterColumns = generateFilterColumns(columns, offlineColumns);
      } else {
        offlineColumns = generateOfflineColumns(columns);
        filterColumns = generateFilterColumns(columns, offlineColumns);
      }
      this.offlineStorgeOfTableColumn.add(name, offlineColumns);
      this.setState({ offlineColumns, filterColumns }, resolve);
    });
  }

  resetTableThemes(resetThemes) {
    const { tableColumnManageConfigs } = this.props;
    const { name } = tableColumnManageConfigs;
    const offlineThemes = {
      ...resetThemes
    };
    const offlineColumns = this.transformThemeToColumn(offlineThemes);
    this.offlineStorgeOfTableThemes.add(name, offlineThemes);
    this.resetTableConfig(offlineColumns)
      .then(() => {
        this.setState({ offlineThemes }, this.fetchData);
      });
  }

  transformThemeToColumn(offlineThemes) {
    const { offlineColumns, filterColumns } = this.state;
    if (offlineThemes.tableFixedSides === 'onlyLeft') {
      _.each(offlineColumns, (value, index) => {
        if (value.title === (filterColumns[0].title)) {
          offlineColumns[index].fixed = 'left';
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = offlineColumns[index].referenceWidth || 120;
        } else if (offlineThemes.tableFixedHeader === 'true'
          && value.title !== (filterColumns[filterColumns.length - 1].title)) {
          offlineColumns[index].fixed = null;
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = (offlineColumns[index].referenceWidth || 120) * 1.5;
        } else {
          offlineColumns[index].fixed = null;
          offlineColumns[index].fixedWidth = false;
        }
      });
    } else if (offlineThemes.tableFixedSides === 'onlyRight') {
      _.each(offlineColumns, (value, index) => {
        if (value.title === (filterColumns[filterColumns.length - 1].title)) {
          offlineColumns[index].fixed = 'right';
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = offlineColumns[index].referenceWidth || 120;
        } else if (offlineThemes.tableFixedHeader === 'true'
          && value.title !== (filterColumns[filterColumns.length - 2].title)) {
          offlineColumns[index].fixed = null;
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = (offlineColumns[index].referenceWidth || 120) * 1.5;
        } else {
          offlineColumns[index].fixed = null;
          offlineColumns[index].fixedWidth = false;
        }
      });
    } else if (offlineThemes.tableFixedSides === 'bothSides') {
      _.each(offlineColumns, (value, index) => {
        if (value.title === (filterColumns[0].title)) {
          offlineColumns[index].fixed = 'left';
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = offlineColumns[index].referenceWidth || 120;
        } else if (value.title === (filterColumns[filterColumns.length - 1].title)) {
          offlineColumns[index].fixed = 'right';
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = offlineColumns[index].referenceWidth || 120;
        } else if (offlineThemes.tableFixedHeader === 'true'
          && value.title !== (filterColumns[filterColumns.length - 2].title)) {
          offlineColumns[index].fixed = null;
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = (offlineColumns[index].referenceWidth || 120) * 1.5;
        } else {
          offlineColumns[index].fixed = null;
          offlineColumns[index].fixedWidth = false;
        }
      });
    } else if ((offlineThemes.tableFixedSides === 'none' || !offlineThemes.tableFixedSides)
      && (offlineThemes.tableFixedHeader === 'true')) {
      _.each(offlineColumns, (value, index) => {
        if (value.title === (filterColumns[filterColumns.length - 1].title)) {
          offlineColumns[index].fixedWidth = false;
          offlineColumns[index].width = null;
          offlineColumns[index].fixed = null;
        } else {
          offlineColumns[index].fixedWidth = true;
          offlineColumns[index].width = offlineColumns[index].referenceWidth || 120;
          offlineColumns[index].fixed = null;
        }
      });
    } else {
      _.each(offlineColumns, (value, index) => {
        offlineColumns[index].fixed = null;
        offlineColumns[index].fixedWidth = false;
      });
    }
    return offlineColumns;
  }

  render() {
    const {
      httpService, formatSorter,
      conditionSearch, tableProps, formatConditionQuery, qsFormatSearchQuery,
      tableColumnManage, tableColumnManageConfigs, conditionSearchConfigs,
      exportExcel, exportExcelLimit, exportExcelMethodName, handleExportExcelOptions
    } = this.props;
    const {
      data, dataLoading, dataLoadError, dataLoadErrorMessage,
      pagination, filterColumns, offlineColumns, offlineThemes,
      queryString, searchStr
    } = this.state;
    let otherTableProps;
    let tablevConditionComponent;
    let tablevColumnManageComponent;
    let tableThemeBoardComponent;
    let tablevToExcelComponent;
    let tablevReloadComponent;
    let cardTitle;
    let cardExtra;

    if (conditionSearch) {
      tablevConditionComponent = (
        <TablevCondition
          searchStr={searchStr}
          formatConditionQuery={formatConditionQuery}
          qsFormatSearchQuery={qsFormatSearchQuery}
          resetQueryString={::this.resetQueryString}
          realTime={!(offlineThemes && offlineThemes.searchButton === 'show')}
          {...conditionSearchConfigs}
        />
      );
    }

    tablevColumnManageComponent = (
      <TableControlBoard
        offlineColumns={offlineColumns}
        getTableColumnsWidth={::this.getTableColumnsWidth}
        resetTableConfig={::this.resetTableConfig}
      />
    );

    tableThemeBoardComponent = (
      <TableThemesBoard
        offlineThemes={offlineThemes}
        offlineColumns={offlineColumns}
        getTableColumnsWidth={::this.getTableColumnsWidth}
        resetTableThemes={::this.resetTableThemes}
      />
    );

    if (exportExcel) {
      tablevToExcelComponent = (
        <TableToExcel
          columns={filterColumns}
          httpService={httpService}
          dataCount={pagination.total}
          queryString={queryString}
          limit={exportExcelLimit}
          total={pagination.total}
          handleExportExcelOptions={handleExportExcelOptions}
          exportExcelMethodName={exportExcelMethodName}
        />
      );
    }

    tablevReloadComponent = (
      <a className={styles.reload} onClick={() => this.fetchData()}>
        <Icon type="reload" />
      </a>
    );

    if (tableColumnManage && tableColumnManageConfigs && tableColumnManageConfigs.title) {
      cardTitle = tableColumnManageConfigs.title;
    }

    cardExtra = (
      <div>
        {tablevColumnManageComponent}
        {tableThemeBoardComponent}
        {tablevToExcelComponent}
        {tablevReloadComponent}
      </div>
    );

    if (data.length === 0) {
      otherTableProps = _.omit(tableProps, 'expandedRowRender');
    } else {
      otherTableProps = tableProps;
    }

    if (offlineThemes) {
      otherTableProps = {
        ...otherTableProps,
        size: offlineThemes.tableSize,
        bordered: offlineThemes.tableBordered === 'true',
        scroll: {
          x: (otherTableProps && otherTableProps.scroll) ? otherTableProps.scroll.x : null,
          y: offlineThemes.tableFixedHeader === 'true' ? 400 : null
        }
      };
    }

    if (filterColumns[0] && (
      filterColumns[0].fixed || filterColumns[filterColumns.length - 1].fixed)) {
      otherTableProps = {
        ...otherTableProps,
        scroll: {
          x: '150%',
          y: (otherTableProps && otherTableProps.scroll) ? otherTableProps.scroll.y : null
        }
      };
    } else {
      otherTableProps = {
        ...otherTableProps,
        scroll: {
          x: null,
          y: (otherTableProps && otherTableProps.scroll) ? otherTableProps.scroll.y : null
        }
      };
    }

    return (
      <div className={styles.container}>
        {tablevConditionComponent}
        <AlertError
          message={dataLoadErrorMessage}
          onClick={::this.fetchData}
          visible={dataLoadError}
        />
        <Card
          title={cardTitle}
          extra={cardExtra}
          className={styles.card}
        >
          <Table
            ref="AntdTable"
            columns={filterColumns}
            loading={dataLoading}
            dataSource={data}
            pagination={pagination}
            formatSorter={formatSorter}
            total={pagination.total}
            rowKey={record => record[filterColumns[0].dataIndex]}
            onChange={::this.handleTableChange}
            {...otherTableProps}
          />
        </Card>
      </div>
    );
  }
}
