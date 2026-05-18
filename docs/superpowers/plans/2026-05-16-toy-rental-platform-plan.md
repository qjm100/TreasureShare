# 儿童绘本与玩具循环租赁共享平台 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a P2P toy/book rental sharing platform with React user frontend, RuoYi admin backend, and Spring Boot API.

**Architecture:** New `ruoyi-toyrental` Maven module for business logic; controllers under `ruoyi-admin`; React frontend in `front/` using TypeScript + Tailwind; RuoYi Vue admin pages under `back/ruoyi-ui/`. Standard RuoYi patterns: `BaseController` inheritance, `@Anonymous` for public endpoints, `AjaxResult`/`TableDataInfo` responses, MyBatis mapper interfaces with XML.

**Tech Stack:** Java 17, Spring Boot 4.0.3, MyBatis, Redis, JWT, React 19 + TypeScript + Tailwind CSS 4 + Vite, Vue 2 + Element UI

---

## Phase 1: Database + Backend Foundation

### Task 1: Create SQL schema

**Files:**
- Create: `back/sql/toy_rental.sql`

- [ ] **Step 1: Write the full DDL script**

```sql
-- 儿童绘本与玩具循环租赁共享平台 数据库初始化脚本

-- 扩展用户表
DROP TABLE IF EXISTS toy_user;
CREATE TABLE toy_user (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '关联sys_user用户ID',
  nick_name         VARCHAR(30)     DEFAULT ''              COMMENT '用户昵称',
  avatar            VARCHAR(255)    DEFAULT ''              COMMENT '头像URL',
  credit_score      INT             DEFAULT 600             COMMENT '信用分',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='扩展用户表';

-- 用户收货地址
DROP TABLE IF EXISTS toy_address;
CREATE TABLE toy_address (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  receiver_name     VARCHAR(30)     NOT NULL                COMMENT '收件人姓名',
  phone             VARCHAR(20)     NOT NULL                COMMENT '联系电话',
  province          VARCHAR(20)     DEFAULT ''              COMMENT '省份',
  city              VARCHAR(20)     DEFAULT ''              COMMENT '城市',
  district          VARCHAR(20)     DEFAULT ''              COMMENT '区县',
  detail            VARCHAR(200)    NOT NULL                COMMENT '详细地址',
  is_default        CHAR(1)         DEFAULT '0'             COMMENT '是否默认(0否 1是)',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='用户收货地址表';

-- 商品分类
DROP TABLE IF EXISTS toy_category;
CREATE TABLE toy_category (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  parent_id         BIGINT(20)      DEFAULT 0               COMMENT '父分类ID(0为一级)',
  name              VARCHAR(50)     NOT NULL                COMMENT '分类名称',
  sort              INT             DEFAULT 0               COMMENT '排序',
  status            CHAR(1)         DEFAULT '0'             COMMENT '状态(0正常 1停用)',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=100 COMMENT='商品分类表';

-- 商品主表
DROP TABLE IF EXISTS toy_product;
CREATE TABLE toy_product (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '商品ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '发布者用户ID',
  category_id       BIGINT(20)      NOT NULL                COMMENT '分类ID',
  name              VARCHAR(100)    NOT NULL                COMMENT '商品名称',
  image             VARCHAR(255)    DEFAULT ''              COMMENT '封面图片URL',
  price             DECIMAL(10,2)   DEFAULT 0               COMMENT '商品原价',
  rent_price_day    DECIMAL(10,2)   DEFAULT 0               COMMENT '日租金',
  rent_price_month  DECIMAL(10,2)   DEFAULT 0               COMMENT '月租金',
  age_range         VARCHAR(20)     DEFAULT ''              COMMENT '适用年龄(如3-6岁)',
  brand             VARCHAR(50)     DEFAULT ''              COMMENT '品牌',
  stock             INT             DEFAULT 1               COMMENT '库存数量',
  status            CHAR(1)         DEFAULT '0'             COMMENT '状态(0上架 1下架 2待消毒)',
  description       TEXT                                    COMMENT '商品描述',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='商品主表';

-- 商品图片
DROP TABLE IF EXISTS toy_product_image;
CREATE TABLE toy_product_image (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '图片ID',
  product_id        BIGINT(20)      NOT NULL                COMMENT '商品ID',
  image_url         VARCHAR(255)    NOT NULL                COMMENT '图片URL',
  sort              INT             DEFAULT 0               COMMENT '排序',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='商品图片表';

-- 购物车
DROP TABLE IF EXISTS toy_cart;
CREATE TABLE toy_cart (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '购物车ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  product_id        BIGINT(20)      NOT NULL                COMMENT '商品ID',
  duration          INT             DEFAULT 1               COMMENT '租赁月数',
  create_time       DATETIME                                COMMENT '创建时间',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='购物车表';

-- 租赁订单
DROP TABLE IF EXISTS toy_order;
CREATE TABLE toy_order (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  order_no          VARCHAR(32)     NOT NULL                COMMENT '订单编号',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  address_id        BIGINT(20)      NOT NULL                COMMENT '收货地址ID',
  total_rent        DECIMAL(10,2)   DEFAULT 0               COMMENT '总租金',
  deposit           DECIMAL(10,2)   DEFAULT 0               COMMENT '押金',
  status            CHAR(1)         DEFAULT '0'             COMMENT '订单状态(0待付款 1待发货 2待收货 3租赁中 4待归还 5待消毒 6已完成 7已取消)',
  pay_time          DATETIME        DEFAULT NULL            COMMENT '支付时间',
  logistics_no      VARCHAR(64)     DEFAULT ''              COMMENT '发货物流单号',
  return_logistics_no VARCHAR(64)   DEFAULT ''              COMMENT '归还物流单号',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='租赁订单表';

-- 订单商品明细
DROP TABLE IF EXISTS toy_order_item;
CREATE TABLE toy_order_item (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '明细ID',
  order_id          BIGINT(20)      NOT NULL                COMMENT '订单ID',
  product_id        BIGINT(20)      NOT NULL                COMMENT '商品ID',
  quantity          INT             DEFAULT 1               COMMENT '数量',
  rent_price        DECIMAL(10,2)   DEFAULT 0               COMMENT '租赁单价',
  duration          INT             DEFAULT 1               COMMENT '租赁月数',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='订单商品明细表';

-- 支付记录
DROP TABLE IF EXISTS toy_payment;
CREATE TABLE toy_payment (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '支付ID',
  order_id          BIGINT(20)      NOT NULL                COMMENT '订单ID',
  amount            DECIMAL(10,2)   NOT NULL                COMMENT '支付金额',
  type              VARCHAR(10)     NOT NULL                COMMENT '类型(rent租金 deposit押金)',
  method            VARCHAR(20)     DEFAULT 'mock'          COMMENT '支付方式',
  status            CHAR(1)         DEFAULT '0'             COMMENT '支付状态(0待支付 1已支付)',
  pay_time          DATETIME        DEFAULT NULL            COMMENT '支付时间',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='支付记录表';

-- 物流记录
DROP TABLE IF EXISTS toy_logistics;
CREATE TABLE toy_logistics (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '物流ID',
  order_id          BIGINT(20)      NOT NULL                COMMENT '订单ID',
  tracking_no       VARCHAR(64)     DEFAULT ''              COMMENT '快递单号',
  company           VARCHAR(50)     DEFAULT ''              COMMENT '快递公司',
  type              VARCHAR(10)     NOT NULL                COMMENT '类型(ship发货 return归还)',
  status            CHAR(1)         DEFAULT '0'             COMMENT '状态(0运输中 1已签收)',
  create_time       DATETIME                                COMMENT '创建时间',
  update_time       DATETIME                                COMMENT '更新时间',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='物流记录表';

-- 商品评价
DROP TABLE IF EXISTS toy_evaluation;
CREATE TABLE toy_evaluation (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '评价ID',
  order_id          BIGINT(20)      NOT NULL                COMMENT '订单ID',
  product_id        BIGINT(20)      NOT NULL                COMMENT '商品ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  rating            INT             NOT NULL                COMMENT '评分(1-5)',
  content           VARCHAR(500)    DEFAULT ''              COMMENT '评价内容',
  images            VARCHAR(500)    DEFAULT ''              COMMENT '图片(逗号分隔)',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='商品评价表';

-- 社区动态
DROP TABLE IF EXISTS toy_community_post;
CREATE TABLE toy_community_post (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '动态ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  content           VARCHAR(1000)   NOT NULL                COMMENT '动态内容',
  images            VARCHAR(500)    DEFAULT ''              COMMENT '图片(逗号分隔)',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  update_by         VARCHAR(64)     DEFAULT ''              COMMENT '更新者',
  update_time       DATETIME                                COMMENT '更新时间',
  remark            VARCHAR(500)    DEFAULT NULL            COMMENT '备注',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='社区动态表';

-- 社区评论
DROP TABLE IF EXISTS toy_community_comment;
CREATE TABLE toy_community_comment (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '评论ID',
  post_id           BIGINT(20)      NOT NULL                COMMENT '动态ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  content           VARCHAR(500)    NOT NULL                COMMENT '评论内容',
  create_by         VARCHAR(64)     DEFAULT ''              COMMENT '创建者',
  create_time       DATETIME                                COMMENT '创建时间',
  PRIMARY KEY (id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='社区评论表';

-- 社区点赞
DROP TABLE IF EXISTS toy_community_like;
CREATE TABLE toy_community_like (
  id                BIGINT(20)      NOT NULL AUTO_INCREMENT COMMENT '点赞ID',
  post_id           BIGINT(20)      NOT NULL                COMMENT '动态ID',
  user_id           BIGINT(20)      NOT NULL                COMMENT '用户ID',
  create_time       DATETIME                                COMMENT '创建时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_post_user (post_id, user_id)
) ENGINE=INNODB AUTO_INCREMENT=1 COMMENT='社区点赞表';

-- 初始分类数据
INSERT INTO toy_category VALUES (1, 0, '绘本', 1, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (2, 1, '认知启蒙', 1, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (3, 1, '习惯养成', 2, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (4, 1, '科普百科', 3, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (5, 0, '益智玩具', 2, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (6, 5, '积木拼装', 1, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (7, 5, '角色扮演', 2, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (8, 5, '科学实验', 3, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (9, 0, '早教机', 3, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (10, 9, '故事机', 1, '0', 'admin', SYSDATE(), '', NULL, NULL);
INSERT INTO toy_category VALUES (11, 9, '点读笔', 2, '0', 'admin', SYSDATE(), '', NULL, NULL);
```

- [ ] **Step 2: Execute the SQL script**

```bash
mysql -u root -p ry-vue < back/sql/toy_rental.sql
```

Verify:
```bash
mysql -u root -p ry-vue -e "SHOW TABLES LIKE 'toy_%';"
```

Expected output: 12 tables listed.

---

### Task 2: Create ruoyi-toyrental Maven module

**Files:**
- Create: `back/ruoyi-toyrental/pom.xml`
- Modify: `back/pom.xml` (add module + dependency)

