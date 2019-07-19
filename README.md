# ISS巡检服务端代码

## 启动
```
$ node bin/www 
$ node bin/schedule 
```

## 测试接口
```
$ npm run test

```

## 数据库设计
某些表中有id 和uuid 连个字段，其中id可以追溯历史版本，uuid可以获取该记录的最新版本，这需要配合category使用。比如
```
Locations
Buildings
Floors
Spaces
Equipments
Inspections

Pathways
PathEquipments
PathInspections

OperatePaths
OperateEquipments
OperateInspections

上述表中常使用该规则
```