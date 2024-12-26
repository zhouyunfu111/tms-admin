<template>
  <div class="lineTracking">
    <div class="line-info">
      <div class="line-info-title">路线信息</div>
      <div class="line-info-content">
        <div class="line-info-item">
          <div class="line-info-item-title">路线名称：{{ lineInfoData.lineName }}</div>
          <div class="line-info-item-content">配送日期：
            {{ lineInfoData.deliveryDate || '无' }}
            <span style="margin: 0 10px;">至</span>
            {{ lineInfoData.planDeliveryDate || '无' }}
          </div>
        </div>
      </div>
    </div>
    <div class="road-map">
      <div class="table-header">
        线路图示
      </div>
      <div id="map"
        style="height: 480px;"
        v-loading="mapLoading"
      >
      </div>
    </div>
  </div>
</template>

<script>
  import QQMapWX from '@/utils/qqmap-wx-jssdk.js'
  import { mapGetters } from 'vuex'
  import { lineTrace } from '@/api/setLineTask'
  import mapClass from '@/utils/mapUtils'
  export default {
    name: 'LineTracking',
    data() {
      return {
        mapLoading: false,
        mapData: [],
        qqMap: new QQMapWX({
					key: process.env.VUE_APP_QQ_MAP_KEY,
					vm: this
				}),
        lineInfoData:{},
        multipleSelection: [],
        mapUtils: null
      }
    },
    dicts: ['deliver_status'],
    computed:{
      ...mapGetters(['organizingInfo'])
    },
    async mounted() {
      await this.getLineTrace()
      this.mapUtils = new mapClass({
				multipleSelection: this.multipleSelection,
				startInfo: this.organizingInfo,
				qqMap: this.qqMap,
        dictType: this.dict.type.deliver_status
			})
      this.initDrawMap()
    },
    methods:{
      async initDrawMap(){
				this.mapUtils.initMap()
				this.mapUtils.createInfoWindows(this.multipleSelection)
				this.mapUtils.addMaker()
				await this.mapUtils.getQqMapData()
				this.mapUtils.addPolylineLayer()
			},
      async getLineTrace() {
        try {
          const { data, data:{ linePoints} } = await lineTrace({
            taskId: this.$route.query.id
          })
          this.lineInfoData = data
          this.multipleSelection = linePoints
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .lineTracking {
    height: 100vh;
    padding: 20px;
    .line-info {
      .line-info-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }
      .line-info-item {
        margin-bottom: 20px;
        .line-info-item-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .line-info-item-content {
          font-size: 14px;
          color: #666;
        }
      }
    }
  }
  .table-header {
    font-weight: bold;
    font-size: 18px;
    padding: 10px 0;
  }
</style>
