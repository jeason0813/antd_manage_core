import _ from 'lodash';
import DI from '../../../di';
import { transformOrder } from '../../../utils/ant-table';

/*  columns  */
// 取得 columns 的 dataIndex、 title 组成数组
export const processConfigsForCompare = (columns) => {
  const configs = [];

  _.each(columns, (column) => {
    configs.push({
      dataIndex: column.dataIndex,
      title: column.title
    });
  });

  return configs;
};

// 取得 columns 的 dataIndex、title、show 组成数组，存在indexedDB前格式化 => generateOfflineConfigs
export const processOfflineConfigs = (columns) => {
  const configs = [];

  _.each(columns, (column) => {
    configs.push({
      dataIndex: column.dataIndex,
      title: column.title,
      show: column.show
    });
  });

  return configs;
};

// 对比 columns configs
export const compareOfflineConfigs = (columns, configs) => (
  _.differenceWith(
    processConfigsForCompare(configs),
    processConfigsForCompare(columns),
    _.isEqual
  )
);

export const mergeAndSortColumns = (columns, offlineConfigs) => (
  _.cloneDeep(columns)
    .map((column) => (
      _.merge(
        {
          index: _.findIndex(offlineConfigs, { title: column.title })
        },
        column,
        _.find(offlineConfigs, { title: column.title })
      )
    )).sort((a, b) => a.index - b.index)
);

// filter columns 留下show的
export const filterColumns = (columns) => (
  _.filter(columns, (column) => column.show)
);

/*  generate state  */

// generate state query
export const generateQuery = ({ pagination = {}, sorter } = {}) => {
  const limit = pagination.pageSize || DI.get('config').get('core.pagination').pageSize;
  const offset = (pagination.current - 1) * pagination.pageSize || 0;
  const order = (!_.isEmpty(sorter)) ? transformOrder(sorter) : null;
  return { limit, offset, order };
};

// generate state pagination
export const generatePagination = (pagination = {}) => {
  const total = pagination.total || 0;
  const current = (pagination.offset / pagination.limit + 1) || 1;
  const pageSize = pagination.limit;
  const pageSizeOptions = ['20', '50', '100', '200'];
  const showSizeChanger = true;
  return _.merge(
    {},
    DI.get('config').get('core.pagination'),
    { total, current, pageSize, pageSizeOptions, showSizeChanger }
  );
};
//
export const generateOfflineColumns = (columns) => {
  const configs = [];

  _.each(columns, (column) => {
    configs.push({
      dataIndex: column.dataIndex,
      title: column.title,
      show: column.show,
      fixedWidth: column.fixedWidth,
      width: column.fixedWidth ? column.width : null,
      fixed: column.fixed,
      referenceWidth: column.referenceWidth,
      className: column.className
    });
  });

  return configs;
};

export const generateFilterColumns = (columns, offlineConfigs) => (
  filterColumns(mergeAndSortColumns(columns, offlineConfigs))
);

export const generateNewColumns = (columns, offlineColumns) => {
  let newColumns = [];
  if (!offlineColumns || !_.isArray(offlineColumns)) {
    newColumns = columns;
  } else {
    _.each(columns, (value) => {
      const offlineItem = _.find(offlineColumns, (item) => (item.title === value.title));
      const standardItem = {
        fixedWidth: undefined,
        width: undefined,
        fixed: undefined,
        referenceWidth: undefined,
        className: undefined
      };
      if (offlineItem && offlineItem.title) {
        const tmpColumn = _.merge(value, standardItem, offlineItem);
        newColumns.push({
          ...tmpColumn,
          width: offlineItem.fixedWidth ? offlineItem.width : null,
          index: _.findIndex(offlineColumns, { title: value.title })
        });
      } else {
        newColumns.push(_.merge(value, standardItem));
      }
    });
  }
  newColumns = newColumns.sort((a, b) => a.index - b.index);
  _.each(newColumns, (value, index) => {
    delete newColumns[index].index;
  });
  return newColumns;
};

export const generateNewCondition = (conditions, offlineConditions) => {
  let newConditions = [];
  if (!offlineConditions || !_.isArray(offlineConditions)) {
    newConditions = conditions;
  } else {
    _.each(conditions, (value) => {
      const offlineItem = _.find(offlineConditions, (item) => (item.title === value.title));
      if (offlineItem && offlineItem.title) {
        const tmpConditions = _.merge(value, offlineItem);
        newConditions.push({
          ...tmpConditions,
          index: _.findIndex(offlineConditions, { title: value.title })
        });
      } else {
        newConditions.push(value);
      }
    });
  }
  newConditions = newConditions.sort((a, b) => a.index - b.index);
  _.each(newConditions, (value, index) => {
    delete newConditions[index].index;
    if (!value.hide) {
      delete newConditions[index].hide;
    }
  });
  return newConditions;
};

