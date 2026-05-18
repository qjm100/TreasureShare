<template>
  <div class="app-container">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="80px">
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入商品名称" clearable style="width: 200px" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="商品分类" prop="categoryId">
        <el-select v-model="queryParams.categoryId" placeholder="请选择分类" clearable style="width: 200px">
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="商品状态" clearable style="width: 200px">
          <el-option label="上架" value="0" />
          <el-option label="下架" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="el-icon-plus" size="mini" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete">删除</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column label="ID" align="center" prop="id" width="80" />
      <el-table-column label="商品图片" align="center" width="80">
        <template slot-scope="scope">
          <el-image v-if="scope.row.image" :src="scope.row.image" style="width: 50px; height: 50px" fit="cover" :preview-src-list="[scope.row.image]" />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="name" :show-overflow-tooltip="true" min-width="160" />
      <el-table-column label="分类" align="center" prop="categoryName" width="120" />
      <el-table-column label="价格" align="center" prop="price" width="100">
        <template slot-scope="scope">¥{{ scope.row.price }}</template>
      </el-table-column>
      <el-table-column label="日租金" align="center" prop="rentPriceDay" width="100">
        <template slot-scope="scope">¥{{ scope.row.rentPriceDay }}</template>
      </el-table-column>
      <el-table-column label="月租金" align="center" prop="rentPriceMonth" width="100">
        <template slot-scope="scope">¥{{ scope.row.rentPriceMonth }}</template>
      </el-table-column>
      <el-table-column label="库存" align="center" prop="stock" width="80" />
      <el-table-column label="状态" align="center" width="80">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status == '0' ? 'success' : 'danger'">{{ scope.row.status == '0' ? '上架' : '下架' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="发布者" align="center" prop="nickName" width="100" />
      <el-table-column label="创建时间" align="center" width="160">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="150" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="queryParams.pageNum" :limit.sync="queryParams.pageSize" @pagination="getList" />

    <!-- 添加/修改对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="700px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商品分类" prop="categoryId">
              <el-cascader
                v-model="form.categoryId"
                :options="categoryTreeOptions"
                :props="{ value: 'id', label: 'name', children: 'children', checkStrictly: true, emitPath: false }"
                placeholder="请选择分类"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="商品主图" prop="image">
              <el-input v-model="form.image" placeholder="请输入图片URL" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌" prop="brand">
              <el-input v-model="form.brand" placeholder="请输入品牌" maxlength="30" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" controls-position="right" style="width: 100%" placeholder="请输入价格" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日租金" prop="rentPriceDay">
              <el-input-number v-model="form.rentPriceDay" :min="0" :precision="2" controls-position="right" style="width: 100%" placeholder="请输入日租金" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="月租金" prop="rentPriceMonth">
              <el-input-number v-model="form.rentPriceMonth" :min="0" :precision="2" controls-position="right" style="width: 100%" placeholder="请输入月租金" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" controls-position="right" style="width: 100%" placeholder="请输入库存" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="适用年龄" prop="ageRange">
              <el-input v-model="form.ageRange" placeholder="如: 3-6岁" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio label="0">上架</el-radio>
                <el-radio label="1">下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="商品描述" prop="description">
              <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入商品描述" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listProduct, getProduct, delProduct, addProduct, updateProduct, getCategoryTree } from '@/api/toy/product'

export default {
  name: 'ToyProduct',
  data() {
    return {
      loading: true,
      ids: [],
      single: true,
      multiple: true,
      showSearch: true,
      total: 0,
      productList: [],
      title: '',
      open: false,
      categoryOptions: [],
      categoryTreeOptions: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        name: undefined,
        categoryId: undefined,
        status: undefined
      },
      form: {},
      rules: {
        name: [
          { required: true, message: '商品名称不能为空', trigger: 'blur' }
        ],
        categoryId: [
          { required: true, message: '商品分类不能为空', trigger: 'change' }
        ],
        price: [
          { required: true, message: '价格不能为空', trigger: 'blur' }
        ],
        rentPriceDay: [
          { required: true, message: '日租金不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.loadCategoryTree()
  },
  methods: {
    getList() {
      this.loading = true
      listProduct(this.queryParams).then(response => {
        this.productList = response.rows
        this.total = response.total
        this.loading = false
      })
    },
    loadCategoryTree() {
      getCategoryTree().then(response => {
        this.categoryTreeOptions = response.data || []
        // 将树结构扁平化用于搜索下拉
        this.categoryOptions = this.flattenTree(response.data || [])
      })
    },
    flattenTree(tree) {
      const result = []
      const walk = (nodes, prefix) => {
        nodes.forEach(node => {
          result.push({ value: node.id, label: (prefix ? prefix + ' / ' : '') + node.name })
          if (node.children && node.children.length) {
            walk(node.children, (prefix ? prefix + ' / ' : '') + node.name)
          }
        })
      }
      walk(tree, '')
      return result
    },
    cancel() {
      this.open = false
      this.reset()
    },
    reset() {
      this.form = {
        id: undefined,
        categoryId: undefined,
        name: undefined,
        image: undefined,
        price: undefined,
        rentPriceDay: undefined,
        rentPriceMonth: undefined,
        ageRange: undefined,
        brand: undefined,
        stock: 0,
        status: '0',
        description: undefined
      }
      this.resetForm('form')
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.resetForm('queryForm')
      this.handleQuery()
    },
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加商品'
    },
    handleUpdate(row) {
      this.reset()
      const id = row.id || this.ids[0]
      getProduct(id).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改商品'
      })
    },
    submitForm() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateProduct(this.form).then(() => {
              this.$modal.msgSuccess('修改成功')
              this.open = false
              this.getList()
            })
          } else {
            addProduct(this.form).then(() => {
              this.$modal.msgSuccess('新增成功')
              this.open = false
              this.getList()
            })
          }
        }
      })
    },
    handleDelete(row) {
      const ids = row.id ? [row.id] : this.ids
      const name = row.name || ''
      const msg = row.id ? '是否确认删除商品"' + name + '"？' : '是否确认删除所选商品？'
      this.$modal.confirm(msg).then(function() {
        return delProduct(ids.join(','))
      }).then(() => {
        this.getList()
        this.$modal.msgSuccess('删除成功')
      }).catch(() => {})
    }
  }
}
</script>
