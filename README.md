# antd_manage_core

# ChangeLog
### v2.0.6
* 添加 BugTag 支持

### v2.0.5
* 修复 Google 二次验证

### v2.0.4
* 部分style修改

### v2.0.3
* 部分style修改

### v2.0.2
* 修复 antd 升级后 Upload 数据格式改变问题
* 修复 react 升级后再渲染导致的 Editor 组件问题

### v2.0.1
* 增加router模块
    * 全局的 HashHistory，控制路由跳转
    * router 路由预处理utils
* 通过更严格的 eslint rule `no-unused-vars`

### v2.0.0
* 新版本！
    * 支持react升级至v16
    * 支持react-router升级至v4
    * antd升级至v3
    * 版本向下不兼容，react v15 和 react-router v2 v3 请选择1.x版本

### v1.1.36
* 修复高级搜索条件树定制item

### v1.1.35
* 大范围修复项目Eslint报错

### v1.1.34
* 修复图片上传bug

### v1.1.33
* ImageUploader 组件更新

### v1.1.32
* 添加 ImageUploader 组件
    * 属性
    * limit 上传图片数量限制(可选)
    * qiniuToken object { token bucketUrl } 七牛上传token和bucketUrl

### v1.1.31
* 增加重置管理员二步验证功能

### v1.1.30
* 更新密码找回样式
* 修复编辑器bug

### v1.1.29
* 新增密码找回功能

### v1.1.27
* 添加 Editor 组件
    * 属性
    * placeholder string
    * toolbars array 显示的工具
    * qiniuToken object { token bucketUrl } 七牛上传token和bucketUrl 

### v1.1.25
* 新增message组件 配置error显示时间
* 修复全局导航搜索bug

### v1.1.24
* 表格组件增加页数选项 默认 [20 0 100 200]
* 优化全局导航搜索

### v1.1.23
* 新增全局导航搜索
* 表格组件增加页数选项

### v1.1.22
* 优化导航栏折叠

### v1.1.21
* 全局化 JSONPreview 组件样式名称，以便外部覆盖
* 修复高级搜索 bug
* 对外暴露 ConditionJson 组件
* formatConditionQuery 新增第三个参数，暴露原始已生成的 query

### v1.1.20
* 新增 JSONPreview 组件

### v1.1.19
* 支持自定义任务中心的日期

### v1.1.18
* sentry 只在生产环境初始化
* 修复 condition query 的 bug

### v1.1.17
* table 组件更新， 支持用户维度搜索
    * userFieldConfigs, object
    * userConditions, array
* 支持 sentry   

### v1.1.16
* 添加 MarkdownEditor 组件
    * 属性
    * placeholder string
    * disabledTools array 禁用的工具
    * qiniuToken object { token bucketUrl } 七牛上传token和bucketUrl

### v1.1.14
* 表格组件支持传入 `expandedRowRender`, 修复两个表格嵌套时，父表格数据没有加载成功时，代码崩溃的错误

### v1.1.13
*  手贱发了个空版本
    
### v1.1.12
*  支持 http patch 方法
*  支持配置文件设置全局的超时时间,调用如下
```
    ...
    core: {
        httpRequst: {
          timeout: 10000
        }
        ...
    }
```  

### v1.1.11
*  navigation 收缩展示功能
*  table 组件支持 `qsFormatSearchQuery` 属性，布尔值，默认false，简化外部调用
*  fieldConfigs 每个配置 新增一个 `subConfig` 属性
    * `subConfig` 支持 `typeFor$IN` 和 `typeFor$NOT_IN` 赋值为 `textarea`， 之前对于 `in`、`not_in` 只支持 select
    * 对 type='date' 的情况，将之前的 `showTime` 挪至 `subConfig` 下
    * 对 type='date' 的情况，支持 `returnUtcSeconds` ，布尔值， 默认关闭。返回选择的时间的 UTC 秒数，避免小贷后台外部调用时，每次都需要计算。   

### v1.1.10
*  navigation 更新

### v1.1.8
*  在 table column 有`sorter`时，通过`sorterType`来设置排序参数的格式，支持`underline`,`camel` 
