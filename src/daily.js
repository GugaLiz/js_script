const https = require('https');
const axios = require('axios');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const moment = require('moment');

/**
 * 获取每日菜单
 * @returns {Promise<Array>}
 */
async function getMeatList() {
    let mealList = [];
    const url = 'https://zhweb.kingsoft.com/mealdistribution/index?typeId=IXyKKbEL';
    const options = {
        url,
        method:'GET',
        headers:{
            'Content-Type':'application/json;charset=UTF-8',
            'Cookie':'SESSION=ce40bd12-8cd6-4c6e-8dea-9e9b6bfc47f2',
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1301.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.5 WindowsWechat',
            'Connection':'keep-alive',
            'Accept':'application/json, text/plain, */*',
            'Origin':'https://zhweb.kingsoft.com',
            'Referer':'https://zhweb.kingsoft.com/p/md/',
            'Accept-Encoding':'gzip, deflate',
            'Accept-Language':'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.5;q=0.4'
        }
    };
    await axios(options).then(response => {
        // console.info(response);
        const {data} =response;
        // console.info(data.msg);
        if(data && data.success){
            const {data:mealData} = data;
            if(mealData){
                const building2 = mealData.building2Meal;
                mealList = building2['2#'];
                // console.info(mealList);
                // return mealList;
            }
        }
    }).catch(error=>{
        console.log(error)
    });
    return mealList;
}

/**
 * 是否订餐成功
 * @type {boolean}
 */
let isSuccess = false;

/**
 * 订餐
 * @returns {Promise<void>}
 */
async function orderQuery() {
    const mealList = await getMeatList();
    let lunch ='',dinner ='',isSuccess = false;
    if(mealList && mealList.length > 0){
        if(mealList[0]){
            lunch = mealList[0].mealList;
        }
        if (mealList[1]){
            dinner = mealList[1].mealList;
        }
    }
    let url = 'https://zhweb.kingsoft.com/mealdistribution/order';
    const options = {
        url,
        method:'POST',
        headers:{
            'Content-Type':'application/json;charset=UTF-8',
            'Cookie':'SESSION=ce40bd12-8cd6-4c6e-8dea-9e9b6bfc47f2',
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1301.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.5 WindowsWechat',
            'Connection':'keep-alive',
            'Accept':'application/json, text/plain, */*',
            'Origin':'https://zhweb.kingsoft.com',
            'Referer':'https://zhweb.kingsoft.com/p/md/',
            'Accept-Encoding':'gzip, deflate',
            'Accept-Language':'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.5;q=0.4'
        },
        data:{"typeId":"IXyKKbEL",
            "building":"2#",
            "company":"SEASON",
            "name":"刘丽",
            "orders":[
                {"selected":true,
                    "orderType":1,
                    "meal":lunch[0],
                    "orderStatus":"NONE",
                    "mealTimeType":"LUNCH"
                },
                {"selected":true,
                    "orderType":1,
                    "meal":dinner[0],
                    "orderStatus":"NONE",
                    "mealTimeType":"DINNER"}
            ]
        }

    };
    axios(options).then(response => {
        // console.info(response);
        const {data} =response;
        console.log(data.code === 1500);
        isSuccess = !!data.success;
        // console.info('订餐----'+data.msg,);
        // sendMail('订餐----'+data.msg);
        robotMsg('订餐----'+data.msg);
    }).catch(error=>{
        // console.log('订餐报错-----'+error);
        robotMsg('订餐报错----'+error);
    });
}

let isHoliday = false;
function momentTime() {
    moment.locale('zh-cn');
    const today = moment().format('dddd');
    if(today === '星期六' || today === '星期日'){
        isHoliday = true;
    }
}

/**
 * 健康申报
 */
function healthQuery() {
    momentTime();
    const currentDate = new Date().format("yyyy-MM-dd");
    let url = 'https://zhweb.kingsoft.com/ncov/health_report/submitDailyState';
    const options = {
        url,
        method:'POST',
        headers:{
            'Content-Type':'application/json;charset=UTF-8',
            'Cookie':'SESSION=ce40bd12-8cd6-4c6e-8dea-9e9b6bfc47f2',
            'User-Agent':'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.116 Safari/537.36 QBCore/4.0.1301.400 QQBrowser/9.0.2524.400 Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2875.116 Safari/537.36 NetType/WIFI MicroMessenger/7.0.5 WindowsWechat',
            'Connection':'keep-alive',
            'Accept':'application/json, text/plain, */*',
            'Origin':'https://zhweb.kingsoft.com',
            'Referer':'https://zhweb.kingsoft.com/p/hrep/',
            'Accept-Encoding':'gzip, deflate',
            'Accept-Language':'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.5;q=0.4'
        },
        data:{"id":123062,
            "reportUserId":567,
            "date":currentDate,
            "workType":isHoliday ? "在家" :"园区办公楼",
            "workTypeOther":"",
            "healthState":"无异常",
            "backLocation":1,
            "backLocationDate":"",
            "currentProvince":"",
            "currentCity":"",
            "currentDistrict":"",
            "fromProvince":"",
            "fromCity":"",
            "fromDistrict":"",
            "touch14":0,
            "qinshu14":-1,
            "healthStateList":["无异常"],
            "lastReportInfo": "珠海/园区办公楼/无14天接触史/无异常",
            "workTypeDetail":"园区办公楼",
            "currentLocation":"",
            "fromLocation":""}

    };
    axios(options).then(response => {
        const {data} =response;
       // if(data.success){
       //     console.log('健康申报-----'+data.msg);
       // }
        robotMsg('健康申报-----'+ data.msg +'isHoliday-----'+isHoliday);
        // sendMail('健康申报-----'+data.msg);
    }).catch(error=>{
        // console.log('健康申报-----'+error)
        robotMsg('健康申报-----'+ error +'isHoliday-----'+isHoliday);
    })
}

