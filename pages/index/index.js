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

Page({
  data: {
    nowTemp: '',
    nowWeather: '',
    nowWeatherBackground:'',
  },

  // 每次启动时
  onLoad() {
    this.getNow()
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
        city: '成都市'
      },
      success: res => {
        let result = res.data.result
        let temp = result.now.temp
        let weather = result.now.weather
        console.log(temp, weather)
        this.setData({
          nowTemp: temp + '°',
          nowWeather: weatherMap[weather],
          nowWeatherBackground: "/images/" + weather + "-bg.png"
        })

        // 设置导航栏颜色随天气而变化
        wx.setNavigationBarColor({
          frontColor: '#000000',
          backgroundColor: weatherColorMap[weather],
        })
      },

      // 用回调函数来判断是否停止下拉刷新
      complete: () => {

        // 当callback不为空的时候，执行callback函数
        callback && callback()
        
      }
    })
  }
})