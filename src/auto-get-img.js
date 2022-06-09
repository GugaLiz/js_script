const axios = require('axios');
const fs = require('fs');
const http = require('http');

fs.readdir('./', (err, files) => {  //创建本地文件夹
  if (!files.includes('saveImage')) {
    fs.mkdir('./card4', (err) => {
        if (err) {
          throw err;
        }
        console.log("已创建图片文件夹")
      }
    )
  }
});

const imgNum = 29;

for (let i = 1; i <= imgNum; i++) {
  let currentUrl = 'http://game.gtimg.cn/images/jx3/act/6260/a20210721wudu/card4/' + i + '.png';
  setTimeout(function () {
    http.get(currentUrl, function (res) {
      var imgData = "";
      res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
      res.on("data", function (chunk) { //这步是我百度来的。。。。
        imgData += chunk;
      });

      res.on("end", function () {
        fs.writeFile("./card4/" + i + '.png', imgData, "binary", function (err) {
          if (err) {
            console.log("down fail");
            return;
          }
          console.log("down success");
        });
      });
    });
  })
}



