// 用于转换天气中英文
const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast': '阴',
  'lightrain': '小雨',
  'heavyrain': '大雨',
  'snow': '雪'
}

//将天气转换为对应的导航栏颜色
const weatherColorMap = {
  'sunny': '#cbeefd',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

// 引入腾讯地图SDK
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""


Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground:'',
    hourlyWeather: [],
    todayTemp:'',
    todayDate:'',
    city:'未知城市',
    locationAuthType:UNPROMPTED,
    locationTipsText:UNPROMPTED_TIPS
  },

  // 每次启动时
  onLoad() {
    this.qqmapsdk = new QQMapWX({
      // key: 'OGVBZ-WPSLI-M6NGD-5BHYQ-CS4PE-KCBEG'
      key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
    })
    wx.getSetting({
      success:res=>{
        let auth = res.authSetting['scope.userLocation']
        this.setData({
            locationAuthType : auth ? AUTHORIZED : (auth===false) ? UNAUTHORIZED : UNPROMPTED,
            locationTipsText : auth ? AUTHORIZED_TIPS : (auth===false) ? UNAUTHORIZED_TIPS : UNPROMPTED_TIPS
        })
        if(auth)
          this.getCityAndWeather()
        else
          this.getNow()
      }
    })  
  },

  // 下拉刷新
  onPullDownRefresh() {

    // 调用封装好的getNow函数并传入停止下拉刷新用的参数函数
    this.getNow(() => {
      wx.stopPullDownRefresh()
    })

  },

  // 获取数据的封装
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data: {
        city: this.data.city
      },
      success: res => {
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result) 
        this.setToday(result)
      },

      // 用回调函数来判断是否停止下拉刷新
      complete: () => {

        // 当callback不为空的时候，执行callback函数
        callback && callback()
        
      }
    })
  },

  // 设置当前的天气
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBackground: "/images/" + weather + "-bg.png",
    })
    // 设置导航栏颜色随天气而变化
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather],
    })
  },

  // 设置未来24小时的天气
  setHourlyWeather(result){
    let forecast = result.forecast
    let hourlyWeather = []
    let nowHour = new Date().getHours()
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({ hourlyWeather })
  },
  // 设置当天的信息
  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}° - ${result.today.maxTemp}°`,
      todayDate: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} 今天`
    })
  },
  onTapDayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  onTapLocation(){
    this.getCityAndWeather()
  },
  getCityAndWeather(){
    wx.getLocation({
      success: res => {
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        //调用接口
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city:city,
              locationTipsText:''
            })
            this.getNow()
          }
        })
      },
      fail:()=>{
        this.setData({
          locationAuthType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})