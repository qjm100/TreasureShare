<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #409EFF;">
              <i class="el-icon-s-order" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ todayOrders }}</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #67C23A;">
              <i class="el-icon-goods" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalProducts }}</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #E6A23C;">
              <i class="el-icon-loading" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ activeOrders }}</div>
              <div class="stat-label">进行中订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background-color: #F56C6C;">
              <i class="el-icon-user" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ totalUsers }}</div>
              <div class="stat-label">平台用户</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>订单状态分布</span>
          </div>
          <div class="chart-container" style="height: 300px;">
            <v-chart :option="orderStatusOption" style="height: 100%;" autoresize />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <div slot="header" class="clearfix">
            <span>快捷入口</span>
          </div>
          <el-row :gutter="16" style="padding: 20px;">
            <el-col :span="8" style="margin-bottom: 16px;">
              <el-button type="primary" plain style="width: 100%; height: 80px; font-size: 14px;" @click="$router.push('/toy/product')">
                <i class="el-icon-goods" style="display: block; font-size: 24px; margin-bottom: 6px;" />
                商品管理
              </el-button>
            </el-col>
            <el-col :span="8" style="margin-bottom: 16px;">
              <el-button type="success" plain style="width: 100%; height: 80px; font-size: 14px;" @click="$router.push('/toy/category')">
                <i class="el-icon-menu" style="display: block; font-size: 24px; margin-bottom: 6px;" />
                分类管理
              </el-button>
            </el-col>
            <el-col :span="8" style="margin-bottom: 16px;">
              <el-button type="warning" plain style="width: 100%; height: 80px; font-size: 14px;" @click="$router.push('/toy/order')">
                <i class="el-icon-s-order" style="display: block; font-size: 24px; margin-bottom: 6px;" />
                订单管理
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="danger" plain style="width: 100%; height: 80px; font-size: 14px;" @click="$router.push('/toy/evaluation')">
                <i class="el-icon-star-on" style="display: block; font-size: 24px; margin-bottom: 6px;" />
                评价管理
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button type="info" plain style="width: 100%; height: 80px; font-size: 14px;" @click="$router.push('/toy/community')">
                <i class="el-icon-edit" style="display: block; font-size: 24px; margin-bottom: 6px;" />
                社区管理
              </el-button>
            </el-col>
            <el-col :span="8">
              <el-button plain style="width: 100%; height: 80px; font-size: 14px;" @click="refreshData">
                <i class="el-icon-refresh" style="display: block; font-size: 24px; margin-bottom: 6px;" />
                刷新数据
              </el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getStats } from '@/api/toy/dashboard'

export default {
  name: 'ToyDashboard',
  data() {
    return {
      todayOrders: 0,
      totalProducts: 0,
      activeOrders: 0,
      totalUsers: 0,
      statusCounts: {
        0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
      }
    }
  },
  computed: {
    orderStatusOption() {
      return {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '订单状态',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: [
              { value: this.statusCounts[0], name: '待付款' },
              { value: this.statusCounts[1], name: '待发货' },
              { value: this.statusCounts[2], name: '待收货' },
              { value: this.statusCounts[3], name: '租赁中' },
              { value: this.statusCounts[4], name: '待归还' },
              { value: this.statusCounts[5], name: '待消毒' },
              { value: this.statusCounts[6], name: '已完成' },
              { value: this.statusCounts[7], name: '已取消' }
            ].filter(item => item.value > 0)
          }
        ]
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    loadData() {
      getStats().then(response => {
        const data = response.data || response
        this.todayOrders = data.todayOrders || 0
        this.totalProducts = data.totalProducts || 0
        this.totalUsers = data.totalUsers || 0
        this.activeOrders = data.activeOrders || 0
        if (data.statusCounts) {
          for (let i = 0; i <= 7; i++) {
            this.statusCounts[i] = data.statusCounts[String(i)] || 0
          }
        }
      }).catch(() => {})
    },
    refreshData() {
      this.todayOrders = 0
      this.totalProducts = 0
      this.activeOrders = 0
      this.totalUsers = 0
      this.statusCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
      this.loadData()
    }
  }
}
</script>

<style scoped>
.stat-card {
  cursor: pointer;
}
.stat-content {
  display: flex;
  align-items: center;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.stat-icon i {
  font-size: 28px;
  color: #fff;
}
.stat-info {
  flex: 1;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1.2;
}
.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}
</style>