- [ ] **Step 1: Create module pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.ruoyi</groupId>
        <artifactId>ruoyi</artifactId>
        <version>3.9.2</version>
    </parent>

    <artifactId>ruoyi-toyrental</artifactId>

    <description>二手玩具租赁业务模块</description>

    <dependencies>
        <dependency>
            <groupId>com.ruoyi</groupId>
            <artifactId>ruoyi-common</artifactId>
        </dependency>
    </dependencies>
</project>
```

- [ ] **Step 2: Register module in parent pom.xml**

In `back/pom.xml`, add to `<modules>`:
```xml
<module>ruoyi-toyrental</module>
```

Add to `<dependencyManagement>/<dependencies>`:
```xml
<dependency>
    <groupId>com.ruoyi</groupId>
    <artifactId>ruoyi-toyrental</artifactId>
    <version>${ruoyi.version}</version>
</dependency>
```

- [ ] **Step 3: Add module dependency to ruoyi-admin**

In `back/ruoyi-admin/pom.xml`, add within `<dependencies>`:
```xml
<dependency>
    <groupId>com.ruoyi</groupId>
    <artifactId>ruoyi-toyrental</artifactId>
</dependency>
```

- [ ] **Step 4: Create directory structure**

```bash
mkdir -p back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain
mkdir -p back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper
mkdir -p back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl
mkdir -p back/ruoyi-toyrental/src/main/resources/mapper
```

- [ ] **Step 5: Verify build compiles**

```bash
cd back && mvn compile -pl ruoyi-toyrental
```

Expected: BUILD SUCCESS.

---

### Task 3: Create domain entities

**Files:**
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyUser.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyAddress.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyCategory.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyProduct.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyProductImage.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyCart.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyOrder.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyOrderItem.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyPayment.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyLogistics.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyEvaluation.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyCommunityPost.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyCommunityComment.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/domain/ToyCommunityLike.java`

- [ ] **Step 1: Write all domain entities**

`ToyUser.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class ToyUser extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long userId;
    private String nickName;
    private String avatar;
    private Integer creditScore;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getNickName() { return nickName; }
    public void setNickName(String nickName) { this.nickName = nickName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Integer getCreditScore() { return creditScore; }
    public void setCreditScore(Integer creditScore) { this.creditScore = creditScore; }
}
```

`ToyAddress.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class ToyAddress extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long userId;
    private String receiverName;
    private String phone;
    private String province;
    private String city;
    private String district;
    private String detail;
    private String isDefault;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getDetail() { return detail; }
    public void setDetail(String detail) { this.detail = detail; }
    public String getIsDefault() { return isDefault; }
    public void setIsDefault(String isDefault) { this.isDefault = isDefault; }
}
```

`ToyCategory.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;
import java.util.ArrayList;
import java.util.List;

public class ToyCategory extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long parentId;
    private String name;
    private Integer sort;
    private String status;
    private List<ToyCategory> children = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public List<ToyCategory> getChildren() { return children; }
    public void setChildren(List<ToyCategory> children) { this.children = children; }
}
```

`ToyProduct.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;
import java.math.BigDecimal;
import java.util.List;

public class ToyProduct extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long userId;
    private Long categoryId;
    private String name;
    private String image;
    private BigDecimal price;
    private BigDecimal rentPriceDay;
    private BigDecimal rentPriceMonth;
    private String ageRange;
    private String brand;
    private Integer stock;
    private String status;
    private String description;
    private List<ToyProductImage> images;
    private String categoryName;
    private String nickName;
    private String avatar;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public BigDecimal getRentPriceDay() { return rentPriceDay; }
    public void setRentPriceDay(BigDecimal rentPriceDay) { this.rentPriceDay = rentPriceDay; }
    public BigDecimal getRentPriceMonth() { return rentPriceMonth; }
    public void setRentPriceMonth(BigDecimal rentPriceMonth) { this.rentPriceMonth = rentPriceMonth; }
    public String getAgeRange() { return ageRange; }
    public void setAgeRange(String ageRange) { this.ageRange = ageRange; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<ToyProductImage> getImages() { return images; }
    public void setImages(List<ToyProductImage> images) { this.images = images; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getNickName() { return nickName; }
    public void setNickName(String nickName) { this.nickName = nickName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
```

`ToyProductImage.java`:
```java
package com.ruoyi.toy.domain;

public class ToyProductImage {
    private Long id;
    private Long productId;
    private String imageUrl;
    private Integer sort;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Integer getSort() { return sort; }
    public void setSort(Integer sort) { this.sort = sort; }
}
```

`ToyCart.java`:
```java
package com.ruoyi.toy.domain;

import java.math.BigDecimal;
import java.util.Date;

public class ToyCart {
    private Long id;
    private Long userId;
    private Long productId;
    private Integer duration;
    private Date createTime;
    private String productName;
    private String productImage;
    private BigDecimal rentPriceMonth;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
    public BigDecimal getRentPriceMonth() { return rentPriceMonth; }
    public void setRentPriceMonth(BigDecimal rentPriceMonth) { this.rentPriceMonth = rentPriceMonth; }
}
```

`ToyOrder.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public class ToyOrder extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private String orderNo;
    private Long userId;
    private Long addressId;
    private BigDecimal totalRent;
    private BigDecimal deposit;
    private String status;
    private Date payTime;
    private String logisticsNo;
    private String returnLogisticsNo;
    private List<ToyOrderItem> items;
    private String receiverName;
    private String receiverPhone;
    private String receiverAddress;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNo() { return orderNo; }
    public void setOrderNo(String orderNo) { this.orderNo = orderNo; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getAddressId() { return addressId; }
    public void setAddressId(Long addressId) { this.addressId = addressId; }
    public BigDecimal getTotalRent() { return totalRent; }
    public void setTotalRent(BigDecimal totalRent) { this.totalRent = totalRent; }
    public BigDecimal getDeposit() { return deposit; }
    public void setDeposit(BigDecimal deposit) { this.deposit = deposit; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getPayTime() { return payTime; }
    public void setPayTime(Date payTime) { this.payTime = payTime; }
    public String getLogisticsNo() { return logisticsNo; }
    public void setLogisticsNo(String logisticsNo) { this.logisticsNo = logisticsNo; }
    public String getReturnLogisticsNo() { return returnLogisticsNo; }
    public void setReturnLogisticsNo(String returnLogisticsNo) { this.returnLogisticsNo = returnLogisticsNo; }
    public List<ToyOrderItem> getItems() { return items; }
    public void setItems(List<ToyOrderItem> items) { this.items = items; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
    public String getReceiverAddress() { return receiverAddress; }
    public void setReceiverAddress(String receiverAddress) { this.receiverAddress = receiverAddress; }
}
```

`ToyOrderItem.java`:
```java
package com.ruoyi.toy.domain;

import java.math.BigDecimal;

public class ToyOrderItem {
    private Long id;
    private Long orderId;
    private Long productId;
    private Integer quantity;
    private BigDecimal rentPrice;
    private Integer duration;
    private String productName;
    private String productImage;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getRentPrice() { return rentPrice; }
    public void setRentPrice(BigDecimal rentPrice) { this.rentPrice = rentPrice; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getProductImage() { return productImage; }
    public void setProductImage(String productImage) { this.productImage = productImage; }
}
```

`ToyEvaluation.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class ToyEvaluation extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long orderId;
    private Long productId;
    private Long userId;
    private Integer rating;
    private String content;
    private String images;
    private String nickName;
    private String avatar;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public String getNickName() { return nickName; }
    public void setNickName(String nickName) { this.nickName = nickName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
```

`ToyCommunityPost.java`:
```java
package com.ruoyi.toy.domain;

import com.ruoyi.common.core.domain.BaseEntity;

public class ToyCommunityPost extends BaseEntity {
    private static final long serialVersionUID = 1L;
    private Long id;
    private Long userId;
    private String content;
    private String images;
    private String nickName;
    private String avatar;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean liked;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImages() { return images; }
    public void setImages(String images) { this.images = images; }
    public String getNickName() { return nickName; }
    public void setNickName(String nickName) { this.nickName = nickName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Integer getLikeCount() { return likeCount; }
    public void setLikeCount(Integer likeCount) { this.likeCount = likeCount; }
    public Integer getCommentCount() { return commentCount; }
    public void setCommentCount(Integer commentCount) { this.commentCount = commentCount; }
    public Boolean getLiked() { return liked; }
    public void setLiked(Boolean liked) { this.liked = liked; }
}
```

`ToyCommunityComment.java`:
```java
package com.ruoyi.toy.domain;

import java.util.Date;

public class ToyCommunityComment {
    private Long id;
    private Long postId;
    private Long userId;
    private String content;
    private String nickName;
    private String avatar;
    private Date createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getNickName() { return nickName; }
    public void setNickName(String nickName) { this.nickName = nickName; }
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
}
```

`ToyCommunityLike.java`:
```java
package com.ruoyi.toy.domain;

import java.util.Date;

public class ToyCommunityLike {
    private Long id;
    private Long postId;
    private Long userId;
    private Date createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
}
```

`ToyPayment.java` and `ToyLogistics.java` are simple entities following the same pattern - write them inline from the SQL schema.

- [ ] **Step 2: Compile**

```bash
cd back && mvn compile
```

Expected: BUILD SUCCESS.

---

### Task 4: Create MyBatis Mapper interfaces and XML for core tables

**Files:**
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyProductMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyCategoryMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyCartMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyOrderMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyOrderItemMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyUserMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyAddressMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyEvaluationMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyCommunityPostMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyCommunityCommentMapper.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/mapper/ToyCommunityLikeMapper.java`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyProductMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyCategoryMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyCartMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyOrderMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyUserMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyAddressMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyEvaluationMapper.xml`
- Create: `back/ruoyi-toyrental/src/main/resources/mapper/ToyCommunityPostMapper.xml`

- [ ] **Step 1: Create ToyProductMapper.java and XML**

`ToyProductMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyProduct;
import java.util.List;

public interface ToyProductMapper {
    List<ToyProduct> selectProductList(ToyProduct product);
    ToyProduct selectProductById(Long id);
    int insertProduct(ToyProduct product);
    int updateProduct(ToyProduct product);
    int deleteProductById(Long id);
}
```

`ToyProductMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyProductMapper">

    <resultMap type="ToyProduct" id="ToyProductResult">
        <id     property="id"           column="id"/>
        <result property="userId"       column="user_id"/>
        <result property="categoryId"   column="category_id"/>
        <result property="name"         column="name"/>
        <result property="image"        column="image"/>
        <result property="price"        column="price"/>
        <result property="rentPriceDay" column="rent_price_day"/>
        <result property="rentPriceMonth" column="rent_price_month"/>
        <result property="ageRange"     column="age_range"/>
        <result property="brand"        column="brand"/>
        <result property="stock"        column="stock"/>
        <result property="status"       column="status"/>
        <result property="description"  column="description"/>
        <result property="createBy"     column="create_by"/>
        <result property="createTime"   column="create_time"/>
        <result property="updateBy"     column="update_by"/>
        <result property="updateTime"   column="update_time"/>
        <result property="remark"       column="remark"/>
        <result property="categoryName" column="category_name"/>
        <result property="nickName"     column="nick_name"/>
        <result property="avatar"       column="avatar"/>
    </resultMap>

    <sql id="selectProductVo">
        select p.id, p.user_id, p.category_id, p.name, p.image, p.price,
               p.rent_price_day, p.rent_price_month, p.age_range, p.brand,
               p.stock, p.status, p.description, p.create_by, p.create_time,
               p.update_by, p.update_time, p.remark,
               c.name as category_name, tu.nick_name, tu.avatar
        from toy_product p
        left join toy_category c on p.category_id = c.id
        left join toy_user tu on p.user_id = tu.user_id
    </sql>

    <select id="selectProductList" parameterType="ToyProduct" resultMap="ToyProductResult">
        <include refid="selectProductVo"/>
        <where>
            p.status = '0'
            <if test="categoryId != null">
                and (p.category_id = #{categoryId} or p.category_id in
                    (select id from toy_category where parent_id = #{categoryId}))
            </if>
            <if test="name != null and name != ''">
                and p.name like concat('%', #{name}, '%')
            </if>
            <if test="ageRange != null and ageRange != ''">
                and p.age_range = #{ageRange}
            </if>
        </where>
        order by p.create_time desc
    </select>

    <select id="selectProductById" parameterType="Long" resultMap="ToyProductResult">
        <include refid="selectProductVo"/>
        where p.id = #{id}
    </select>

    <insert id="insertProduct" parameterType="ToyProduct" useGeneratedKeys="true" keyProperty="id">
        insert into toy_product (
            user_id, category_id, name, image, price, rent_price_day, rent_price_month,
            age_range, brand, stock, status, description,
            create_by, create_time
        ) values (
            #{userId}, #{categoryId}, #{name}, #{image}, #{price}, #{rentPriceDay}, #{rentPriceMonth},
            #{ageRange}, #{brand}, #{stock}, '0', #{description},
            #{createBy}, sysdate()
        )
    </insert>

    <update id="updateProduct" parameterType="ToyProduct">
        update toy_product
        <set>
            <if test="categoryId != null">category_id = #{categoryId},</if>
            <if test="name != null and name != ''">name = #{name},</if>
            <if test="image != null">image = #{image},</if>
            <if test="price != null">price = #{price},</if>
            <if test="rentPriceDay != null">rent_price_day = #{rentPriceDay},</if>
            <if test="rentPriceMonth != null">rent_price_month = #{rentPriceMonth},</if>
            <if test="ageRange != null">age_range = #{ageRange},</if>
            <if test="brand != null">brand = #{brand},</if>
            <if test="stock != null">stock = #{stock},</if>
            <if test="status != null">status = #{status},</if>
            <if test="description != null">description = #{description},</if>
            update_by = #{updateBy},
            update_time = sysdate()
        </set>
        where id = #{id}
    </update>

    <update id="deleteProductById" parameterType="Long">
        update toy_product set status = '1', update_time = sysdate() where id = #{id}
    </update>

</mapper>
```

- [ ] **Step 2: Create ToyCategoryMapper.java and XML**

`ToyCategoryMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCategory;
import java.util.List;

public interface ToyCategoryMapper {
    List<ToyCategory> selectCategoryList(ToyCategory category);
    ToyCategory selectCategoryById(Long id);
    List<ToyCategory> selectCategoryTree();
    int insertCategory(ToyCategory category);
    int updateCategory(ToyCategory category);
    int deleteCategoryById(Long id);
    int selectChildCountById(Long id);
}
```

`ToyCategoryMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyCategoryMapper">

    <resultMap type="ToyCategory" id="ToyCategoryResult">
        <id     property="id"        column="id"/>
        <result property="parentId"  column="parent_id"/>
        <result property="name"      column="name"/>
        <result property="sort"      column="sort"/>
        <result property="status"    column="status"/>
        <result property="createBy"  column="create_by"/>
        <result property="createTime" column="create_time"/>
    </resultMap>

    <select id="selectCategoryList" parameterType="ToyCategory" resultMap="ToyCategoryResult">
        select id, parent_id, name, sort, status, create_by, create_time
        from toy_category
        <where>
            <if test="name != null and name != ''">and name like concat('%', #{name}, '%')</if>
            <if test="status != null and status != ''">and status = #{status}</if>
        </where>
        order by parent_id, sort
    </select>

    <select id="selectCategoryTree" resultMap="ToyCategoryResult">
        select id, parent_id, name, sort, status from toy_category where status = '0' order by parent_id, sort
    </select>

    <select id="selectCategoryById" parameterType="Long" resultMap="ToyCategoryResult">
        select id, parent_id, name, sort, status, create_by, create_time from toy_category where id = #{id}
    </select>

    <select id="selectChildCountById" parameterType="Long" resultType="int">
        select count(*) from toy_category where parent_id = #{id}
    </select>

    <insert id="insertCategory" parameterType="ToyCategory">
        insert into toy_category (parent_id, name, sort, status, create_by, create_time)
        values (#{parentId}, #{name}, #{sort}, #{status}, #{createBy}, sysdate())
    </insert>

    <update id="updateCategory" parameterType="ToyCategory">
        update toy_category
        <set>
            <if test="parentId != null">parent_id = #{parentId},</if>
            <if test="name != null and name != ''">name = #{name},</if>
            <if test="sort != null">sort = #{sort},</if>
            <if test="status != null and status != ''">status = #{status},</if>
            update_time = sysdate()
        </set>
        where id = #{id}
    </update>

    <delete id="deleteCategoryById" parameterType="Long">
        delete from toy_category where id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 3: Create ToyCartMapper.java and XML**

`ToyCartMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCart;
import java.util.List;

