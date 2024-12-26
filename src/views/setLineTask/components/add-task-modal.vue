<template>
  <el-dialog title="新增排线任务" :visible.sync="visible" width="70vw">
    <div class="add-task-modal">
      <el-form :model="form" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="路线名称" >
              <el-input style="width: 300px;"  v-model="form.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配送时间" >
              <el-date-picker
                v-model="form.dateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取货位置" >
              <el-select style="width: 300px;" v-model="form.region" placeholder="请选择">
                <option value="1">长沙总仓库</option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="取货验证" >
              <el-radio v-model="form.radio" label="1">开启</el-radio>
              <el-radio v-model="form.radio" label="2">关闭</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="table-container">
        <div class="table-header">
          待配送门店
        </div>
        <el-table :data="tableData">
          <el-table-column align="center" type="selection" width="55"></el-table-column>
          <el-table-column align="center" prop="name" label="送货顺序"></el-table-column>
          <el-table-column align="center" prop="name" label="门店名称"></el-table-column>
          <el-table-column align="center" prop="address" label="收货人"></el-table-column>
          <el-table-column align="center" prop="phone" label="收货人手机号码"></el-table-column>
          <el-table-column align="center" prop="status" label="收货地址"></el-table-column>
          <el-table-column align="center" prop="status" label="订单编号"></el-table-column>
          <el-table-column align="center" prop="status" label="订单状态"></el-table-column>
          <el-table-column align="center" prop="status" label="付款金额"></el-table-column>
          <el-table-column align="center" prop="status" label="下单时间"></el-table-column>
          <el-table-column align="center" prop="status" label="商品总数"></el-table-column>
          <el-table-column align="center" prop="status" label="品类数"></el-table-column>
        </el-table>
      </div>
      <div class="road-map">
        <div class="table-header">
          线路图示
        </div>
        <div id="map-container" style="height: 600px;">

        </div>
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import QQMapWX from '@/utils/qqmap-wx-jssdk.js'
  import { getCurrentLocation } from '@/utils/index'
  let map = null;
  export default {
    props: {
      visible:{
        type: Boolean,
        default: () => false
      },
      tableData: {
        type: Array,
        default: () => []
      }
    },
    data() {
      return {
        form: {
          name: '',
          dateRange: [],
          region: '',
          delivery: false,
          type: [],
          resource: '',
          radio: '1',
        },
        qqMap: new QQMapWX({
					key: process.env.VUE_APP_QQ_MAP_KEY,
					vm: this
				})
      }
    },
    async mounted() {
      const {result:{location}} = await getCurrentLocation()
			const center = new TMap.LatLng(location.lat, location.lng)
			this.$nextTick(async () => {
				map = new TMap.Map(document.getElementById('map-container'), {
					center, //设置地图中心点坐标
					zoom: 14.9, //设置地图缩放级别
					pitch: 43.5, //设置俯仰角
					rotation: 45, //设置地图旋转角度
					viewMode: '2D'
				});
				await this.getQqMapData()
				this.createPolylineLayer()
				this.createMultiMarker()
			})
    },
    methods: {
      cancel() {
        this.$emit('update:visible', false)
        this.$emit('cancel')
      },
      submit() {

      }
    }
  }
</script>

<style lang="scss" scoped>
  .table-header {
    font-weight: bold;
    color: #333;
    font-size: 18px;
    padding: 10px 0;
  }
  .add-task-modal {
    height: 600px;
    overflow: auto;
  }
</style>
