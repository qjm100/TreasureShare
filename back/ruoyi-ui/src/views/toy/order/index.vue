<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="订单编号" prop="orderNo">
        <el-input v-model="queryParams.orderNo" placeholder="请输入订单编号" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
          <el-option label="待付款" value="0" />
          <el-option label="待发货" value="1" />
          <el-option label="待收货" value="2" />
          <el-option label="租赁中" value="3" />
          <el-option label="待归还" value="4" />
          <el-option label="待消毒" value="5" />
          <el-option label="已完成" value="6" />
          <el-option label="已取消" value="7" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="orderList">
      <el-table-column label="订单编号" align="center" prop="orderNo" width="180" :show-overflow-tooltip="true" />
      <el-table-column label="金额" align="center" prop="totalRent" width="100">
        <template slot-scope="scope">¥{{ scope.row.totalRent }}</template>
      </el-table-column>
      <el-table-column label="押金" align="center" prop="deposit" width="100">
        <template slot-scope="scope">¥{{ scope.row.deposit }}</template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag :type="statusType(scope.row.status)">{{ statusLabel(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收件人" align="center" prop="receiverName" width="100" />
      <el-table-column label="收件电话" align="center" prop="receiverPhone" width="120" />
      <el-table-column label="物流单号" align="center" prop="logisticsNo" width="160" :show-overflow-tooltip="true" />
      <el-table-column label="归还物流" align="center" prop="returnLogisticsNo" width="160" :show-overflow-tooltip="true" />
      <el-table-column label="创建时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status == 1"
            size="mini"
            type="text"
            icon="el-icon-truck"
            @click="handleShip(scope.row)"
          >发货</el-button>
          <el-button
            v-if="scope.row.status == 4"
            size="mini"
            type="text"
            icon="el-icon-circle-check"
            @click="handleConfirmReturn(scope.row)"
          >确认归还</el-button>
          <el-button
            v-if="scope.row.status == 5"
            size="mini"
            type="text"
            icon="el-icon-check"
            @click="handleDisinfect(scope.row)"
          >消毒完成</el-button>
          <el-button size="mini" type="text" icon="el-icon-view" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 发货对话框 -->
    <el-dialog title="订单发货" :visible.sync="shipOpen" width="500px" append-to-body>
      <el-form ref="shipForm" :model="shipForm" :rules="shipRules" label-width="100px">
        <el-form-item label="订单编号">
          <el-input :value="shipForm.orderNo" disabled />
        </el-form-item>
        <el-form-item label="物流单号" prop="logisticsNo">
          <el-input v-model="shipForm.logisticsNo" placeholder="请输入物流单号" maxlength="50" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitShip">确 定</el-button>
        <el-button @click="shipOpen = false">取 消</el-button>
      </div>
    </el-dialog>

    <!-- 订单详情对话框 -->
    <el-dialog title="订单详情" :visible.sync="detailOpen" width="700px" append-to-body>
      <el-descriptions v-if="orderDetail" :column="2" border size="small">
        <el-descriptions-item label="订单编号">{{ orderDetail.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="订单状态">
          <el-tag :type="statusType(orderDetail.status)">{{ statusLabel(orderDetail.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="收发件人">{{ orderDetail.receiverName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ orderDetail.receiverPhone }}</el-descriptions-item>
        <el-descriptions-item label="收货地址" :span="2">{{ orderDetail.receiverAddress }}</el-descriptions-item>
        <el-descriptions-item label="租金合计">¥{{ orderDetail.totalRent }}</el-descriptions-item>
        <el-descriptions-item label="押金">¥{{ orderDetail.deposit }}</el-descriptions-item>
        <el-descriptions-item label="物流单号">{{ orderDetail.logisticsNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="归还物流">{{ orderDetail.returnLogisticsNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="付款时间">{{ parseTime(orderDetail.payTime) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(orderDetail.createTime) }}</el-descriptions-item>
      </el-descriptions>
      <div v-if="orderDetail && orderDetail.items && orderDetail.items.length" class="order-items" style="margin-top: 16px;">
        <h4>订单商品</h4>
        <el-table :data="orderDetail.items" size="small">
          <el-table-column label="商品名称" prop="productName" />
          <el-table-column label="数量" prop="quantity" width="80" />
          <el-table-column label="单价" prop="price" width="100" />
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listOrder, getOrder, shipOrder, confirmReturn, disinfectComplete } from '@/api/toy/order'

export default {
  name: 'ToyOrder',
  data() {
    const statusMap = {
      0: { label: '待付款', type: 'warning' },
      1: { label: '待发货', type: 'primary' },
      2: { label: '待收货', type: 'primary' },
      3: { label: '租赁中', type: 'success' },
      4: { label: '待归还', type: 'success' },
      5: { label: '待消毒', type: 'success' },
      6: { label: '已完成', type: 'info' },
      7: { label: '已取消', type: 'danger' }
    }
    return {
      loading: true,
      showSearch: true,
      total: 0,
      orderList: [],
      shipOpen: false,
      detailOpen: false,
      orderDetail: null,
      statusMap,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        orderNo: undefined,
        status: undefined
      },
      shipForm: {},
      shipRules: {
        logisticsNo: [
          { required: true, message: '物流单号不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      listOrder(this.queryParams).then(response => {
        this.orderList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    statusType(status) {
      const item = this.statusMap[status]
      return item ? item.type : 'info'
    },
    statusLabel(status) {
      const item = this.statusMap[status]
      return item ? item.label : '未知'
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleShip(row) {
      this.shipForm = {
        id: row.id,
        orderNo: row.orderNo,
        logisticsNo: ''
      }
      this.shipOpen = true
    },
    submitShip() {
      this.$refs['shipForm'].validate(valid => {
        if (valid) {
          shipOrder(this.shipForm.id, this.shipForm.logisticsNo).then(() => {
            this.$modal.msgSuccess('发货成功')
            this.shipOpen = false
            this.getList()
          })
        }
      })
    },
    handleConfirmReturn(row) {
      this.$modal.confirm('确认已收到归还物品？确认后将进入待消毒状态。').then(function() {
        return confirmReturn(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('确认归还成功')
      }).catch(() => {})
    },
    handleDisinfect(row) {
      this.$modal.confirm('确认该订单已消毒完成？').then(function() {
        return disinfectComplete(row.id)
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('操作成功')
      }).catch(() => {})
    },
    handleDetail(row) {
      getOrder(row.id).then(response => {
        this.orderDetail = response.data
        this.detailOpen = true
      })
    }
  }
}
</script>