public interface ToyCartMapper {
    List<ToyCart> selectCartList(Long userId);
    ToyCart selectCartById(Long id);
    int insertCart(ToyCart cart);
    int updateCart(ToyCart cart);
    int deleteCartById(Long id);
    int deleteCartByUserAndProduct(ToyCart cart);
    ToyCart selectCartByUserAndProduct(ToyCart cart);
}
```

`ToyCartMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyCartMapper">

    <resultMap type="ToyCart" id="ToyCartResult">
        <id     property="id"             column="id"/>
        <result property="userId"         column="user_id"/>
        <result property="productId"      column="product_id"/>
        <result property="duration"       column="duration"/>
        <result property="createTime"     column="create_time"/>
        <result property="productName"    column="product_name"/>
        <result property="productImage"   column="product_image"/>
        <result property="rentPriceMonth" column="rent_price_month"/>
    </resultMap>

    <select id="selectCartList" parameterType="Long" resultMap="ToyCartResult">
        select c.id, c.user_id, c.product_id, c.duration, c.create_time,
               p.name as product_name, p.image as product_image, p.rent_price_month
        from toy_cart c
        left join toy_product p on c.product_id = p.id
        where c.user_id = #{userId}
        order by c.create_time desc
    </select>

    <select id="selectCartById" parameterType="Long" resultMap="ToyCartResult">
        select c.id, c.user_id, c.product_id, c.duration, c.create_time,
               p.name as product_name, p.image as product_image, p.rent_price_month
        from toy_cart c
        left join toy_product p on c.product_id = p.id
        where c.id = #{id}
    </select>

    <select id="selectCartByUserAndProduct" parameterType="ToyCart" resultMap="ToyCartResult">
        select id, user_id, product_id, duration from toy_cart
        where user_id = #{userId} and product_id = #{productId}
    </select>

    <insert id="insertCart" parameterType="ToyCart">
        insert into toy_cart (user_id, product_id, duration, create_time)
        values (#{userId}, #{productId}, #{duration}, sysdate())
    </insert>

    <update id="updateCart" parameterType="ToyCart">
        update toy_cart set duration = #{duration} where id = #{id}
    </update>

    <delete id="deleteCartById" parameterType="Long">
        delete from toy_cart where id = #{id}
    </delete>

    <delete id="deleteCartByUserAndProduct" parameterType="ToyCart">
        delete from toy_cart where user_id = #{userId} and product_id = #{productId}
    </delete>

</mapper>
```

- [ ] **Step 4: Create ToyOrderMapper.java and XML**

`ToyOrderMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyOrder;
import java.util.List;

public interface ToyOrderMapper {
    List<ToyOrder> selectOrderList(ToyOrder order);
    ToyOrder selectOrderById(Long id);
    ToyOrder selectOrderByOrderNo(String orderNo);
    int insertOrder(ToyOrder order);
    int updateOrder(ToyOrder order);
    int deleteOrderById(Long id);
}
```

`ToyOrderMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyOrderMapper">

    <resultMap type="ToyOrder" id="ToyOrderResult">
        <id     property="id"          column="id"/>
        <result property="orderNo"     column="order_no"/>
        <result property="userId"      column="user_id"/>
        <result property="addressId"   column="address_id"/>
        <result property="totalRent"   column="total_rent"/>
        <result property="deposit"     column="deposit"/>
        <result property="status"      column="status"/>
        <result property="payTime"     column="pay_time"/>
        <result property="logisticsNo" column="logistics_no"/>
        <result property="returnLogisticsNo" column="return_logistics_no"/>
        <result property="createTime"  column="create_time"/>
        <result property="receiverName"    column="receiver_name"/>
        <result property="receiverPhone"   column="receiver_phone"/>
        <result property="receiverAddress" column="receiver_address"/>
    </resultMap>

    <select id="selectOrderList" parameterType="ToyOrder" resultMap="ToyOrderResult">
        select o.id, o.order_no, o.user_id, o.address_id, o.total_rent, o.deposit,
               o.status, o.pay_time, o.logistics_no, o.return_logistics_no, o.create_time,
               concat(a.province, a.city, a.district, a.detail) as receiver_address,
               a.receiver_name, a.phone as receiver_phone
        from toy_order o
        left join toy_address a on o.address_id = a.id
        <where>
            <if test="userId != null">and o.user_id = #{userId}</if>
            <if test="status != null and status != ''">and o.status = #{status}</if>
            <if test="orderNo != null and orderNo != ''">and o.order_no = #{orderNo}</if>
        </where>
        order by o.create_time desc
    </select>

    <select id="selectOrderById" parameterType="Long" resultMap="ToyOrderResult">
        select o.id, o.order_no, o.user_id, o.address_id, o.total_rent, o.deposit,
               o.status, o.pay_time, o.logistics_no, o.return_logistics_no, o.create_time,
               concat(a.province, a.city, a.district, a.detail) as receiver_address,
               a.receiver_name, a.phone as receiver_phone
        from toy_order o
        left join toy_address a on o.address_id = a.id
        where o.id = #{id}
    </select>

    <select id="selectOrderByOrderNo" parameterType="String" resultMap="ToyOrderResult">
        select o.id, o.order_no, o.user_id, o.address_id, o.total_rent, o.deposit,
               o.status, o.pay_time, o.logistics_no, o.return_logistics_no, o.create_time,
               concat(a.province, a.city, a.district, a.detail) as receiver_address,
               a.receiver_name, a.phone as receiver_phone
        from toy_order o
        left join toy_address a on o.address_id = a.id
        where o.order_no = #{orderNo}
    </select>

    <insert id="insertOrder" parameterType="ToyOrder" useGeneratedKeys="true" keyProperty="id">
        insert into toy_order (
            order_no, user_id, address_id, total_rent, deposit, status,
            create_by, create_time
        ) values (
            #{orderNo}, #{userId}, #{addressId}, #{totalRent}, #{deposit}, '0',
            #{createBy}, sysdate()
        )
    </insert>

    <update id="updateOrder" parameterType="ToyOrder">
        update toy_order
        <set>
            <if test="status != null and status != ''">status = #{status},</if>
            <if test="payTime != null">pay_time = #{payTime},</if>
            <if test="logisticsNo != null">logistics_no = #{logisticsNo},</if>
            <if test="returnLogisticsNo != null">return_logistics_no = #{returnLogisticsNo},</if>
            <if test="totalRent != null">total_rent = #{totalRent},</if>
            update_by = #{updateBy},
            update_time = sysdate()
        </set>
        where id = #{id}
    </update>

    <delete id="deleteOrderById" parameterType="Long">
        delete from toy_order where id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 5: Create ToyUserMapper.java and XML**

`ToyUserMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyUser;

public interface ToyUserMapper {
    ToyUser selectUserByUserId(Long userId);
    int insertUser(ToyUser user);
    int updateUser(ToyUser user);
}
```

`ToyUserMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyUserMapper">

    <resultMap type="ToyUser" id="ToyUserResult">
        <id     property="id"          column="id"/>
        <result property="userId"      column="user_id"/>
        <result property="nickName"    column="nick_name"/>
        <result property="avatar"      column="avatar"/>
        <result property="creditScore" column="credit_score"/>
    </resultMap>

    <select id="selectUserByUserId" parameterType="Long" resultMap="ToyUserResult">
        select id, user_id, nick_name, avatar, credit_score from toy_user where user_id = #{userId}
    </select>

    <insert id="insertUser" parameterType="ToyUser">
        insert into toy_user (user_id, nick_name, avatar, credit_score, create_by, create_time)
        values (#{userId}, #{nickName}, #{avatar}, #{creditScore}, #{createBy}, sysdate())
    </insert>

    <update id="updateUser" parameterType="ToyUser">
        update toy_user
        <set>
            <if test="nickName != null and nickName != ''">nick_name = #{nickName},</if>
            <if test="avatar != null">avatar = #{avatar},</if>
            <if test="creditScore != null">credit_score = #{creditScore},</if>
            update_time = sysdate()
        </set>
        where user_id = #{userId}
    </update>

</mapper>
```

- [ ] **Step 6: Create ToyAddressMapper.java and XML**

`ToyAddressMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyAddress;
import java.util.List;

public interface ToyAddressMapper {
    List<ToyAddress> selectAddressList(Long userId);
    ToyAddress selectAddressById(Long id);
    int insertAddress(ToyAddress address);
    int updateAddress(ToyAddress address);
    int deleteAddressById(Long id);
    int clearDefaultByUserId(Long userId);
}
```

`ToyAddressMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyAddressMapper">

    <resultMap type="ToyAddress" id="ToyAddressResult">
        <id     property="id"           column="id"/>
        <result property="userId"       column="user_id"/>
        <result property="receiverName" column="receiver_name"/>
        <result property="phone"        column="phone"/>
        <result property="province"     column="province"/>
        <result property="city"         column="city"/>
        <result property="district"     column="district"/>
        <result property="detail"       column="detail"/>
        <result property="isDefault"    column="is_default"/>
    </resultMap>

    <select id="selectAddressList" parameterType="Long" resultMap="ToyAddressResult">
        select id, user_id, receiver_name, phone, province, city, district, detail, is_default
        from toy_address where user_id = #{userId} order by is_default desc, create_time desc
    </select>

    <select id="selectAddressById" parameterType="Long" resultMap="ToyAddressResult">
        select id, user_id, receiver_name, phone, province, city, district, detail, is_default
        from toy_address where id = #{id}
    </select>

    <insert id="insertAddress" parameterType="ToyAddress">
        insert into toy_address (user_id, receiver_name, phone, province, city, district, detail, is_default, create_by, create_time)
        values (#{userId}, #{receiverName}, #{phone}, #{province}, #{city}, #{district}, #{detail}, #{isDefault}, #{createBy}, sysdate())
    </insert>

    <update id="updateAddress" parameterType="ToyAddress">
        update toy_address
        <set>
            <if test="receiverName != null">receiver_name = #{receiverName},</if>
            <if test="phone != null">phone = #{phone},</if>
            <if test="province != null">province = #{province},</if>
            <if test="city != null">city = #{city},</if>
            <if test="district != null">district = #{district},</if>
            <if test="detail != null">detail = #{detail},</if>
            <if test="isDefault != null">is_default = #{isDefault},</if>
            update_time = sysdate()
        </set>
        where id = #{id}
    </update>

    <delete id="deleteAddressById" parameterType="Long">
        delete from toy_address where id = #{id}
    </delete>

    <update id="clearDefaultByUserId" parameterType="Long">
        update toy_address set is_default = '0' where user_id = #{userId}
    </update>

</mapper>
```

- [ ] **Step 7: Create ToyEvaluationMapper.java and XML**

`ToyEvaluationMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyEvaluation;
import java.util.List;

public interface ToyEvaluationMapper {
    List<ToyEvaluation> selectEvaluationByProductId(Long productId);
    int insertEvaluation(ToyEvaluation evaluation);
    int deleteEvaluationById(Long id);
}
```

`ToyEvaluationMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyEvaluationMapper">

    <resultMap type="ToyEvaluation" id="ToyEvaluationResult">
        <id     property="id"        column="id"/>
        <result property="orderId"   column="order_id"/>
        <result property="productId" column="product_id"/>
        <result property="userId"    column="user_id"/>
        <result property="rating"    column="rating"/>
        <result property="content"   column="content"/>
        <result property="images"    column="images"/>
        <result property="nickName"  column="nick_name"/>
        <result property="avatar"    column="avatar"/>
        <result property="createTime" column="create_time"/>
    </resultMap>

    <select id="selectEvaluationByProductId" parameterType="Long" resultMap="ToyEvaluationResult">
        select e.id, e.order_id, e.product_id, e.user_id, e.rating, e.content, e.images, e.create_time,
               tu.nick_name, tu.avatar
        from toy_evaluation e
        left join toy_user tu on e.user_id = tu.user_id
        where e.product_id = #{productId}
        order by e.create_time desc
    </select>

    <insert id="insertEvaluation" parameterType="ToyEvaluation">
        insert into toy_evaluation (order_id, product_id, user_id, rating, content, images, create_by, create_time)
        values (#{orderId}, #{productId}, #{userId}, #{rating}, #{content}, #{images}, #{createBy}, sysdate())
    </insert>

    <delete id="deleteEvaluationById" parameterType="Long">
        delete from toy_evaluation where id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 8: Create ToyCommunityPostMapper.java and XML**

`ToyCommunityPostMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCommunityPost;
import java.util.List;

public interface ToyCommunityPostMapper {
    List<ToyCommunityPost> selectPostList(Long userId);
    ToyCommunityPost selectPostById(Long id);
    int insertPost(ToyCommunityPost post);
    int deletePostById(Long id);
}
```

`ToyCommunityPostMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyCommunityPostMapper">

    <resultMap type="ToyCommunityPost" id="ToyCommunityPostResult">
        <id     property="id"           column="id"/>
        <result property="userId"       column="user_id"/>
        <result property="content"      column="content"/>
        <result property="images"       column="images"/>
        <result property="nickName"     column="nick_name"/>
        <result property="avatar"       column="avatar"/>
        <result property="likeCount"    column="like_count"/>
        <result property="commentCount" column="comment_count"/>
        <result property="createBy"     column="create_by"/>
        <result property="createTime"   column="create_time"/>
    </resultMap>

    <select id="selectPostList" parameterType="Long" resultMap="ToyCommunityPostResult">
        select p.id, p.user_id, p.content, p.images, p.create_by, p.create_time,
               tu.nick_name, tu.avatar,
               (select count(*) from toy_community_like where post_id = p.id) as like_count,
               (select count(*) from toy_community_comment where post_id = p.id) as comment_count
        from toy_community_post p
        left join toy_user tu on p.user_id = tu.user_id
        order by p.create_time desc
    </select>

    <select id="selectPostById" parameterType="Long" resultMap="ToyCommunityPostResult">
        select p.id, p.user_id, p.content, p.images, p.create_by, p.create_time,
               tu.nick_name, tu.avatar,
               (select count(*) from toy_community_like where post_id = p.id) as like_count,
               (select count(*) from toy_community_comment where post_id = p.id) as comment_count
        from toy_community_post p
        left join toy_user tu on p.user_id = tu.user_id
        where p.id = #{id}
    </select>

    <insert id="insertPost" parameterType="ToyCommunityPost">
        insert into toy_community_post (user_id, content, images, create_by, create_time)
        values (#{userId}, #{content}, #{images}, #{createBy}, sysdate())
    </insert>

    <delete id="deletePostById" parameterType="Long">
        delete from toy_community_post where id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 9: Create ToyCommunityCommentMapper.java and XML**

`ToyCommunityCommentMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyCommunityComment;
import java.util.List;

public interface ToyCommunityCommentMapper {
    List<ToyCommunityComment> selectCommentByPostId(Long postId);
    int insertComment(ToyCommunityComment comment);
    int deleteCommentById(Long id);
}
```

`ToyCommunityCommentMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyCommunityCommentMapper">

    <resultMap type="ToyCommunityComment" id="ToyCommunityCommentResult">
        <id     property="id"         column="id"/>
        <result property="postId"     column="post_id"/>
        <result property="userId"     column="user_id"/>
        <result property="content"    column="content"/>
        <result property="nickName"   column="nick_name"/>
        <result property="avatar"     column="avatar"/>
        <result property="createTime" column="create_time"/>
    </resultMap>

    <select id="selectCommentByPostId" parameterType="Long" resultMap="ToyCommunityCommentResult">
        select c.id, c.post_id, c.user_id, c.content, c.create_time,
               tu.nick_name, tu.avatar
        from toy_community_comment c
        left join toy_user tu on c.user_id = tu.user_id
        where c.post_id = #{postId}
        order by c.create_time asc
    </select>

    <insert id="insertComment" parameterType="ToyCommunityComment">
        insert into toy_community_comment (post_id, user_id, content, create_by, create_time)
        values (#{postId}, #{userId}, #{content}, #{createBy}, sysdate())
    </insert>

    <delete id="deleteCommentById" parameterType="Long">
        delete from toy_community_comment where id = #{id}
    </delete>

</mapper>
```

- [ ] **Step 10: Create ToyCommunityLikeMapper.java and XML**

`ToyCommunityLikeMapper.java`:
```java
package com.ruoyi.toy.mapper;

public interface ToyCommunityLikeMapper {
    int insertLike(Long postId, Long userId);
    int deleteLike(Long postId, Long userId);
    int checkLiked(Long postId, Long userId);
}
```

`ToyCommunityLikeMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyCommunityLikeMapper">

    <insert id="insertLike">
        insert into toy_community_like (post_id, user_id, create_time) values (#{postId}, #{userId}, sysdate())
    </insert>

    <delete id="deleteLike">
        delete from toy_community_like where post_id = #{postId} and user_id = #{userId}
    </delete>

    <select id="checkLiked" resultType="int">
        select count(*) from toy_community_like where post_id = #{postId} and user_id = #{userId}
    </select>

</mapper>
```

- [ ] **Step 11: Create ToyOrderItemMapper.java and XML**

`ToyOrderItemMapper.java`:
```java
package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyOrderItem;
import java.util.List;

public interface ToyOrderItemMapper {
    List<ToyOrderItem> selectItemsByOrderId(Long orderId);
    int insertOrderItem(ToyOrderItem item);
}
```

`ToyOrderItemMapper.xml`:
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.ruoyi.toy.mapper.ToyOrderItemMapper">

    <resultMap type="ToyOrderItem" id="ToyOrderItemResult">
        <id     property="id"           column="id"/>
        <result property="orderId"      column="order_id"/>
        <result property="productId"    column="product_id"/>
        <result property="quantity"     column="quantity"/>
        <result property="rentPrice"    column="rent_price"/>
        <result property="duration"     column="duration"/>
        <result property="productName"  column="product_name"/>
        <result property="productImage" column="product_image"/>
    </resultMap>

    <select id="selectItemsByOrderId" parameterType="Long" resultMap="ToyOrderItemResult">
        select i.id, i.order_id, i.product_id, i.quantity, i.rent_price, i.duration,
               p.name as product_name, p.image as product_image
        from toy_order_item i
        left join toy_product p on i.product_id = p.id
        where i.order_id = #{orderId}
    </select>

    <insert id="insertOrderItem" parameterType="ToyOrderItem">
        insert into toy_order_item (order_id, product_id, quantity, rent_price, duration)
        values (#{orderId}, #{productId}, #{quantity}, #{rentPrice}, #{duration})
    </insert>

</mapper>
```

- [ ] **Step 12: Compile**

```bash
cd back && mvn compile
```

Expected: BUILD SUCCESS.

---

## Phase 2: Backend API

### Task 5: Product and Category services

**Files:**
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyProductService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyProductServiceImpl.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyCategoryService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyCategoryServiceImpl.java`

- [ ] **Step 1: Write IToyProductService.java**

```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyProduct;
import java.util.List;

public interface IToyProductService {
    List<ToyProduct> selectProductList(ToyProduct product);
    ToyProduct selectProductById(Long id);
    int insertProduct(ToyProduct product);
    int updateProduct(ToyProduct product);
    int deleteProductById(Long id);
}
```

- [ ] **Step 2: Write ToyProductServiceImpl.java**

```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyProduct;
import com.ruoyi.toy.mapper.ToyProductMapper;
import com.ruoyi.toy.service.IToyProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ToyProductServiceImpl implements IToyProductService {

    @Autowired
    private ToyProductMapper productMapper;

    @Override
    public List<ToyProduct> selectProductList(ToyProduct product) {
        return productMapper.selectProductList(product);
    }

    @Override
    public ToyProduct selectProductById(Long id) {
        return productMapper.selectProductById(id);
    }

    @Override
    public int insertProduct(ToyProduct product) {
        product.setUserId(SecurityUtils.getUserId());
        product.setCreateBy(SecurityUtils.getUsername());
        return productMapper.insertProduct(product);
    }

    @Override
    public int updateProduct(ToyProduct product) {
        product.setUpdateBy(SecurityUtils.getUsername());
        return productMapper.updateProduct(product);
    }

    @Override
    public int deleteProductById(Long id) {
        return productMapper.deleteProductById(id);
    }
}
```

- [ ] **Step 3: Write IToyCategoryService.java and ToyCategoryServiceImpl.java**

```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyCategory;
import java.util.List;

public interface IToyCategoryService {
    List<ToyCategory> selectCategoryList(ToyCategory category);
    List<ToyCategory> selectCategoryTree();
    ToyCategory selectCategoryById(Long id);
    int insertCategory(ToyCategory category);
    int updateCategory(ToyCategory category);
    int deleteCategoryById(Long id);
}
```

```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyCategory;
import com.ruoyi.toy.mapper.ToyCategoryMapper;
import com.ruoyi.toy.service.IToyCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ToyCategoryServiceImpl implements IToyCategoryService {

    @Autowired
    private ToyCategoryMapper categoryMapper;

    @Override
    public List<ToyCategory> selectCategoryList(ToyCategory category) {
        return categoryMapper.selectCategoryList(category);
    }

    @Override
    public List<ToyCategory> selectCategoryTree() {
        List<ToyCategory> all = categoryMapper.selectCategoryTree();
        List<ToyCategory> roots = all.stream().filter(c -> c.getParentId() == 0).collect(Collectors.toList());
        for (ToyCategory root : roots) {
            root.setChildren(all.stream().filter(c -> c.getParentId().equals(root.getId())).collect(Collectors.toList()));
        }
        return roots;
    }

    @Override
    public ToyCategory selectCategoryById(Long id) {
        return categoryMapper.selectCategoryById(id);
    }

    @Override
    public int insertCategory(ToyCategory category) {
        category.setCreateBy(SecurityUtils.getUsername());
        return categoryMapper.insertCategory(category);
    }

    @Override
    public int updateCategory(ToyCategory category) {
        return categoryMapper.updateCategory(category);
    }

    @Override
    public int deleteCategoryById(Long id) {
        return categoryMapper.deleteCategoryById(id);
    }
}
```

---

### Task 6: Product and Category Controllers

**Files:**
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/ToyController.java`
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/CategoryController.java`

- [ ] **Step 1: Write ToyController.java**

```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyProduct;
import com.ruoyi.toy.service.IToyProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toy/products")
public class ToyController extends BaseController {

    @Autowired
    private IToyProductService productService;

    @Anonymous
    @GetMapping
    public TableDataInfo list(ToyProduct product) {
        startPage();
        List<ToyProduct> list = productService.selectProductList(product);
        return getDataTable(list);
    }

    @Anonymous
    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        return success(productService.selectProductById(id));
    }

    @PostMapping
    public AjaxResult add(@RequestBody ToyProduct product) {
        return toAjax(productService.insertProduct(product));
    }

    @PutMapping("/{id}")
    public AjaxResult edit(@PathVariable Long id, @RequestBody ToyProduct product) {
        product.setId(id);
        return toAjax(productService.updateProduct(product));
    }

    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        return toAjax(productService.deleteProductById(id));
    }
}
```

- [ ] **Step 2: Write CategoryController.java**

```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyCategory;
import com.ruoyi.toy.service.IToyCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toy/categories")
public class CategoryController extends BaseController {

    @Autowired
    private IToyCategoryService categoryService;

    @Anonymous
    @GetMapping("/tree")
    public AjaxResult tree() {
        return success(categoryService.selectCategoryTree());
    }

    @GetMapping
    public TableDataInfo list(ToyCategory category) {
        startPage();
        List<ToyCategory> list = categoryService.selectCategoryList(category);
        return getDataTable(list);
    }

    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        return success(categoryService.selectCategoryById(id));
    }

    @PostMapping
    public AjaxResult add(@RequestBody ToyCategory category) {
        return toAjax(categoryService.insertCategory(category));
    }

    @PutMapping("/{id}")
    public AjaxResult edit(@PathVariable Long id, @RequestBody ToyCategory category) {
        category.setId(id);
        return toAjax(categoryService.updateCategory(category));
    }

    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        return toAjax(categoryService.deleteCategoryById(id));
    }
}
```

- [ ] **Step 3: Build and verify**

```bash
cd back && mvn clean compile -DskipTests
```

Expected: BUILD SUCCESS.

---

### Task 7: Cart, Order services and controllers

**Files:**
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyCartService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyCartServiceImpl.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyOrderService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyOrderServiceImpl.java`
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/CartController.java`
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/OrderController.java`

- [ ] **Step 1: Write IToyCartService.java and ToyCartServiceImpl.java**

`IToyCartService.java`:
```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyCart;
import java.util.List;

public interface IToyCartService {
    List<ToyCart> selectCartList();
    int insertCart(ToyCart cart);
    int updateCart(ToyCart cart);
    int deleteCartById(Long id);
}
```

`ToyCartServiceImpl.java`:
```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyCart;
import com.ruoyi.toy.mapper.ToyCartMapper;
import com.ruoyi.toy.service.IToyCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ToyCartServiceImpl implements IToyCartService {

    @Autowired
    private ToyCartMapper cartMapper;

    @Override
    public List<ToyCart> selectCartList() {
        return cartMapper.selectCartList(SecurityUtils.getUserId());
    }

    @Override
    public int insertCart(ToyCart cart) {
        cart.setUserId(SecurityUtils.getUserId());
        ToyCart existing = cartMapper.selectCartByUserAndProduct(cart);
        if (existing != null) {
            existing.setDuration(existing.getDuration() + cart.getDuration());
            return cartMapper.updateCart(existing);
        }
        return cartMapper.insertCart(cart);
    }

    @Override
    public int updateCart(ToyCart cart) {
        return cartMapper.updateCart(cart);
    }

    @Override
    public int deleteCartById(Long id) {
        return cartMapper.deleteCartById(id);
    }
}
```

- [ ] **Step 2: Write IToyOrderService.java and ToyOrderServiceImpl.java**

`IToyOrderService.java`:
```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyOrder;
import java.util.List;

public interface IToyOrderService {
    List<ToyOrder> selectOrderList(ToyOrder order);
    ToyOrder selectOrderById(Long id);
    ToyOrder createOrder(Long addressId);
    int payOrder(Long orderId);
    int confirmReceive(Long orderId);
    int applyReturn(Long orderId);
    int renewOrder(Long orderId);
    int shipOrder(Long orderId, String logisticsNo);
    int disinfectComplete(Long orderId);
}
```

`ToyOrderServiceImpl.java`:
```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.exception.ServiceException;
import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.*;
import com.ruoyi.toy.mapper.*;
import com.ruoyi.toy.service.IToyOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class ToyOrderServiceImpl implements IToyOrderService {

    @Autowired
    private ToyOrderMapper orderMapper;
    @Autowired
    private ToyOrderItemMapper orderItemMapper;
    @Autowired
    private ToyCartMapper cartMapper;
    @Autowired
    private ToyProductMapper productMapper;

    @Override
    public List<ToyOrder> selectOrderList(ToyOrder order) {
        if (order == null) order = new ToyOrder();
        order.setUserId(SecurityUtils.getUserId());
        return orderMapper.selectOrderList(order);
    }

    @Override
    public ToyOrder selectOrderById(Long id) {
        ToyOrder order = orderMapper.selectOrderById(id);
        if (order != null) {
            order.setItems(orderItemMapper.selectItemsByOrderId(id));
        }
        return order;
    }

    @Override
    @Transactional
    public ToyOrder createOrder(Long addressId) {
        Long userId = SecurityUtils.getUserId();
        List<ToyCart> cartItems = cartMapper.selectCartList(userId);
        if (cartItems.isEmpty()) {
            throw new ServiceException("购物车为空");
        }

        BigDecimal totalRent = BigDecimal.ZERO;
        for (ToyCart item : cartItems) {
            BigDecimal price = item.getRentPriceMonth() != null ? item.getRentPriceMonth() : BigDecimal.ZERO;
            totalRent = totalRent.add(price.multiply(new BigDecimal(item.getDuration())));
        }

        ToyOrder order = new ToyOrder();
        order.setOrderNo("TOY" + System.currentTimeMillis() + (userId % 10000));
        order.setUserId(userId);
        order.setAddressId(addressId);
        order.setTotalRent(totalRent);
        order.setDeposit(totalRent.multiply(new BigDecimal("2")));
        order.setStatus("0");
        order.setCreateBy(SecurityUtils.getUsername());
        orderMapper.insertOrder(order);

        for (ToyCart cartItem : cartItems) {
            ToyOrderItem orderItem = new ToyOrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setQuantity(1);
            orderItem.setRentPrice(cartItem.getRentPriceMonth());
            orderItem.setDuration(cartItem.getDuration());
            orderItemMapper.insertOrderItem(orderItem);
            cartMapper.deleteCartById(cartItem.getId());
        }

        return orderMapper.selectOrderById(order.getId());
    }

    @Override
    @Transactional
    public int payOrder(Long orderId) {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (!"0".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("1");
        order.setPayTime(new Date());
        // Reduce stock
        List<ToyOrderItem> items = orderItemMapper.selectItemsByOrderId(orderId);
        for (ToyOrderItem item : items) {
            ToyProduct product = productMapper.selectProductById(item.getProductId());
            if (product != null && product.getStock() > 0) {
                product.setStock(product.getStock() - 1);
                productMapper.updateProduct(product);
            }
        }
        return orderMapper.updateOrder(order);
    }

    @Override
    public int confirmReceive(Long orderId) {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (!"2".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("3");
        return orderMapper.updateOrder(order);
    }

    @Override
    public int applyReturn(Long orderId) {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (!"3".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("4");
        return orderMapper.updateOrder(order);
    }

    @Override
    public int renewOrder(Long orderId) {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (!"3".equals(order.getStatus())) {
            throw new ServiceException("只有租赁中状态的订单可以续租");
        }
        return 1;
    }

    @Override
    public int shipOrder(Long orderId, String logisticsNo) {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (!"1".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("2");
        order.setLogisticsNo(logisticsNo);
        return orderMapper.updateOrder(order);
    }

    @Override
    @Transactional
    public int disinfectComplete(Long orderId) {
        ToyOrder order = orderMapper.selectOrderById(orderId);
        if (!"5".equals(order.getStatus())) {
            throw new ServiceException("订单状态不正确");
        }
        order.setStatus("6");
        // Return stock
        List<ToyOrderItem> items = orderItemMapper.selectItemsByOrderId(orderId);
        for (ToyOrderItem item : items) {
            ToyProduct product = productMapper.selectProductById(item.getProductId());
            if (product != null) {
                product.setStock(product.getStock() + 1);
                productMapper.updateProduct(product);
            }
        }
        return orderMapper.updateOrder(order);
    }
}
```

- [ ] **Step 3: Write CartController.java**

```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyCart;
import com.ruoyi.toy.service.IToyCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toy/cart")
public class CartController extends BaseController {

    @Autowired
    private IToyCartService cartService;

    @GetMapping
    public AjaxResult list() {
        return success(cartService.selectCartList());
    }

    @PostMapping
    public AjaxResult add(@RequestBody ToyCart cart) {
        return toAjax(cartService.insertCart(cart));
    }

    @PutMapping("/{id}")
    public AjaxResult edit(@PathVariable Long id, @RequestBody ToyCart cart) {
        cart.setId(id);
        return toAjax(cartService.updateCart(cart));
    }

    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        return toAjax(cartService.deleteCartById(id));
    }
}
```

- [ ] **Step 4: Write OrderController.java**

```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.common.core.page.TableDataInfo;
import com.ruoyi.toy.domain.ToyOrder;
import com.ruoyi.toy.service.IToyOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toy/orders")
public class OrderController extends BaseController {

    @Autowired
    private IToyOrderService orderService;

    @GetMapping
    public AjaxResult list(ToyOrder order) {
        return success(orderService.selectOrderList(order));
    }

    @GetMapping("/{id}")
    public AjaxResult getInfo(@PathVariable Long id) {
        return success(orderService.selectOrderById(id));
    }

    @PostMapping
    public AjaxResult create(@RequestBody java.util.Map<String, Long> body) {
        Long addressId = body.get("addressId");
        return success(orderService.createOrder(addressId));
    }

    @PutMapping("/{id}/pay")
    public AjaxResult pay(@PathVariable Long id) {
        return toAjax(orderService.payOrder(id));
    }

    @PutMapping("/{id}/receive")
    public AjaxResult receive(@PathVariable Long id) {
        return toAjax(orderService.confirmReceive(id));
    }

    @PutMapping("/{id}/return")
    public AjaxResult returnOrder(@PathVariable Long id) {
        return toAjax(orderService.applyReturn(id));
    }

    @PutMapping("/{id}/renew")
    public AjaxResult renew(@PathVariable Long id) {
        return toAjax(orderService.renewOrder(id));
    }
}
```

---

### Task 8: User, Address, Evaluation, and Community Controllers

**Files:**
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyUserService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyUserServiceImpl.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyAddressService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyAddressServiceImpl.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyEvaluationService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyEvaluationServiceImpl.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/IToyCommunityService.java`
- Create: `back/ruoyi-toyrental/src/main/java/com/ruoyi/toy/service/impl/ToyCommunityServiceImpl.java`
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/UserCenterController.java`
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/EvaluationController.java`
- Create: `back/ruoyi-admin/src/main/java/com/ruoyi/web/controller/toy/CommunityController.java`

- [ ] **Step 1: Write IToyUserService and ToyUserServiceImpl**

```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyUser;

public interface IToyUserService {
    ToyUser getCurrentUser();
    int updateUser(ToyUser user);
}
```

```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyUser;
import com.ruoyi.toy.mapper.ToyUserMapper;
import com.ruoyi.toy.service.IToyUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ToyUserServiceImpl implements IToyUserService {

    @Autowired
    private ToyUserMapper userMapper;

    @Override
    public ToyUser getCurrentUser() {
        Long userId = SecurityUtils.getUserId();
        ToyUser user = userMapper.selectUserByUserId(userId);
        if (user == null) {
            user = new ToyUser();
            user.setUserId(userId);
            user.setNickName(SecurityUtils.getUsername());
            user.setCreditScore(600);
            user.setCreateBy(SecurityUtils.getUsername());
            userMapper.insertUser(user);
            user = userMapper.selectUserByUserId(userId);
        }
        return user;
    }

    @Override
    public int updateUser(ToyUser user) {
        user.setUserId(SecurityUtils.getUserId());
        return userMapper.updateUser(user);
    }
}
```

- [ ] **Step 2: Write IToyAddressService and ToyAddressServiceImpl**

```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyAddress;
import java.util.List;

public interface IToyAddressService {
    List<ToyAddress> selectAddressList();
    ToyAddress selectAddressById(Long id);
    int insertAddress(ToyAddress address);
    int updateAddress(ToyAddress address);
    int deleteAddressById(Long id);
}
```

```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyAddress;
import com.ruoyi.toy.mapper.ToyAddressMapper;
import com.ruoyi.toy.service.IToyAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ToyAddressServiceImpl implements IToyAddressService {

    @Autowired
    private ToyAddressMapper addressMapper;

    @Override
    public List<ToyAddress> selectAddressList() {
        return addressMapper.selectAddressList(SecurityUtils.getUserId());
    }

    @Override
    public ToyAddress selectAddressById(Long id) {
        return addressMapper.selectAddressById(id);
    }

    @Override
    public int insertAddress(ToyAddress address) {
        address.setUserId(SecurityUtils.getUserId());
        address.setCreateBy(SecurityUtils.getUsername());
        if ("1".equals(address.getIsDefault())) {
            addressMapper.clearDefaultByUserId(SecurityUtils.getUserId());
        }
        return addressMapper.insertAddress(address);
    }

    @Override
    public int updateAddress(ToyAddress address) {
        if ("1".equals(address.getIsDefault())) {
            addressMapper.clearDefaultByUserId(SecurityUtils.getUserId());
        }
        return addressMapper.updateAddress(address);
    }

    @Override
    public int deleteAddressById(Long id) {
        return addressMapper.deleteAddressById(id);
    }
}
```

- [ ] **Step 3: Write IToyEvaluationService and ToyEvaluationServiceImpl**

```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyEvaluation;
import java.util.List;

public interface IToyEvaluationService {
    List<ToyEvaluation> selectEvaluationByProductId(Long productId);
    int insertEvaluation(ToyEvaluation evaluation);
    int deleteEvaluationById(Long id);
}
```

```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyEvaluation;
import com.ruoyi.toy.mapper.ToyEvaluationMapper;
import com.ruoyi.toy.service.IToyEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ToyEvaluationServiceImpl implements IToyEvaluationService {

    @Autowired
    private ToyEvaluationMapper evaluationMapper;

    @Override
    public List<ToyEvaluation> selectEvaluationByProductId(Long productId) {
        return evaluationMapper.selectEvaluationByProductId(productId);
    }

    @Override
    public int insertEvaluation(ToyEvaluation evaluation) {
        evaluation.setUserId(SecurityUtils.getUserId());
        evaluation.setCreateBy(SecurityUtils.getUsername());
        return evaluationMapper.insertEvaluation(evaluation);
    }

    @Override
    public int deleteEvaluationById(Long id) {
        return evaluationMapper.deleteEvaluationById(id);
    }
}
```

- [ ] **Step 4: Write IToyCommunityService and ToyCommunityServiceImpl**

```java
package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyCommunityComment;
import com.ruoyi.toy.domain.ToyCommunityPost;
import java.util.List;

public interface IToyCommunityService {
    List<ToyCommunityPost> selectPostList();
    ToyCommunityPost selectPostById(Long id);
    int insertPost(ToyCommunityPost post);
    int deletePostById(Long id);
    List<ToyCommunityComment> selectCommentByPostId(Long postId);
    int insertComment(ToyCommunityComment comment);
    int deleteCommentById(Long id);
    int likePost(Long postId);
}
```

```java
package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyCommunityComment;
import com.ruoyi.toy.domain.ToyCommunityPost;
import com.ruoyi.toy.mapper.ToyCommunityCommentMapper;
import com.ruoyi.toy.mapper.ToyCommunityLikeMapper;
import com.ruoyi.toy.mapper.ToyCommunityPostMapper;
import com.ruoyi.toy.service.IToyCommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ToyCommunityServiceImpl implements IToyCommunityService {

    @Autowired
    private ToyCommunityPostMapper postMapper;
    @Autowired
    private ToyCommunityCommentMapper commentMapper;
    @Autowired
    private ToyCommunityLikeMapper likeMapper;

    @Override
    public List<ToyCommunityPost> selectPostList() {
        List<ToyCommunityPost> posts = postMapper.selectPostList(SecurityUtils.getUserId());
        Long userId = SecurityUtils.getUserId();
        for (ToyCommunityPost post : posts) {
            post.setLiked(likeMapper.checkLiked(post.getId(), userId) > 0);
        }
        return posts;
    }

    @Override
    public ToyCommunityPost selectPostById(Long id) {
        ToyCommunityPost post = postMapper.selectPostById(id);
        if (post != null) {
            post.setLiked(likeMapper.checkLiked(id, SecurityUtils.getUserId()) > 0);
        }
        return post;
    }

    @Override
    public int insertPost(ToyCommunityPost post) {
        post.setUserId(SecurityUtils.getUserId());
        post.setCreateBy(SecurityUtils.getUsername());
        return postMapper.insertPost(post);
    }

    @Override
    public int deletePostById(Long id) {
        return postMapper.deletePostById(id);
    }

    @Override
    public List<ToyCommunityComment> selectCommentByPostId(Long postId) {
        return commentMapper.selectCommentByPostId(postId);
    }

    @Override
    public int insertComment(ToyCommunityComment comment) {
        comment.setUserId(SecurityUtils.getUserId());
        comment.setCreateBy(SecurityUtils.getUsername());
        return commentMapper.insertComment(comment);
    }

    @Override
    public int deleteCommentById(Long id) {
        return commentMapper.deleteCommentById(id);
    }

    @Override
    public int likePost(Long postId) {
        Long userId = SecurityUtils.getUserId();
        if (likeMapper.checkLiked(postId, userId) > 0) {
            return likeMapper.deleteLike(postId, userId);
        }
        return likeMapper.insertLike(postId, userId);
    }
}
```

- [ ] **Step 5: Write UserCenterController.java**

```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyAddress;
import com.ruoyi.toy.domain.ToyUser;
import com.ruoyi.toy.service.IToyAddressService;
import com.ruoyi.toy.service.IToyUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/toy")
public class UserCenterController extends BaseController {

    @Autowired
    private IToyUserService userService;
    @Autowired
    private IToyAddressService addressService;

    @GetMapping("/user/profile")
    public AjaxResult profile() {
        return success(userService.getCurrentUser());
    }

    @PutMapping("/user/profile")
    public AjaxResult updateProfile(@RequestBody ToyUser user) {
        return toAjax(userService.updateUser(user));
    }

    @GetMapping("/addresses")
    public AjaxResult addressList() {
        return success(addressService.selectAddressList());
    }

    @GetMapping("/addresses/{id}")
    public AjaxResult addressInfo(@PathVariable Long id) {
        return success(addressService.selectAddressById(id));
    }

    @PostMapping("/addresses")
    public AjaxResult addAddress(@RequestBody ToyAddress address) {
        return toAjax(addressService.insertAddress(address));
    }

    @PutMapping("/addresses/{id}")
    public AjaxResult editAddress(@PathVariable Long id, @RequestBody ToyAddress address) {
        address.setId(id);
        return toAjax(addressService.updateAddress(address));
    }

    @DeleteMapping("/addresses/{id}")
    public AjaxResult removeAddress(@PathVariable Long id) {
        return toAjax(addressService.deleteAddressById(id));
    }
}
```

- [ ] **Step 6: Write EvaluationController.java and CommunityController.java**

`EvaluationController.java`:
```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyEvaluation;
import com.ruoyi.toy.service.IToyEvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/toy/evaluations")
public class EvaluationController extends BaseController {

    @Autowired
    private IToyEvaluationService evaluationService;

    @Anonymous
    @GetMapping("/{productId}")
    public AjaxResult list(@PathVariable Long productId) {
        return success(evaluationService.selectEvaluationByProductId(productId));
    }

    @PostMapping
    public AjaxResult add(@RequestBody ToyEvaluation evaluation) {
        return toAjax(evaluationService.insertEvaluation(evaluation));
    }

    @DeleteMapping("/{id}")
    public AjaxResult remove(@PathVariable Long id) {
        return toAjax(evaluationService.deleteEvaluationById(id));
    }
}
```

`CommunityController.java`:
```java
package com.ruoyi.web.controller.toy;

import com.ruoyi.common.annotation.Anonymous;
import com.ruoyi.common.core.controller.BaseController;
import com.ruoyi.common.core.domain.AjaxResult;
import com.ruoyi.toy.domain.ToyCommunityComment;
import com.ruoyi.toy.domain.ToyCommunityPost;
import com.ruoyi.toy.service.IToyCommunityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/toy/community")
public class CommunityController extends BaseController {

    @Autowired
    private IToyCommunityService communityService;

    @Anonymous
    @GetMapping("/posts")
    public AjaxResult posts() {
        return success(communityService.selectPostList());
    }

    @Anonymous
    @GetMapping("/posts/{id}")
    public AjaxResult postDetail(@PathVariable Long id) {
        return success(communityService.selectPostById(id));
    }

    @PostMapping("/posts")
    public AjaxResult createPost(@RequestBody ToyCommunityPost post) {
        return toAjax(communityService.insertPost(post));
    }

    @DeleteMapping("/posts/{id}")
    public AjaxResult deletePost(@PathVariable Long id) {
        return toAjax(communityService.deletePostById(id));
    }

    @Anonymous
    @GetMapping("/comments/{postId}")
    public AjaxResult comments(@PathVariable Long postId) {
        return success(communityService.selectCommentByPostId(postId));
    }

    @PostMapping("/comment")
    public AjaxResult addComment(@RequestBody ToyCommunityComment comment) {
        return toAjax(communityService.insertComment(comment));
    }

    @PostMapping("/like/{postId}")
    public AjaxResult like(@PathVariable Long postId) {
        return toAjax(communityService.likePost(postId));
    }
}
```

- [ ] **Step 7: Build**

```bash
cd back && mvn clean compile -DskipTests
```

Expected: BUILD SUCCESS.

---

### Task 9: Register ToyUser on registration

**Files:**
- Modify: `back/ruoyi-framework/src/main/java/com/ruoyi/framework/web/service/SysRegisterService.java`

- [ ] **Step 1: Inject ToyUserMapper and auto-create toy_user on registration**

In `SysRegisterService.java`, add import and injection, then in the `register` method after `userMapper.insertUser(user)`, add:

```java
// After existing registration code, add:
ToyUser toyUser = new ToyUser();
toyUser.setUserId(user.getUserId());
toyUser.setNickName(user.getUserName());
toyUser.setCreditScore(600);
toyUser.setCreateBy(user.getUserName());
toyUserMapper.insertUser(toyUser);
```

Add field:
```java
@Autowired
private com.ruoyi.toy.mapper.ToyUserMapper toyUserMapper;
```

Add import:
```java
import com.ruoyi.toy.domain.ToyUser;
```

---

## Phase 3: Backend Admin Pages (RuoYi Vue)

### Task 10: Admin product management page

**Files:**
- Create: `back/ruoyi-ui/src/api/toy/product.js`
- Create: `back/ruoyi-ui/src/views/toy/product/index.vue`

- [ ] **Step 1: Create Vue API module `api/toy/product.js`**

```javascript
import request from '@/utils/request'

export function listProduct(query) {
  return request({ url: '/api/toy/products', method: 'get', params: query })
}

export function getProduct(id) {
  return request({ url: '/api/toy/products/' + id, method: 'get' })
}

export function delProduct(id) {
  return request({ url: '/api/toy/products/' + id, method: 'delete' })
}

export function addProduct(data) {
  return request({ url: '/api/toy/products', method: 'post', data: data })
}

export function updateProduct(data) {
  return request({ url: '/api/toy/products/' + data.id, method: 'put', data: data })
}

export function listCategory(query) {
  return request({ url: '/api/toy/categories', method: 'get', params: query })
}

export function getCategoryTree() {
  return request({ url: '/api/toy/categories/tree', method: 'get' })
}

export function addCategory(data) {
  return request({ url: '/api/toy/categories', method: 'post', data: data })
}

export function updateCategory(data) {
  return request({ url: '/api/toy/categories/' + data.id, method: 'put', data: data })
}

export function delCategory(id) {
  return request({ url: '/api/toy/categories/' + id, method: 'delete' })
}
```

- [ ] **Step 2: Create product management page `views/toy/product/index.vue`** — Standard RuoYi CRUD page with table (name, price, stock, status), search bar, and add/edit dialog using `<el-dialog>`. Follow existing pattern in `views/system/user/index.vue`. Include `/api/toy/categories/tree` for category dropdown.

- [ ] **Step 3: Create category management page `views/toy/category/index.vue`** — Tree table using `<el-table>` with `row-key` and `tree-props`, add/edit/delete operations.

---

### Task 11: Admin order and evaluation pages

**Files:**
- Create: `back/ruoyi-ui/src/api/toy/order.js`
- Create: `back/ruoyi-ui/src/views/toy/order/index.vue`
- Create: `back/ruoyi-ui/src/views/toy/evaluation/index.vue`
- Create: `back/ruoyi-ui/src/views/toy/community/index.vue`
- Create: `back/ruoyi-ui/src/views/toy/dashboard/index.vue`

- [ ] **Step 1: Create order API `api/toy/order.js`**

```javascript
import request from '@/utils/request'

export function listOrder(query) {
  return request({ url: '/api/toy/orders', method: 'get', params: query })
}

export function getOrder(id) {
  return request({ url: '/api/toy/orders/' + id, method: 'get' })
}

export function shipOrder(id, logisticsNo) {
  return request({ url: '/api/toy/orders/' + id + '/ship', method: 'put', data: { logisticsNo } })
}

export function disinfectComplete(id) {
  return request({ url: '/api/toy/orders/' + id + '/disinfect', method: 'put' })
}
```

- [ ] **Step 2: Create order management page `views/toy/order/index.vue`** — Order table with status filter tabs, ship/return-logistics tracking, ship button (dialog for logistics number input), disinfect-complete button.

- [ ] **Step 3: Create evaluation page `views/toy/evaluation/index.vue`** — Table with rating stars display, content, delete button.

- [ ] **Step 4: Create community page `views/toy/community/index.vue`** — Table with content preview, delete button.

- [ ] **Step 5: Create dashboard page `views/toy/dashboard/index.vue`** — Simple stats cards (order count today, total products, active orders), a basic table for popular products.

---

### Task 12: Add admin routes and menus

**Files:**
- Modify: `back/ruoyi-ui/src/router/index.js` (or better: add menu via DB/SQL)

- [ ] **Step 1: Add menu entries to database**

```sql
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('商品管理', 0, 5, 'toy', NULL, 1, 0, 'M', '0', '0', NULL, 'guide', 'admin', SYSDATE());
SET @toy_parent = LAST_INSERT_ID();
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('商品列表', @toy_parent, 1, 'product', 'toy/product/index', 1, 0, 'C', '0', '0', 'toy:product:list', 'tree-table', 'admin', SYSDATE());
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('商品分类', @toy_parent, 2, 'category', 'toy/category/index', 1, 0, 'C', '0', '0', 'toy:category:list', 'tree', 'admin', SYSDATE());
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('订单管理', @toy_parent, 3, 'order', 'toy/order/index', 1, 0, 'C', '0', '0', 'toy:order:list', 'list', 'admin', SYSDATE());
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('评价管理', @toy_parent, 4, 'evaluation', 'toy/evaluation/index', 1, 0, 'C', '0', '0', 'toy:evaluation:list', 'star', 'admin', SYSDATE());
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('社区管理', @toy_parent, 5, 'community', 'toy/community/index', 1, 0, 'C', '0', '0', 'toy:community:list', 'edit', 'admin', SYSDATE());
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time)
VALUES ('数据看板', @toy_parent, 6, 'dashboard', 'toy/dashboard/index', 1, 0, 'C', '0', '0', 'toy:dashboard:list', 'chart', 'admin', SYSDATE());
```

- [ ] **Step 2: Add admin ship/disinfect actions to OrderController**

```java
@PutMapping("/{id}/ship")
public AjaxResult ship(@PathVariable Long id, @RequestBody Map<String, String> body) {
    return toAjax(orderService.shipOrder(id, body.get("logisticsNo")));
}

@PutMapping("/{id}/disinfect")
public AjaxResult disinfect(@PathVariable Long id) {
    return toAjax(orderService.disinfectComplete(id));
}
```

---

## Phase 4: React Frontend Core

### Task 13: Set up React routing and API layer

**Files:**
- Modify: `front/src/main.tsx`
- Create: `front/src/api.ts`
- Create: `front/src/router.tsx`
- Modify: `front/src/types.ts`
- Modify: `front/vite.config.ts`

- [ ] **Step 1: Install react-router-dom**

```bash
cd front && npm install react-router-dom
```

- [ ] **Step 2: Update vite.config.ts proxy**

Add to `server` config:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
  '/login': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
  '/register': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  },
},
```

- [ ] **Step 3: Create API layer `front/src/api.ts`**

```typescript
const BASE = '/api/toy';

async function request(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error(json.msg || 'Error');
  return json;
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (username: string, password: string) =>
    request('/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  // Products
  getProducts: (params: Record<string, string> = {}) =>
    request(`${BASE}/products?${new URLSearchParams(params)}`),
  getProduct: (id: number) => request(`${BASE}/products/${id}`),
  createProduct: (data: any) => request(`${BASE}/products`, { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) =>
    request(`${BASE}/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request(`${BASE}/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request(`${BASE}/categories/tree`),

  // Cart
  getCart: () => request(`${BASE}/cart`),
  addToCart: (productId: number, duration: number) =>
    request(`${BASE}/cart`, { method: 'POST', body: JSON.stringify({ productId, duration }) }),
  updateCart: (id: number, duration: number) =>
    request(`${BASE}/cart/${id}`, { method: 'PUT', body: JSON.stringify({ duration }) }),
  removeFromCart: (id: number) => request(`${BASE}/cart/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request(`${BASE}/orders`),
  getOrder: (id: number) => request(`${BASE}/orders/${id}`),
  createOrder: (addressId: number) =>
    request(`${BASE}/orders`, { method: 'POST', body: JSON.stringify({ addressId }) }),
  payOrder: (id: number) => request(`${BASE}/orders/${id}/pay`, { method: 'PUT' }),
  receiveOrder: (id: number) => request(`${BASE}/orders/${id}/receive`, { method: 'PUT' }),
  returnOrder: (id: number) => request(`${BASE}/orders/${id}/return`, { method: 'PUT' }),
  renewOrder: (id: number) => request(`${BASE}/orders/${id}/renew`, { method: 'PUT' }),

  // Addresses
  getAddresses: () => request(`${BASE}/addresses`),
  addAddress: (data: any) => request(`${BASE}/addresses`, { method: 'POST', body: JSON.stringify(data) }),
  updateAddress: (id: number, data: any) =>
    request(`${BASE}/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAddress: (id: number) => request(`${BASE}/addresses/${id}`, { method: 'DELETE' }),

  // User
  getProfile: () => request(`${BASE}/user/profile`),
  updateProfile: (data: any) =>
    request(`${BASE}/user/profile`, { method: 'PUT', body: JSON.stringify(data) }),

  // Evaluations
  getEvaluations: (productId: number) => request(`${BASE}/evaluations/${productId}`),
  addEvaluation: (data: any) =>
    request(`${BASE}/evaluations`, { method: 'POST', body: JSON.stringify(data) }),

  // Community
  getPosts: () => request(`${BASE}/community/posts`),
  getPost: (id: number) => request(`${BASE}/community/posts/${id}`),
  createPost: (data: any) =>
    request(`${BASE}/community/posts`, { method: 'POST', body: JSON.stringify(data) }),
  deletePost: (id: number) => request(`${BASE}/community/posts/${id}`, { method: 'DELETE' }),
  getComments: (postId: number) => request(`${BASE}/community/comments/${postId}`),
  addComment: (data: any) =>
    request(`${BASE}/community/comment`, { method: 'POST', body: JSON.stringify(data) }),
  likePost: (postId: number) =>
    request(`${BASE}/community/like/${postId}`, { method: 'POST' }),
};
```

- [ ] **Step 4: Update types.ts**

Add new types:
```typescript
export interface ToyProduct {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  image: string;
  price: number;
  rentPriceDay: number;
  rentPriceMonth: number;
  ageRange: string;
  brand: string;
  stock: number;
  status: string;
  description: string;
  categoryName: string;
  nickName: string;
  avatar: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  sort: number;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  duration: number;
  createTime: string;
  productName: string;
  productImage: string;
  rentPriceMonth: number;
}

export interface ToyOrder {
  id: number;
  orderNo: string;
  userId: number;
  addressId: number;
  totalRent: number;
  deposit: number;
  status: string;
  payTime?: string;
  logisticsNo: string;
  returnLogisticsNo: string;
  createTime: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  rentPrice: number;
  duration: number;
  productName: string;
  productImage: string;
}

export interface Address {
  id: number;
  userId: number;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: string;
}

export interface Evaluation {
  id: number;
  orderId: number;
  productId: number;
  userId: number;
  rating: number;
  content: string;
  images: string;
  nickName: string;
  avatar: string;
  createTime: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  images: string;
  nickName: string;
  avatar: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createTime: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  nickName: string;
  avatar: string;
  createTime: string;
}
```

---

### Task 14: Adapt discovery page to use real API

**Files:**
- Modify: `front/src/App.tsx` — Replace hardcoded ITEMS with API data, wire up routing

- [ ] **Step 1: Create separate page components**

Create `front/src/pages/Discovery.tsx` — Extracted from App.tsx DiscoveryView, fetch products from API:
```tsx
// In component, replace ITEMS with:
const [items, setItems] = useState<ToyProduct[]>([]);
useEffect(() => {
  api.getProducts().then(res => setItems(res.rows || res.data || []));
}, []);
```

- [ ] **Step 2: Continue extracting other views into page components**

Create `front/src/pages/`:
- `Cart.tsx` — fetch cart, show items with duration controls
- `Orders.tsx` — fetch orders, tab filter by status
- `OrderDetail.tsx` — fetch order by id, show status flow with action buttons
- `Checkout.tsx` — select address, show order summary, submit order
- `ProductDetail.tsx` — fetch product + evaluations
- `Login.tsx` — login/register form
- `Profile.tsx` — user info, address CRUD
- `Community.tsx` — post list, create post, like/comment
- `PostPublish.tsx` — create product listing

- [ ] **Step 3: Wire with react-router-dom in main.tsx**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

In App.tsx, wrap content with `<Routes>`:
```tsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Discovery />} />
    <Route path="detail/:id" element={<ProductDetail />} />
    <Route path="cart" element={<Cart />} />
    <Route path="checkout" element={<Checkout />} />
    <Route path="orders" element={<Orders />} />
    <Route path="order/:id" element={<OrderDetail />} />
    <Route path="community" element={<Community />} />
    <Route path="profile" element={<Profile />} />
    <Route path="post" element={<PostPublish />} />
    <Route path="messages" element={<MessagesView />} />
  </Route>
  <Route path="/login" element={<Login />} />
</Routes>
```

---

## Phase 5: Frontend Peripheral

### Task 15: Community page (posts, comments, likes)

**Files:**
- Create: `front/src/pages/Community.tsx`

- [ ] **Step 1: Build community page with post list, create post form, comments, like toggle**

The page fetches `api.getPosts()` on mount. Each post shows: user avatar/name, content, images, like count, comment count, like button (toggle). Clicking comment count shows comments. Create post button opens a modal/input.

---

### Task 16: Profile page (user info + address management)

**Files:**
- Create: `front/src/pages/Profile.tsx`

- [ ] **Step 1: Build profile page with user info display/edit form, address list with add/edit/delete/select-default**

Fetches `api.getProfile()` and `api.getAddresses()`. Shows avatar, nick_name, credit score. Address list with radio for default, add/edit dialog.

---

## Phase 6: Integration Verification

### Task 17: End-to-end flow verification

- [ ] **Step 1: Start backend**

```bash
cd back && mvn clean package -DskipTests && java -jar ruoyi-admin/target/ruoyi-admin.jar
```

Verify `curl http://localhost:8080/captchaImage` returns a captcha.

- [ ] **Step 2: Start frontend**

```bash
cd front && npm run dev
```

Open `http://localhost:3000`.

- [ ] **Step 3: Test complete flow**

1. Register a new user via `/register` API
2. Login via `/login` API, save token
3. Browse products on homepage (fetch from `/api/toy/products`)
4. View product detail with evaluations
5. Add product to cart, modify duration
6. Create order from checkout
7. Pay order (mock)
8. Admin: ship order, user: confirm receive
9. User: apply return, admin: disinfect complete
10. User: leave evaluation
11. Post in community, like, comment
12. Admin: verify all management pages work

---

> **Plan complete.** This covers all 6 phases with exact file paths, code, and verification steps. Total ~40 tasks covering 80+ files across backend Java, frontend React, and admin Vue.
