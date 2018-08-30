const dayMap = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']


Page({
  data: {
    weekWeather:[1,2,3,4,5,6,7]
  },
  onLoad(){
    this.getWeekWeather()
  },
  onPullDownRefresh(){
    this.getWeekWeather(()=>{
      wx.stopPullDownRefresh()
    })
  },
  getWeekWeather(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: '成都市',
        time: new Date().getTime()
      },
      success: res => {
        let result = res.data.result
        this.setWeekWeather(result)
      },
      complete: ()=>{
        callback && callback()
      }
    })  
  },
  // 设置未来七天天气数据
  setWeekWeather(result){
    let weekWeather = []
    for (let i = 0;i < 7;i++){
      let date = new Date()
      date.setDate(date.getDate() + i)
      weekWeather.push({
        day: dayMap[date.getDay()],
        date: `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`,
        temp: `${result[i].minTemp}° - ${result[i].maxTemp}°`,
        iconPath: '/images/' + result[i].weather + '-icon.png' 
      })
    }
    weekWeather[0].day = '今天'
    this.setData({weekWeather})
  }
})