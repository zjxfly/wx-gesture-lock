//index.js

var Lock = require('../../lib/gesture_lock.js');

//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var s = this;
    this.lock = new Lock("id-gesture-lock", wx.createCanvasContext("id-gesture-lock"), function(checkPoints, isCancel) {
      console.log('over');
      s.lock.gestureError();
      setTimeout(function() {
        s.lock.reset();
      }, 1000);
    }, {width:300, height:300})
    this.lock.drawGestureLock();
    console.log('onLoad')
    var that = this
  	//调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
      that.update()
    })
  },
  onTouchStart: function (e) {
    this.lock.onTouchStart(e);
  },
  onTouchMove: function (e) {
    this.lock.onTouchMove(e);
  },
  onTouchEnd: function (e) {
    this.lock.onTouchEnd(e);
  }
})
