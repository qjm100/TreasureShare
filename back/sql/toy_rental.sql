-- ----------------------------
-- 1、玩具用户扩展表
-- ----------------------------
drop table if exists toy_user;
create table toy_user (
  id                bigint(20)      not null auto_increment    comment '用户扩展ID',
  user_id           bigint(20)      not null                   comment '关联系统用户ID',
  nick_name         varchar(30)     default ''                 comment '昵称',
  avatar            varchar(100)    default ''                 comment '头像地址',
  credit_score      int(11)         default 600                comment '信用分',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '玩具用户扩展表';


-- ----------------------------
-- 2、用户收货地址表
-- ----------------------------
drop table if exists toy_address;
create table toy_address (
  id                bigint(20)      not null auto_increment    comment '地址ID',
  user_id           bigint(20)      not null                   comment '用户ID',
  receiver_name     varchar(30)     not null                   comment '收货人姓名',
  phone             varchar(11)     not null                   comment '联系电话',
  province          varchar(50)     default ''                 comment '省份',
  city              varchar(50)     default ''                 comment '城市',
  district          varchar(50)     default ''                 comment '区/县',
  detail            varchar(200)    default ''                 comment '详细地址',
  is_default        char(1)         default '0'                comment '是否默认（0否 1是）',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '用户收货地址表';


-- ----------------------------
-- 3、玩具分类表
-- ----------------------------
drop table if exists toy_category;
create table toy_category (
  id                bigint(20)      not null auto_increment    comment '分类ID',
  parent_id         bigint(20)      default 0                  comment '父分类ID',
  name              varchar(50)     not null                   comment '分类名称',
  sort              int(4)          default 0                  comment '显示顺序',
  status            char(1)         default '0'                comment '状态（0正常 1停用）',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=100 default charset=utf8mb4 comment = '玩具分类表';


-- ----------------------------
-- 4、玩具商品表
-- ----------------------------
drop table if exists toy_product;
create table toy_product (
  id                bigint(20)      not null auto_increment    comment '商品ID',
  user_id           bigint(20)      not null                   comment '发布用户ID',
  category_id       bigint(20)      not null                   comment '分类ID',
  name              varchar(100)    not null                   comment '商品名称',
  image             varchar(200)    default ''                 comment '商品主图',
  price             decimal(10,2)   default 0.00               comment '原价',
  rent_price_day    decimal(10,2)   default 0.00               comment '日租金',
  rent_price_month  decimal(10,2)   default 0.00               comment '月租金',
  age_range         varchar(20)     default ''                 comment '适龄范围',
  brand             varchar(50)     default ''                 comment '品牌',
  stock             int(11)         default 1                  comment '库存数量',
  status            char(1)         default '0'                comment '商品状态（0上架 1下架 2待消毒）',
  description       text                                       comment '商品描述',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '玩具商品表';


-- ----------------------------
-- 5、商品图片表
-- ----------------------------
drop table if exists toy_product_image;
create table toy_product_image (
  id                bigint(20)      not null auto_increment    comment '图片ID',
  product_id        bigint(20)      not null                   comment '商品ID',
  image_url         varchar(200)    not null                   comment '图片地址',
  sort              int(4)          default 0                  comment '显示顺序',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '商品图片表';


-- ----------------------------
-- 6、购物车表
-- ----------------------------
drop table if exists toy_cart;
create table toy_cart (
  id                bigint(20)      not null auto_increment    comment '购物车ID',
  user_id           bigint(20)      not null                   comment '用户ID',
  product_id        bigint(20)      not null                   comment '商品ID',
  duration          int(11)         default 1                  comment '租赁时长（天）',
  create_time       datetime                                   comment '创建时间',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '购物车表';


-- ----------------------------
-- 7、租赁订单表
-- ----------------------------
drop table if exists toy_order;
create table toy_order (
  id                bigint(20)      not null auto_increment    comment '订单ID',
  order_no          varchar(32)     not null                   comment '订单编号',
  user_id           bigint(20)      not null                   comment '用户ID',
  address_id        bigint(20)      not null                   comment '收货地址ID',
  total_rent        decimal(10,2)   default 0.00               comment '租金总额',
  deposit           decimal(10,2)   default 0.00               comment '押金',
  status            char(1)         default '0'                comment '订单状态（0待付款 1待发货 2待收货 3租赁中 4待归还 5待消毒 6已完成 7已取消）',
  pay_time          datetime                                   comment '付款时间',
  logistics_no      varchar(64)     default ''                 comment '发货物流单号',
  return_logistics_no varchar(64)   default ''                 comment '退货物流单号',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '租赁订单表';


-- ----------------------------
-- 8、订单明细表
-- ----------------------------
drop table if exists toy_order_item;
create table toy_order_item (
  id                bigint(20)      not null auto_increment    comment '订单明细ID',
  order_id          bigint(20)      not null                   comment '订单ID',
  product_id        bigint(20)      not null                   comment '商品ID',
  quantity          int(11)         default 1                  comment '数量',
  rent_price        decimal(10,2)   default 0.00               comment '租赁单价',
  duration          int(11)         default 1                  comment '租赁时长（天）',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '订单明细表';


-- ----------------------------
-- 9、支付记录表
-- ----------------------------
drop table if exists toy_payment;
create table toy_payment (
  id                bigint(20)      not null auto_increment    comment '支付ID',
  order_id          bigint(20)      not null                   comment '订单ID',
  amount            decimal(10,2)   default 0.00               comment '支付金额',
  type              varchar(10)     default ''                 comment '支付类型（rent租金 deposit押金）',
  method            varchar(20)     default 'mock'             comment '支付方式（mock模拟支付）',
  status            char(1)         default '0'                comment '支付状态（0未支付 1已支付）',
  pay_time          datetime                                   comment '支付时间',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '支付记录表';


-- ----------------------------
-- 10、物流信息表
-- ----------------------------
drop table if exists toy_logistics;
create table toy_logistics (
  id                bigint(20)      not null auto_increment    comment '物流ID',
  order_id          bigint(20)      not null                   comment '订单ID',
  tracking_no       varchar(64)     not null                   comment '物流单号',
  company           varchar(50)     default ''                 comment '物流公司',
  type              varchar(10)     default ''                 comment '物流类型（ship发货 return退货）',
  status            char(1)         default '0'                comment '物流状态（0运输中 1已签收）',
  create_time       datetime                                   comment '创建时间',
  update_time       datetime                                   comment '更新时间',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '物流信息表';


-- ----------------------------
-- 11、商品评价表
-- ----------------------------
drop table if exists toy_evaluation;
create table toy_evaluation (
  id                bigint(20)      not null auto_increment    comment '评价ID',
  order_id          bigint(20)      not null                   comment '订单ID',
  product_id        bigint(20)      not null                   comment '商品ID',
  user_id           bigint(20)      not null                   comment '用户ID',
  rating            int(1)          default 5                  comment '评分（1-5）',
  content           varchar(500)    default ''                 comment '评价内容',
  images            varchar(500)    default ''                 comment '评价图片（逗号分隔）',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '商品评价表';


-- ----------------------------
-- 12、社区帖子表
-- ----------------------------
drop table if exists toy_community_post;
create table toy_community_post (
  id                bigint(20)      not null auto_increment    comment '帖子ID',
  user_id           bigint(20)      not null                   comment '用户ID',
  content           varchar(1000)   default ''                 comment '帖子内容',
  images            varchar(500)    default ''                 comment '图片（逗号分隔）',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  update_by         varchar(64)     default ''                 comment '更新者',
  update_time       datetime                                   comment '更新时间',
  remark            varchar(500)    default null               comment '备注',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '社区帖子表';


-- ----------------------------
-- 13、社区评论表
-- ----------------------------
drop table if exists toy_community_comment;
create table toy_community_comment (
  id                bigint(20)      not null auto_increment    comment '评论ID',
  post_id           bigint(20)      not null                   comment '帖子ID',
  user_id           bigint(20)      not null                   comment '用户ID',
  content           varchar(500)    default ''                 comment '评论内容',
  create_by         varchar(64)     default ''                 comment '创建者',
  create_time       datetime                                   comment '创建时间',
  primary key (id)
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '社区评论表';


-- ----------------------------
-- 14、社区点赞表
-- ----------------------------
drop table if exists toy_community_like;
create table toy_community_like (
  id                bigint(20)      not null auto_increment    comment '点赞ID',
  post_id           bigint(20)      not null                   comment '帖子ID',
  user_id           bigint(20)      not null                   comment '用户ID',
  create_time       datetime                                   comment '创建时间',
  primary key (id),
  unique key uk_post_user (post_id, user_id) comment '同一用户同一帖子只点赞一次'
) engine=innodb auto_increment=1 default charset=utf8mb4 comment = '社区点赞表';


-- ----------------------------
-- 初始化-玩具分类表数据
-- ----------------------------
-- 一级分类
insert into toy_category values(1,  0, '绘本',     1, '0', 'admin', sysdate(), '', null, '绘本分类');
insert into toy_category values(2,  0, '益智玩具', 2, '0', 'admin', sysdate(), '', null, '益智玩具分类');
insert into toy_category values(3,  0, '早教机',   3, '0', 'admin', sysdate(), '', null, '早教机分类');

-- 二级分类-绘本
insert into toy_category values(4,  1, '认知启蒙', 1, '0', 'admin', sysdate(), '', null, '认知启蒙子分类');
insert into toy_category values(5,  1, '习惯养成', 2, '0', 'admin', sysdate(), '', null, '习惯养成子分类');
insert into toy_category values(6,  1, '科普百科', 3, '0', 'admin', sysdate(), '', null, '科普百科子分类');

-- 二级分类-益智玩具
insert into toy_category values(7,  2, '积木拼装', 1, '0', 'admin', sysdate(), '', null, '积木拼装子分类');
insert into toy_category values(8,  2, '角色扮演', 2, '0', 'admin', sysdate(), '', null, '角色扮演子分类');
insert into toy_category values(9,  2, '科学实验', 3, '0', 'admin', sysdate(), '', null, '科学实验子分类');

-- 二级分类-早教机
insert into toy_category values(10, 3, '故事机',   1, '0', 'admin', sysdate(), '', null, '故事机子分类');
insert into toy_category values(11, 3, '点读笔',   2, '0', 'admin', sysdate(), '', null, '点读笔子分类');