/**
 * 格式化时间
 * @param fmt
 * @returns {void | string}
 */
Date.prototype.format = function(fmt) {
    const o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(let k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
};

async function getSignToken(){
    let token = '';
    let url = 'https://api-xcx-qunsou.weiyoubot.cn/xcx/checkin/v4/login_new';
    const options = {
        url,
        method:'POST',
        headers:{
            'content-Type':'application/json',
            'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 MicroMessenger/7.0.9.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat',
            'Connection':'keep-alive',
            'Content-Length':'71',
            'Accept':'application/json',
            'Origin':'https://zhweb.kingsoft.com',
            'Referer':'https://servicewechat.com/wxee55405953922c86/385/page-frame.html',
            'Accept-Encoding':'gzip, deflate, br',
        },
        data:{"code":"081vtdJy1vtgad0GYgKy1MwjJy1vtdJV","user_data":{},"unionid":""}

    };
    await axios(options).then(response => {
        // console.info(response);
        const {data} =response;
        if(data.sta === 0){
            token = data.data.access_token;
        }
        console.info(data,'签到获取token----'+data.msg,);
    }).catch(error=>{
        console.log('签到报错-----'+error);
    });
    return token;
}

/**
 * 签到
 * @returns {Promise<void>}
 */
async function signQuery() {
    let token = await getSignToken();
    let url = 'https://api-xcx-qunsou.weiyoubot.cn/xcx/checkin/v3/doit';
    const options = {
        url,
        method:'POST',
        headers:{
            'content-Type':'application/json',
            'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/53.0.2785.143 Safari/537.36 MicroMessenger/7.0.9.501 NetType/WIFI MiniProgramEnv/Windows WindowsWechat',
            'Connection':'keep-alive',
            'Accept':'application/json, text/plain, */*',
            'Origin':'https://zhweb.kingsoft.com',
            'Referer':'https://servicewechat.com/wxee55405953922c86/385/page-frame.html',
            'Accept-Encoding':'gzip, deflate, br',
        },
        data:{"cid":"5e48ca31e9a69c03e35089f4",
            "longitude":0,
            "latitude":0,
            "access_token":token
        }

    };
    await axios(options).then(response => {
        // console.info(response);
        const {data} =response;
        console.info('签到----'+data.msg,);
    }).catch(error=>{
        console.log('签到报错-----'+error);
    });
}

// signQuery();

/**
 * 发送邮件
 * @param msg
 */
function sendMail(msg) {
    const transporter = nodemailer.createTransport({
        host:'smtp.163.com',
        // secureConnection:true,
        pool: true,
        secure: true,
        port:465,
        auth:{
            type: 'login',
            user:'wwdl12@163.com',
            pass:'BLSYIBSFDJPDHQSU',
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from:'wwdl12@163.com',
        to:'wwdl12@163.com',
        subject:msg,
        text:'这个不重要啦'

    };

    transporter.sendMail(mailOptions,function (error) {
        if(error){
            return console.log(error)
        }
    });

}

/**
 * 企业微信机器人通知
 * @param msg
 */
function robotMsg(msg) {
    const url = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=fd947fdf-ae3f-4f08-b144-a3c14e10caf1';
    axios.post(url,{
        "msgtype": "text",
        "text": {
            "content": msg
        }
    })

}


/**
 * 周一到周五9点,14点签到
 * @type {RecurrenceRule}
 */
// const ruleSign = new schedule.RecurrenceRule();
// ruleSign.dayOfWeek = [1,2,3,4,5];
// ruleSign.hour = [9,14];
// ruleSign.minute = 0;
// ruleSign.second = 0;
// let signJob = schedule.scheduleJob(ruleSign, async ()  =>{
//     signQuery();
// });


/**
 * 周一到周五10点订餐
 * @type {RecurrenceRule}
 */
// const rule1 = new schedule.RecurrenceRule();
// rule1.dayOfWeek = [1,2,3,4,5];
// rule1.hour = 10;
// rule1.minute = 0;
// rule1.second = 0;
// let orderJob = schedule.scheduleJob(rule1, async ()  =>{
//     let timer = setTimeout(async () => {
//         if(isSuccess){
//             clearTimeout(timer)
//         }else{
//             orderQuery();
//         }
//     });
// });
/**
 * 每日健康申报
 * @type {RecurrenceRule}
 */
const rule2 = new schedule.RecurrenceRule();
rule2.hour = 10;
rule2.minute = 0;
rule2.second = 0;
let requestJob = schedule.scheduleJob(rule2, async ()  =>{
    healthQuery();
});
