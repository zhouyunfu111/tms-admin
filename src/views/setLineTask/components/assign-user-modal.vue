<template>
    <!-- 添加或修改岗位对话框 -->
    <el-dialog :title="title" :visible.sync="visible" width="50vw" append-to-body>
      <!-- <el-form ref="form" :model="form" inline label-width="100px">
        <el-form-item label="配送员姓名" prop="postName">
          <el-input v-model="form.postName" style="width: 300px;" placeholder="请输入岗位名称" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form> -->
      <div class="table">
        <el-table
          ref="singleTable"
          :data="userData"
          highlight-current-row
          @current-change="handleCurrentChange"
          style="width: 100%">
          <el-table-column
            property="id"
            label="编号"
            width="50">
          </el-table-column>
          <el-table-column
            property="realName"
            label="姓名"
            width="120">
          </el-table-column>
          <el-table-column
            property="sex"
            label="性别">
            <template slot-scope="scope">
              {{ ['未知','男','女'][scope.row.sex] }}
            </template>
          </el-table-column>
          <el-table-column
            property="age"
            label="年龄">
          </el-table-column>
          <!-- <el-table-column
            property="vehicleType"
            label="车型">
          </el-table-column> -->
          <!-- <el-table-column
            property="address"
            label="车牌">
          </el-table-column> -->
          <!-- <el-table-column
            property="drivingAge"
            label="驾龄">
          </el-table-column>
          <el-table-column
            property="drivingModel"
            label="驾驶证">
          </el-table-column> -->
          <!-- <el-table-column
            property="address"
            label="外廓尺寸">
          </el-table-column> -->
          <el-table-column
            property="status"
            label="确认状态">
            <template slot-scope="scope">
              <dict-tag :options="dict.type.driver_status" :value="scope.row.status"/>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
</template>

<script>
  export default {
    name:"assignUserModal",
    dicts:['driver_status'],
    props: {
      title: {
        type: String,
        default: ''
      },
      visible: {
        type: Boolean,
        default: false
      },
      userData: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        currentRow: null
      }
    },
    methods: {
      handleCurrentChange(val) {
        this.currentRow = val
      },
      submitForm() {
        if (this.currentRow) {
          this.$emit('submit', this.currentRow)
        } else {
          this.$message({
            message: '请选择用户',
            type: 'warning'
          })
        }
      },
      cancel() {
        this.$emit('update:visible', false)
        this.$emit('cancel')
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
