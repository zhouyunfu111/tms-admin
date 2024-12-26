<template>
  <el-dialog
    :visible="visible"
    title="选择销售组织"
    @close="handleClose"
    :width="device !== 'mobile' ? '500px' : '90%'"
    append-to-body
  >
    <div class="container">
      <el-form :model="form" label-width="100px">
        <el-form-item label="销售组织">
          <el-select style="width: 100%" v-model="form.orgId" placeholder="请选择">
            <el-option
              v-for="item in orgList"
              :key="item.id"
              :label="item.orgName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
  import { mapGetters } from 'vuex';
  export default {
    name: 'SelectOrganizing',
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      orgList: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        form: {
          orgId: this.$store.state.user.organizingInfo.id
        }
      }
    },
    computed: {
      ...mapGetters(['device']),
    },
    methods:{
      async handleSubmit() {
        const { orgId } = this.form
        if(!orgId){
          this.$message.error('请选择销售组织')
          return
        }
        const findItem = this.orgList.find(item => item.id === this.form.orgId)
        const values = {
          ...findItem,
          orgId,
          orgName: findItem.orgName
        }
        this.$store.dispatch('user/setOrgInfo', values)
        this.$emit('success',orgId)
        this.handleClose()
      },
      handleClose(){
        this.$emit('update:visible', false)
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
