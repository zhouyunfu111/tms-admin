<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="线路名称" prop="lineName">
        <el-input
          v-model="queryParams.lineName"
          placeholder="请输入线路名称"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="dateRange">
        <el-date-picker
          v-model="queryParams.dateRange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          :picker-options="pickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="配送员" prop="deliverName">
        <el-input
          v-model="queryParams.deliverName"
          placeholder="请输入配送员姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="岗位状态" clearable>
          <el-option
            v-for="dict in dict.type.line_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['system:post:add']"
        >新增排线任务</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="lineList" @selection-change="handleSelectionChange"  style="width: 100%">
      <el-table-column type="selection" width="55" align="center"  />
      <el-table-column label="线路ID" min-width="55" align="center" prop="id" />
      <el-table-column label="线路名称" min-width="100" align="center" prop="lineName" />
      <el-table-column label="配送员" min-width="100" align="center" prop="driverName" >
        <template slot-scope="scope">
          {{ scope.row.driverName || '无'}}
        </template>
      </el-table-column>
      <el-table-column label="门店数" min-width="100" align="center" prop="shopNum" />
      <el-table-column label="已送达门店数" min-width="100" align="center" prop="sentShopNum" />
      <el-table-column label="订单数" min-width="100" align="center" prop="orderNum" />
      <el-table-column label="里程数" min-width="100" align="center" prop="mileage" />
      <el-table-column label="重量" min-width="100" align="center" prop="weight" />
      <el-table-column label="费用" min-width="100" align="center" prop="totalMoney" />
      <el-table-column label="签到时间" min-width="100" align="center" prop="signTime" />
      <el-table-column label="取货时间" min-width="100" align="center" prop="takeTime" />
      <el-table-column label="完成时间" min-width="100" align="center" prop="finishTime" />
      <el-table-column label="状态" align="center" prop="status" min-width="100">
        <template slot-scope="scope">
          <dict-tag :options="dict.type.line_status" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200" fixed="right" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <div class="btn-group" style="height: 50px;">
            <el-button
              size="mini"
              type="text"
              icon="el-icon-position"
              v-if="scope.row.status === 0"
              @click="handleAssign(scope.row)"
            >
              指派
            </el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-check"
              v-if="scope.row.status !== 0 && scope.row.status !== 7"
              @click="handleTaskEnd(scope.row)"
            >
              结束
            </el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-s-marketing"
              @click="handleLineTracking(scope.row)"
            >
              线路追踪
            </el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['system:post:edit']"
            >修改</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-edit"
              v-if="[1,2,3,4].includes(scope.row.status)"
              @click="handleTransfer(scope.row)"
              v-hasPermi="['system:post:edit']"
            >转派</el-button>
            <el-button
              size="mini"
              type="text"
              icon="el-icon-delete"
              v-if="scope.row.status === 0"
              @click="handleDelete(scope.row)"
              v-hasPermi="['system:post:remove']"
            >删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <assign-user-modal
      title="任务指派"
      :visible.sync="assignUserVisible"
      :user-data="userData"
      @submit="assingSubmit"
    />
    <task-transfer-modal
      title="任务转派"
      :visible.sync="taskTranferVisible"
      @submit="transferSubmit"
    />
    <!-- <add-task-modal
      :visible.sync="addTaskVisible"
    /> -->
  </div>
</template>

