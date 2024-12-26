<template>
  <el-dialog
    :title="title"
    width="460px"
    append-to-body
    :visible.sync="visible"
    :close-on-click-modal="false"
    @close="$emit('update:visible', false)"
  >
    <el-form :model="form" :rules="rules" ref="form" label-width="80px">
      <el-form-item label="转派原因" prop="transferReason">
        <el-select v-model="form.transferReason" style="width: 100%;" placeholder="请选择">
          <el-option
            v-for="item in dict.type.transfer_reason"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="情况说明" prop="remark" v-show="+form.transferReason === 4">
        <el-input type="textarea" maxlength="30" show-word-limit v-model="form.remark" style="width: 100%;" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="交接验货" prop="takeCheck">
        <el-radio v-model="form.takeCheck" :label="1">验货</el-radio>
        <el-radio v-model="form.takeCheck" :label="2">不验货</el-radio>
      </el-form-item>
      <el-form-item label="交接地点" prop="address">
        <el-input v-model="form.address" disabled style="width: 100%;" placeholder="请输入" />
      </el-form-item>
      <el-form-item label="转派人员" prop="driverId">
        <el-select v-model="form.driverId" style="width: 100%;" placeholder="请选择">
          <el-option
            v-for="item in driverList"
            :key="item.id"
            :label="item.realName"
            :value="item.id"
          >
            <!-- <div class="driverList">
              <div class="title">{{ item.realName }}</div>
              <div class="info">{{ item.id }}</div>
            </div> -->
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('update:visible', false)">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getDriverList } from "@/api/setLineTask/index";
  export default {
    name: 'TaskTransferModal',
    props: {
      title: {
        type: String,
        default: '转派任务'
      },
      visible: {
        type: Boolean,
        default: false
      }
    },
    dicts: ['transfer_reason'],
    data() {
      return {
        form: {
          takeCheck: 1,
          transferReason: '',
          driverId: '',
          address: this.$store.state.user.organizingInfo.address,
          transferReasonStr: '',
        },
        driverList: [],
        rules: {
          transferReason: [
            { required: true, message: '请选择转派原因', trigger: 'change' }
          ],
          driverId: [
            { required: true, message: '请选择转派人员', trigger: 'change' }
          ]
        },
      }
    },
    mounted() {
      this.getDriverList()
    },
    computed:{
      ...mapGetters(['organizingInfo']),
    },
    methods: {
      handleCancel() {
        this.visible = false
      },
      async getDriverList() {
        try {
          const { rows } = await getDriverList()
          this.driverList = rows;
        } catch(e) {
          console.log(e)
        }
      },
      submit() {
        this.$refs.form.validate(async valid => {
          if (valid) {
            const data = {
              ...this.form,
              warehouseId: this.organizingInfo.id,
              longitude: this.organizingInfo.longitude,
              latitude: this.organizingInfo.latitude
            }
            this.$emit('submit', data)
          }
        })
      }
    }
  }
</script>

<style lang="scss" scoped>
  .driverList {
    color: #333;
  }
</style>
