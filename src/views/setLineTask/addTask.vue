<template>
  <div class="add-task-modal">
    <el-form :model="form"  label-width="80px">
      <el-row>
        <el-col :span="12">
          <el-form-item label="路线名称" >
            <el-input style="width: 300px;" v-model="form.lineName"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="配送时间" >
            <el-date-picker
              v-model="form.deliveryDate"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="yyyy-MM-dd HH:mm:ss"
            >
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="取货位置" >
            <!-- <el-select style="width: 300px;" v-model="form.warehouseId" placeholder="请选择">
              <el-option
                v-for="item in organizingList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select> -->
            <el-input style="width: 300px;" :value="organizingInfo.name" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="取货验货" >
            <el-radio v-model="form.takeCheck" :label="1">开启</el-radio>
            <el-radio v-model="form.takeCheck" :label="2">关闭</el-radio>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div class="table-container">
      <div class="table-header">
        待配送门店
        <el-row :gutter="10" class="mb8" style="margin-top: 20px;">
          <el-col :span="1.5">
            <el-button type="primary" icon="el-icon-s-marketing" size="small" @click="handlePlanToRoute">规划路线</el-button>
            <!-- <el-button type="primary" icon="el-icon-refresh" size="small" @click="handleRefresh">匹配订单</el-button> -->
          </el-col>
          <right-toolbar :search="false" @queryTable="getShopOrderList"></right-toolbar>
        </el-row>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        :span-method="objectSpanMethod"
        max-height="360"
        row-key="orderNo"
        ref="multipleTable"
        @selection-change="handleSelectionChange"
      >
        <el-table-column align="center" type="selection" width="55" ></el-table-column>
        <el-table-column align="center" prop="order" label="送货顺序" min-width="55">
          <template slot-scope="scope">
            <el-input v-model="scope.row.order" disabled type="number" min="1"></el-input>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="shopName" label="门店名称"></el-table-column>
        <el-table-column align="center" prop="realName" label="收货人"></el-table-column>
        <el-table-column align="center" prop="userPhone" label="收货人手机号码"></el-table-column>
        <el-table-column align="center" prop="userAddress" label="收货地址"></el-table-column>
        <el-table-column align="center" prop="orderNo" label="订单编号"></el-table-column>
        <el-table-column align="center" prop="orderStatus" label="订单状态">
          <template slot-scope="scope">
            <dict-tag :options="dict.type.order_status" :value="scope.row.orderStatus"/>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="payPrice" label="付款金额"></el-table-column>
        <el-table-column align="center" prop="orderTime" label="下单时间"></el-table-column>
        <el-table-column align="center" prop="storeNum" label="商品总数"></el-table-column>
        <el-table-column align="center" prop="cateNum" label="品类数"></el-table-column>
      </el-table>
    </div>
    <div class="road-map">
      <div class="table-header">
        线路图示
      </div>
      <div id="map-container"
        style="height: 480px;"
        v-loading="mapLoading"
        element-loading-text="规划路线中"
        element-loading-spinner="el-icon-loading">
      </div>
    </div>
    <div class="footer" v-if="lineStatus === 0">
      <el-button class="btn" type="primary" @click="submit">保存</el-button>
    </div>
  </div>
</template>

