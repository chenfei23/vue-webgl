
# 退线分析

<sm-iframe src="https://iclient.supermap.io/examples/component/components_chart_vue.html"></sm-iframe>

```vue
<sm-scene-backlineanalysis :spatial-analysis-url="spatialAnalysisUrl"
                                       :query-url="queryUrl"></sm-scene-backlineanalysis>
```

### Attributes

| 参数           | 说明                                                                                                                                                                                                                                       | 类型             | 可选值                                                       | 默认值                                                    |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- | :----------------------------------------------------------- | :-------------------------------------------------------- |
| spatialAnalysisUrl | 分析服务的地址                                                                                                                                                                                                                    | string           | -                                                            | 'http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/geometry/3d/buffer.json' |
| queryUrl | 查询服务的地址                                                                                                                                                     | string           | -      | '[http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/datasets/%E5%A2%99%40%E4%B9%9D%E5%8F%B7%E6%A5%BC%E6%8B%89%E4%BD%8E/spatialquery3d.json](http://www.supermapol.com/realspace/services/spatialAnalysis-data_all/restjsr/spatialanalyst/datasets/墙%40九号楼拉低/spatialquery3d.json)' |