<script>
  import { getLineList,getDriverList,assingLineTaskDes,deleteLine,lineEndTask,transferLineTask } from "@/api/setLineTask/index";
  import assignUserModal from "./components/assign-user-modal"
  import TaskTransferModal from './components/task-transfer-modal'
  import { getLineDetail } from "@/api/setLineTask/index";
  import QQMapWX from '@/utils/qqmap-wx-jssdk'
  import { mapGetters } from 'vuex'
  // import addTaskModal from "./components/add-task-modal";
  export default {
    name: "Post",
    components: {
      assignUserModal,
      TaskTransferModal
    },
    dicts: ['line_status'],
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 表格数据
        lineList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        assignUserVisible: false,
        // 转派是否显示弹出层
        taskTranferVisible: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          lineName: "",
          deliverName: "",
          status: "",
          dateRange: ""
        },
        // 表单参数
        form: {},
        // 用户列表
        userData: [],
        addTaskVisible: false,
        // 当前操作的任务id
        taskId: "",
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        qqMap: new QQMapWX({
          key: process.env.VUE_APP_QQ_MAP_KEY,
          vm: this
        })
      };
    },
    computed:{
      ...mapGetters(['organizingInfo'])
    },
    created() {
      this.getList();
      this.getDriverList()
    },
    methods: {
      /** 查询岗位列表 */
      async getList() {
        this.loading = true;
        try {
          this.queryParams.dateLimit = this.queryParams.dateRange ? this.queryParams.dateRange.join(',') : ''
          const { rows, total } = await getLineList(this.queryParams)
          this.lineList = rows;
          this.total = total;
          this.loading = false;
        } catch(e) {
          console.log(e)
        }
      },
      // 获取司机列表
      async getDriverList() {
        try {
          const { rows } = await getDriverList()
          this.userData = rows;
        } catch(e) {
          console.log(e)
        }
      },
      // 取消按钮
      cancel() {
        this.assignUserVisible = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          postId: undefined,
          postCode: undefined,
          postName: undefined,
          postSort: 0,
          status: "0",
          remark: undefined
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.postId)
        this.single = selection.length!=1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.$router.replace("addTask")
      // router.push('/setLineTask/addTask')
        //this.assignUserVisible = true;
        //this.title = "添加岗位";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.$router.replace({path:"addTask",query:{id: row.id }})
      },
      /** 转派按钮操作 */
      async handleTransfer({id}){
        this.taskTranferVisible = true
        this.taskId = id
      },
      /** 提交按钮 */
      submitForm() {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.postId != undefined) {
              updatePost(this.form).then(response => {
                this.$modal.msgSuccess("修改成功");
                this.assignUserVisible = false;
                this.getList();
              });
            } else {
              addPost(this.form).then(response => {
                this.$modal.msgSuccess("新增成功");
                this.assignUserVisible = false;
                this.getList();
              });
            }
          }
        });
      },
      // 指派人员
      async assingSubmit(row) {
        try {
          const params = {
            driverId: row.id,
            taskId: this.taskId,
          }
          await assingLineTaskDes(params)
          this.$modal.msgSuccess("指派成功");
          this.assignUserVisible = false;
          this.getList();
        } catch(e) {
          console.log(e)
        }
      },
      /** 删除按钮操作 */
      handleDelete({lineName,id}) {
        this.$modal.confirm('是否确认删除"' + lineName + '"的线路任务?').then(function() {
          return deleteLine({taskId: id});
        }).then(() => {
          this.getList();
          this.$modal.msgSuccess("删除成功");
        }).catch(() => {});
      },
      /** 指派按钮操作 */
      handleAssign(row) {
        this.assignUserVisible = true;
        this.taskId = row.id;
      },
      async handleTaskEnd({id}) {
        try {
          await this.$modal.confirm('是否确认结束任务?')
          await lineEndTask({taskId: id});
          this.getList();
          this.$modal.msgSuccess("结束成功");
        } catch(e) {
          console.log(e)
        }
      },
      // 线路追踪
      handleLineTracking(row) {
        this.$router.push({path:"lineTracking",query:{id: row.id }})
      },
      async transferSubmit(form) {
        try {
          // 请求详情以获取公里数
          const mileage = await this.getLineMileage()
          const data = {
            ...form,
            mileage,
            taskId: this.taskId,
          }
          await transferLineTask(data)
          this.taskTranferVisible = false
          this.getList();
          this.$modal.msgSuccess("转派成功");
        } catch(e) {
          console.log(e)
        }
      },
      // 获取公里数
      async getLineMileage() {
        try {
          const { latitude, longitude } = this.organizingInfo
          const { data:{pointList} } = await getLineDetail({taskId:this.taskId})
          const {
            [pointList.length - 1]: {latitude: toLatitude,longitude: toLongitude}
          } = pointList
          const notDeliveryShopList = pointList.slice(0, -1).reduce((acc, item) => {
            if (item.status !== 3) {
              acc.push(`${item.latitude},${item.longitude}`);
            }
            return acc;
          }, []).join(';')
          const {
            result: {routes:[{distance}]}
          }
          = await this.qqMap.direction({
            heading: 175,
            from: `${latitude},${longitude}`,
            to: `${toLatitude},${toLongitude}`,
            waypoints: notDeliveryShopList // 未配送门店经纬度列表
          })
          return Promise.resolve(distance)
        } catch(e) {
          return Promise.reject(e)
        }
      }
    }
  }
</script>
