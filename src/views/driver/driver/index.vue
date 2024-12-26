<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="手机号码" prop="phone">
        <el-input
          v-model="queryParams.phone"
          placeholder="请输入手机号码"
          clearable
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="姓名" prop="realName">
        <el-input
          v-model="queryParams.realName"
          placeholder="请输入姓名"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
          plain
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['driver:driver:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="driverList" @selection-change="handleSelectionChange">
      <el-table-column label="操作" min-width="150" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['driver:driver:edit']"
          >上线</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['driver:driver:edit']"
          >下线</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['driver:driver:edit']"
          >审核</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['driver:driver:edit']"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['driver:driver:remove']"
          >删除</el-button>
        </template>
      </el-table-column>
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="配送状态" align="center" prop="deliveryStatus" />
      <el-table-column label="姓名" align="center" prop="realName" />
      <el-table-column label="性别" align="center" prop="sex" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_user_sex" :value="scope.row.sex"/>
        </template>
      </el-table-column>
      <el-table-column label="年龄" align="center" prop="age" />
      <el-table-column label="驾驶证" align="center" prop="drivingModel" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.driving_model" :value="scope.row.drivingModel"/>
        </template>
      </el-table-column>
      <el-table-column label="车型" align="center" prop="vehicleType" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.vehicle_type" :value="scope.row.vehicleType"/>
        </template>
      </el-table-column>
      <el-table-column label="驾龄" align="center" prop="drivingAge" />
      <el-table-column label="备注" align="center" prop="mark" />
      <el-table-column label="接单次数" align="center" prop="taskNum" />
      <el-table-column label="准点次数" align="center" prop="onTimeNum" />
      <el-table-column label="准点率" align="center" prop="onTimeRate" >
        <template slot-scope="scope">{{scope.row.onTimeRate + '%' || ''}}</template>
      </el-table-column>
      <el-table-column label="服务好评率" align="center" prop="" />
      <el-table-column label="状态" align="center" prop="status" >
        <template slot-scope="scope">
          <dict-tag :options="dict.type.sys_normal_disable" :value="scope.row.status"/>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改司机基本信息对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入用户账号" />
        </el-form-item>
        <el-form-item label="用户密码" prop="pwd">
          <el-input v-model="form.pwd" placeholder="请输入用户密码" />
        </el-form-item>
        <el-form-item label="手机号码" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="用户头像" prop="avatar">
          <el-input v-model="form.avatar" placeholder="请输入用户头像" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="生日" prop="birthday">
          <el-input v-model="form.birthday" placeholder="请输入生日" />
        </el-form-item>
        <el-form-item label="民族" prop="nation">
          <el-input v-model="form.nation" placeholder="请输入民族" />
        </el-form-item>
        <el-form-item label="身份证正面" prop="cardFront">
          <el-input v-model="form.cardFront" placeholder="请输入身份证正面" />
        </el-form-item>
        <el-form-item label="身份证反面" prop="cardBack">
          <el-input v-model="form.cardBack" placeholder="请输入身份证反面" />
        </el-form-item>
        <el-form-item label="身份证号码" prop="cardId">
          <el-input v-model="form.cardId" placeholder="请输入身份证号码" />
        </el-form-item>
        <el-form-item label="身份证地址" prop="cardAddress">
          <el-input v-model="form.cardAddress" placeholder="请输入身份证地址" />
        </el-form-item>
        <el-form-item label="居住地址" prop="dwellAddress">
          <el-input v-model="form.dwellAddress" placeholder="请输入居住地址" />
        </el-form-item>
        <el-form-item label="用户备注" prop="mark">
          <el-input v-model="form.mark" placeholder="请输入用户备注" />
        </el-form-item>
        <el-form-item label="用户余额" prop="nowMoney">
          <el-input v-model="form.nowMoney" placeholder="请输入用户余额" />
        </el-form-item>
        <el-form-item label="签到次数" prop="signNum">
          <el-input v-model="form.signNum" placeholder="请输入签到次数" />
        </el-form-item>
        <el-form-item label="任务次数" prop="taskNum">
          <el-input v-model="form.taskNum" placeholder="请输入任务次数" />
        </el-form-item>
        <el-form-item label="准点次数" prop="onTimeNum">
          <el-input v-model="form.onTimeNum" placeholder="请输入准点次数" />
        </el-form-item>
        <el-form-item label="最后一次登录ip" prop="lastIp">
          <el-input v-model="form.lastIp" placeholder="请输入最后一次登录ip" />
        </el-form-item>
        <el-form-item label="最后一次登录时间" prop="lastLoginTime">
          <el-date-picker clearable
            v-model="form.lastLoginTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择最后一次登录时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="审核人" prop="auditor">
          <el-input v-model="form.auditor" placeholder="请输入审核人" />
        </el-form-item>
        <el-form-item label="审核时间" prop="auditTime">
          <el-date-picker clearable
            v-model="form.auditTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择审核时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="驳回原因" prop="rejectReason">
          <el-input v-model="form.rejectReason" placeholder="请输入驳回原因" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listDriver, getDriver, delDriver, addDriver, updateDriver } from "@/api/driver/driver";

export default {
  name: "Driver",
  dicts: ['sys_normal_disable','sys_user_sex','driving_model','vehicle_type'],
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
      // 司机基本信息表格数据
      driverList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        account: null,
        pwd: null,
        phone: null,
        avatar: null,
        realName: null,
        sex: null,
        birthday: null,
        nation: null,
        cardFront: null,
        cardBack: null,
        cardId: null,
        cardAddress: null,
        dwellAddress: null,
        mark: null,
        nowMoney: null,
        signNum: null,
        taskNum: null,
        onTimeNum: null,
        lastIp: null,
        lastLoginTime: null,
        deliveryStatus: null,
        status: null,
        auditor: null,
        auditTime: null,
        rejectReason: null
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        account: [
          { required: true, message: "用户账号不能为空", trigger: "blur" }
        ],
        createTime: [
          { required: true, message: "创建时间不能为空", trigger: "blur" }
        ],
        updateTime: [
          { required: true, message: "更新时间不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询司机基本信息列表 */
    getList() {
      this.loading = true;
      listDriver(this.queryParams).then(response => {
        this.driverList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        uid: null,
        account: null,
        pwd: null,
        phone: null,
        avatar: null,
        realName: null,
        sex: null,
        birthday: null,
        nation: null,
        cardFront: null,
        cardBack: null,
        cardId: null,
        cardAddress: null,
        dwellAddress: null,
        mark: null,
        nowMoney: null,
        signNum: null,
        taskNum: null,
        onTimeNum: null,
        createTime: null,
        updateTime: null,
        lastIp: null,
        lastLoginTime: null,
        deliveryStatus: null,
        status: null,
        auditor: null,
        auditTime: null,
        rejectReason: null
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
      this.ids = selection.map(item => item.uid)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加司机基本信息";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const uid = row.uid || this.ids
      getDriver(uid).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改司机基本信息";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.uid != null) {
            updateDriver(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addDriver(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const uids = row.uid || this.ids;
      this.$modal.confirm('是否确认删除司机基本信息编号为"' + uids + '"的数据项？').then(function() {
        return delDriver(uids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('driver/driver/export', {
        ...this.queryParams
      }, `driver_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
