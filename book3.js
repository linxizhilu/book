'use strict';

const http = require('http');
const mysql = require('mysql');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const async = require('async');


//定义mysql连接选项
const mysqlOpt = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'book'
};

const connection = mysql.createConnection(mysqlOpt);

//目录列表地址
var catelogURL = [];

//列表地址
var listURL = [];

listURL = Array.from({ length: 2 }, (v, k) => {
    return !k ? '/' : '/page/' + (k + 1) + '/';
});

//console.log(listURL);

//详情地址
var detailURL = [];


//从列表页获取详情页链接
var getDetailURL = (complete) => {

   // async.eachLimit(listURL, 10, function(item, callback) {
        var listOpt = {
            host: 'www1.w3cfuns.com',
            method: 'POST',
            path:'/feres.php?do=picture&listtype=book',
            headers: {
                'Referer': 'http://www1.w3cfuns.com/feres.php?do=picture&listtype=book',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36',
                'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With':'XMLHttpRequest'
            }
        };

        var postDATA='startNum=0&dataLen=250&type=ajax&randoms=0.6396354265846644';


        var _DATA = '';
        var req = http.request(listOpt, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                _DATA += chunk;
            });
            res.on('end', (res) => {
                //console.log(_DATA);
                var $ = cheerio.load(_DATA);
				//填充结果
               detailURL=JSON.parse(_DATA);
                console.log('列表页结束');
				 console.log(detailURL.length);
				
                //所有循环结束后调用callback
               complete();
            });
        });

        req.on('error', (e) => {
            console.log(`报错: ${e.message}`);
            //callback();
        });

        req.write(postDATA);

        //关闭http连接
        req.end();
		
		

};

//建立mysql连接
connection.connect();

//从详情页获取具体内容
var getDetailContents = (complete) => {

    //console.log(detailURL)

    async.eachLimit(detailURL, 10, function(item, callback) {
		console.log('详情页ing'+item);
        var detailOpt = {
            host: 'www1.w3cfuns.com',
            method: 'GET',
            headers: {
                'Referer': 'http://www1.w3cfuns.com/feres.php?do=picture&listtype=book',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36',
                'Content-Type':'application/x-www-form-urlencoded; charset=gbk'
            }
        };

        detailOpt.path = '/'+item.url;
		
		
		var cacheDATA=[];
		//缩略图
		var thumb=item.pic;
		//页面链接
		var url=item.url;
		
		

        var _DATA =[];
        var req = http.request(detailOpt, (res) => {
            res.setEncoding(null);
            res.on('data', (chunk) => {
                _DATA.push(chunk);
            });
            res.on('end', (res) => {
                console.log('详情页ing');
                var  gbkDATA=iconv.decode(_DATA,'gbk');
				var gbkBuff=new Buffer(gbkDATA,'binary')
                var  body=iconv.encode(gbkBuff,'utf-8');
                var $ = cheerio.load(body);
				
				var bookcover=$('#w3cfuns_ShareBook img').attr('src');
				var title=$('#w3cfuns_ShareBook td').eq(1).text().replace('书名：','');
				var format=$('#w3cfuns_ShareBook td').eq(2).text().replace('类型：','');
				var description=$('#w3cfuns_ShareBook td').eq(3).text().replace('简介：','');
				var download=$('.t_f a').eq(0).attr('href');


                console.log(description)
				
				
				//cacheDATA.push(title,description,format,thumb,bookcover,download,url);
				
				//storeData(cacheDATA,callback)
				
				
                console.log('一个详情页请求结束');
                //所有循环结束后调用callback
                callback();
            });
        });

        req.on('error', (e) => {
            console.log(`报错: ${e.message}`);
            callback();
        });

        //关闭http连接
        req.end();

    }, (err) => {
        if (err) {
            console.log('获取详情页内容发生了错误：', err);
            complete();
        } else {
            console.log('获取详情页内容结束');
            complete();
        }
    });
};

//getDetailURL();

var SQL='INSERT INTO `bookdetail` (title,description,format,thumb,bookcover,download,pageurl) VALUES (?,?,?,?,?,?,?)';

function storeData(DATA,storeCallback){
	//存储数据
	connection.query(SQL,DATA, (err, rows, fields) => {
		if (err) throw err;
		console.log('存储一条数据完成');
		storeCallback&&storeCallback();
	});
}

async.waterfall([getDetailURL, getDetailContents], function() {
    console.log('爬取结束！');
	connection.end();
});


//connection.end();