<script>
  import QQMapWX from '@/utils/qqmap-wx-jssdk.js'
  import { getCurrentLocation,polylineExtract } from '@/utils/index'
  import { getShopOrderList,addLineTask,getLineDetail } from '@/api/setLineTask'
  import { mapGetters } from 'vuex'
  //写在前面：TMap是腾讯地图的js库，需要先引入,map是地图实例，marker是标记点实例，polylineLayer是路线实例,infoWindowData是信息窗口的数据
  let map = null,
      marker = null,
      polylineLayer = null,
      infoWindowData = {};
  export default {
    name:"AddTask",
    data() {
      return {
        form: {
          lineName: '',
          deliveryDate: [],
          takeCheck: 1
        },
        tableData: [],
        qqMap: new QQMapWX({
					key: process.env.VUE_APP_QQ_MAP_KEY,
					vm: this
				}),
        multipleSelection: [],
        drivingData: [],
        // 地图遮罩层
        mapLoading: false,
        // table遮罩层
        loading: false,
        distanceData: [],
        id: '',
        lineStatus: 0
      }
    },
    dicts: ['order_status'],
    computed: {
      ...mapGetters(['organizingInfo','organizingList']),
      start() {
        return {
          id: 'start',
          styleId: 'start',
          position: new TMap.LatLng(this.organizingInfo.latitude, this.organizingInfo.longitude),
          properties: { shopId: 'start',shopName: '起点', userAddress: '',userPhone: '' }
        }
      }
    },
    watch: {
      async '$route'(to, from) {
        const infoList = Object.keys(infoWindowData)
        infoList.forEach(item => {
          infoWindowData[item].close()
        })
        infoWindowData = {}
        if(!to.query.id) {
          this.form = {
            lineName: '',
            deliveryDate: [],
            takeCheck: 1
          }
          polylineLayer = null
          this.tableData = []
          this.multipleSelection = []
          //map && marker.setMap(null)
        } else {
          this.id = to.query.id
          await this.getShopOrderList()
          await this.getLineDetail()
        }
        if(to.path === '/addTask') {
          this.updateMetaTitle()
        }
      }
    },
    async mounted() {
      map = null
      marker = null
      polylineLayer = null
      infoWindowData = {}
      this.updateMetaTitle()
      await this.initMap()
      await this.getShopOrderList()
      if(this.id){
        await this.getLineDetail()
      }
    },
    methods: {
      updateMetaTitle() {
        const { query:{id} } = this.$route
        this.$route.meta.title = `${id ? '编辑' : '新增'}线路任务`
        this.id = id
        this.$tab.updatePage(this.$route)
      },
      async getLineDetail() {
        try {
          const { data:{lineName, deliveryDate,planDeliveryDate, takeCheck, pointList,status} } = await getLineDetail({taskId:this.id})
          this.form = {
            lineName,
            deliveryDate: [deliveryDate || '',planDeliveryDate || ''],
            takeCheck,
          }
          this.lineStatus = status
          this.tableData = [...pointList,...this.tableData]
          await this.$nextTick()
          this.createInfoWindows([...pointList,...this.tableData])
          this.processArray(pointList).forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row);
          })
          // this.handlePlanToRoute()
        } catch(e) {
          console.log(e)
        }
      },
      async initMap() {
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
          this.createMultiMarker()
          this.createPolylineLayer()
        })
      },
      cancel() {
        this.$emit('update:visible', false)
        this.$emit('cancel')
      },
      async getShopOrderList() {
        this.loading = true;
        try {
          const { rows } = await getShopOrderList({orgId:this.organizingInfo.id})
          this.tableData = rows
          this.createInfoWindows(rows)
          this.loading = false;
        } catch(e){
          console.log(e)
        }
      },
      async submit() {
        if(!this.multipleSelection.every(item => item.order !== null)) {
          this.$message.warning('请先规划路线')
          return
        }
        console.log(this.form.deliveryDate)
        if(this.form.deliveryDate?.length === 0 || this.form.deliveryDate === null) {
          this.$message.warning('请选择配送日期')
          return
        }
        if(this.form.lineName === '') {
          this.$message.warning('请输入线路名称')
          return
        }
        const { lineName, deliveryDate, takeCheck } = this.form
        const { id:orgId, address,warehouseId } = this.organizingInfo
        const deliveryDateStr = deliveryDate.join(',')
        const points = this.multipleSelection.map(item => {
          return {
            ...item,
            orderNo: this.tableData.filter(cur => cur.shopId === item.shopId)
          }
        })
        const data = {
          lineName,
          deliveryDate: deliveryDateStr,
          warehouseId,
          takeCheck,
          points,
          orgId,
          address,
          mileage: this.drivingData[0]?.distance || 0
        }
        this.id && (data.taskId = this.id)
        try {
          await addLineTask(data)
          this.$message.successq(`${this.id ? '编辑' : '新增'}'成功`)
          this.$tab.closeOpenPage({path:'/setLineTask'})
        } catch(e) {
          console.log(e)
        }
      },
      // 合并单元格
      objectSpanMethod({ row, column, rowIndex, columnIndex }) {
        if (columnIndex < 6) {
          if (row.rowspan > 0) {
            return {
              rowspan: row.rowspan,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      },
      processArray(data) {
        const shopidSet = new Set(data.map(item => item.shopId))
        return Array.from(shopidSet).map(shopId => data.find(item => item.shopId === shopId))
      },
      handleSelectionChange(val) {
        const ids = val.map(item => item.shopId)
        const closeMarkerIds = this.multipleSelection.filter(item => !ids.includes(item.shopId)).map(item => item.shopId)
        for(let i = 0; i < closeMarkerIds.length;i++) {
          infoWindowData['infoWindow_' + closeMarkerIds[i]].close()
        }
        this.multipleSelection = val.length === this.tableData.length ? this.processArray(val) : val
        this.addMaker()
      },
      // 创建标注点style
      createMultiMarker() {
        marker = new TMap.MultiMarker({
          id: 'marker-layer',
          map,
          styles: {
            shop: new TMap.MarkerStyle({
              width: 48,
              height: 48,
              anchor: { x: 27, y: 45 },
              anchor: {
                x: 16,
                y: 48
              },
              src: require('@/assets/images/shop-icon.png')
            }),
            start: new TMap.MarkerStyle({
							width: 25,
							height: 35,
							anchor: {
								x: 16,
								y: 32
							},
							src: require('@/assets/images/start.png')
						})
          },
          geometries: [this.start]
        })
      },
      // 添加maker
      addMaker() {
        if (this.multipleSelection.length > 0) {
          console.log('addMaker')
          const geometries = this.multipleSelection.map(item => {
            const {shopId, shopName, userAddress, userPhone,latitude, longitude} = item
            infoWindowData['infoWindow_' + shopId].open()
            return {
              id: shopId,
              styleId: 'shop',
              position: new TMap.LatLng(latitude, longitude),
              properties: { shopId,shopName, userAddress,userPhone }
            }
          })
          console.log(marker,'marker')
          marker.setGeometries([...geometries,this.start])
        } else {
          marker.setGeometries([this.start])
        }
      },
      // 获取路线规划数据
      async getQqMapData() {
        const { latitude, longitude } = this.organizingInfo
        const {[this.multipleSelection.length -1]:{latitude: toLatitude,longitude: toLongitude}} = this.multipleSelection
				const waypoints = this.multipleSelection.slice(0, -1).map(item => `${item.latitude},${item.longitude}`).join(';')
        const {
					result: {
						routes
					}
				} = await this.qqMap.direction({
					from: `${latitude},${longitude}`, //起点经纬度', //起点经纬度
					to: `${toLatitude},${toLongitude}`, //终点经纬度
          heading: 175,
					get_speed: 1, //是否返回路线速度，0为否，1为是，默认为0
					waypoints //途径点经纬度，多个途径点用“;”分隔
				})
				this.drivingData = routes
			},
      //创建折线图
      createPolylineLayer() {
				polylineLayer = new TMap.MultiPolyline({
					id: 'polyline-layer', //图层唯一标识
					map, //设置折线图层显示到哪个地图实例中
					styles: {
						style_blue: new TMap.PolylineStyle({
							color: '#3777FF', //线填充色
							width: 6, //折线宽度
							borderWidth: 5, //边线宽度
							borderColor: '#FFF', //边线颜色
							lineCap: 'butt', //线端头方式
              showArrow: true,
              arrowOptions: {
                animSpeed: 12
              }
						})
					}
				})
			},
      async addPolylineLayer() {
        if (this.drivingData.length > 0) {
          const geometries = this.drivingData.map((item,index) => {
            return {
              id: `pl_${index}`,
              styleId: "style_blue",
              paths: polylineExtract(item.polyline)
            }
          })
          polylineLayer && polylineLayer.setGeometries(geometries)
        }
      },
      createInfoWindows(rows) {
        for(let i = 0; i < rows.length; i++) {
          const { latitude,longitude,shopName,shopId,rowspan,order = "" } = rows[i]
          if(!infoWindowData['infoWindow_' + shopId]) {
            infoWindowData['infoWindow_' + shopId] = new TMap.InfoWindow({
            map,
            position: new TMap.LatLng(latitude, longitude),
            enableCustom: true,
            offset: { x: 14, y: -48 }, //设置信息窗相对position偏移像素，为了使其显示在Marker的上方
            content: `<div class='info-window'>
              <div class='shop-num'>顺序：${order || ''}</div>
              <div class='shop-name'>门店：${shopName}</div>
              <div class="shop-order-num">订单数：${rowspan}</div>
            </div>`
            })
          }
          infoWindowData['infoWindow_' + shopId].close()  // 默认关闭信息窗
        }
			},
      removePolylineLayer() {
        polylineLayer && polylineLayer.setGeometries([])
      },
      async calculateDistance(){
        const { latitude, longitude } = this.organizingInfo
        const to = this.multipleSelection.map(item => `${item.latitude},${item.longitude}`).join(';')
        const {
          result:{ rows:[{elements}] }
        }
        = await this.qqMap.calculateDistance({
          mode: "driving",
          from: `${latitude},${longitude}`,
          to
        })
        elements.forEach((item,index) => {
          this.multipleSelection[index].distance = item.distance
          this.multipleSelection[index].duration = item.duration
        })
        this.multipleSelection = this.multipleSelection.sort((a,b) => a.distance - b.distance).map((item,index) => {
          this.tableData.find(cur => cur.shopId === item.shopId).order = index + 1
          return {...item,order: index + 1}
        })
      },
      async handlePlanToRoute() {
        if(this.multipleSelection.length === 0) {
          this.$message.error('请选择门店')
          return
        }
        this.mapLoading = true
        this.removePolylineLayer()
        try {
          await this.calculateDistance()
          await this.getQqMapData()
          await this.addPolylineLayer()
          await this.updateInfoWindows()
          this.$message.success('路线规划成功')
        } catch (error) {
          console.log(error)
          this.$message.error('路线规划失败')
        } finally{
          this.mapLoading = false
        }
      },
      async updateInfoWindows(){
        this.multipleSelection.forEach(item => {
          infoWindowData['infoWindow_' + item.shopId].setContent(`<div class='info-window'>
            <div class='shop-num'>顺序：${item.order}</div>
            <div class='shop-name'>门店：${item.shopName}</div>
            <div class="shop-order-num">订单数：${item.rowspan}</div>
          </div>`)
        })
      },
      // routerKm() {
      //   const distance = this.drivingData[0]?.distance / 1000 || 0
      //   return Math.trunc(distance * 10) / 10
      // },
      async handleRefresh() {
        // try {
        //   await this.getShopOrderList()
        //   this.$message.success('刷新成功')
        // } catch (error) {
        //   console.log(error)
        // }
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
    padding: 30px;
  }
  .footer {
    margin-top: 30px;
    text-align: center;
    .btn {
      width: 90px;
    }
  }
</style>
