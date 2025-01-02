// mapUtils.js
import { polylineExtract } from "./index"
import { selectDictLabel } from "./ruoyi"
class mapUtils {
	constructor(options) {
		this.multipleSelection = options.multipleSelection;
		this.startInfo = options.startInfo;
		this.qqMap = options.qqMap;
		this.start = {
      id: 'start',
      styleId: 'start',
      position: new TMap.LatLng(options.startInfo.latitude, options.startInfo.longitude),
      properties: { shopId: 'start',shopName: '起点', userAddress: '',userPhone: '' }
    }
    this.dictType = options.dictType;
	}
	map = null;
	drivingData = [];
	marker = null;
	polylineLayer = null;
	infoWindowData = {};
	initMap() {
		const {
			latitude,
			longitude
		} = this.startInfo;
		const map = new TMap.Map(document.getElementById('map'), {
			center: new TMap.LatLng(latitude, longitude),
			zoom: 14.9, //设置地图缩放级别
			pitch: 43.5, //设置俯仰角
			rotation: 45, //设置地图旋转角度
			viewMode: '2D'
		});
		this.map = map;
		this.createMultiMarker()
		this.createPolylineLayer()
	}
	// 获取腾讯地图数据
	async getQqMapData() {
    console.log(this.startInfo.longitude, this.startInfo.latitude)
    const {
      latitude,
      longitude
    } = this.startInfo;
		const {
			[this.multipleSelection.length - 1]: {
				latitude: toLatitude,
				longitude: toLongitude
			}
		} = this.multipleSelection;
		const waypoints = this.multipleSelection.slice(0, -1).map(item => `${item.latitude},${item.longitude}`).join(
			';');
		const {
			result: {
				routes
			}
		} = await this.qqMap.direction({
			from: `${latitude},${longitude}`,
			to: `${toLatitude},${toLongitude}`,
			get_speed: 1,
			waypoints
		});
		this.drivingData = routes;
	}
	createMultiMarker() {
		this.marker = new TMap.MultiMarker({
			id: 'marker-layer',
			map: this.map,
			styles: {
				shop: new TMap.MarkerStyle({
					width: 48,
					height: 48,
					anchor: {
						x: 27,
						y: 45
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
	}
	// 获取腾讯地图数据
	createPolylineLayer() {
		const polylineLayer = new TMap.MultiPolyline({
			id: 'polyline-layer',
			map: this.map,
			styles: {
				style_blue: new TMap.PolylineStyle({
					color: '#3777FF',
					width: 6,
					borderWidth: 5,
					borderColor: '#FFF',
					lineCap: 'butt',
					showArrow: true,
					arrowOptions: {
						animSpeed: 12
					}
				})
			}
		});
		this.polylineLayer = polylineLayer
	}
	async addPolylineLayer() {
		if (this.drivingData.length > 0) {
			const geometries = this.drivingData.map((item, index) => ({
				id: `pl_${index}`,
				styleId: "style_blue",
				paths: polylineExtract(item.polyline)
			}));
			this.polylineLayer.setGeometries(geometries);
		}
	}
	createInfoWindows(rows) {
		rows.forEach(({latitude,longitude,shopName,shopId,orderNum,order,status}) => {
      const singleStatus = selectDictLabel(this.dictType, status)
			if (!this.infoWindowData['infoWindow_' + shopId]) {
				this.infoWindowData['infoWindow_' + shopId] = new TMap.InfoWindow({
					map: this.map,
					position: new TMap.LatLng(latitude, longitude),
					enableCustom: true,
					offset: {x: 8,y: -48},
					content: `<div class='info-window'>
            <div class='shop-status'>状态：${singleStatus}</div>
            <div class='shop-num'>顺序：${order}</div>
            <div class='shop-name'>门店：${shopName}</div>
            <div class="shop-order-num">订单数：${orderNum}</div>
          </div>`
				});
			}
			this.infoWindowData['infoWindow_' + shopId].close();
		});
	}
	removePolylineLayer() {
		this.polylineLayer.setGeometries([]);
	}
	async calculateDistance(tableData = []) {
		const {
			latitude,
			longitude
		} = this.startInfo
		const to = this.multipleSelection.map(item => `${item.latitude},${item.longitude}`).join(';');
		const {
			result: {
				rows: [{
					elements
				}]
			}
		} = await this.qqMap.calculateDistance({
			mode: "driving",
			from: `${latitude},${longitude}`,
			to
		});
		elements.forEach((item, index) => {
			this.multipleSelection[index].distance = item.distance;
			this.multipleSelection[index].duration = item.duration;
		});
		this.multipleSelection.sort((a, b) => a.distance - b.distance).map((item, index) => {
			tableData.find(cur => cur.shopId === item.shopId).order = index + 1
			return {
				...item,
				order: index + 1
			}
		});
	}
	async updateInfoWindows() {
		this.multipleSelection.forEach(item => {
			this.infoWindowData['infoWindow_' + item.shopId].setContent(`<div class='info-window'>
            <div class='shop-num'>顺序：${item.order}</div>
            <div class='shop-name'>门店：${item.shopName}</div>
            <div class="shop-order-num">订单数：${item.rowspan}</div>
          </div>`)
		})
	}
	addMaker() {
    console.log('addMaker')
		if (this.multipleSelection.length > 0) {
			const geometries = this.multipleSelection.map(item => {
				const {shopId, shopName, userAddress, userPhone,latitude, longitude} = item
				this.infoWindowData['infoWindow_' + shopId].open()
				return {
				  id: shopId,
				  styleId: 'shop',
				  position: new TMap.LatLng(latitude, longitude),
				  properties: { shopId,shopName, userAddress,userPhone }
				}
			})
			this.marker.setGeometries([...geometries,this.start])
		} else {
			this.marker.setGeometries([this.start])
		}
	}
}

export default mapUtils
