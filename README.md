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

本系统数据库设计大量使用外键，牺牲了数据库和程序性能，也可以去除。

基础信息和巡检路线相关的数据表，采用了 `category` 字段来控制所属版本。因其不同版本可能会同时存在，有不同的人来操作。

ISS客户要求所有基础数据，一经变更，便在所有的地方都变更，历史数据中亦变更，故数据库表设计时多采用外键引用，看数据表结构的时候可能会比较绕。