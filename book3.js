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

var baseListURL='http://zhannei.baidu.com/cse/search?p=75&s=16881955614253274760&entry=1';

listURL = Array.from({ length: 75 }, (v, k) => {
    return '/cse/search?p='+k+'&s=16881955614253274760&entry=1';
});

//console.log(listURL);

//详情地址
var detailURL = [];


//从列表页获取详情页链接
var getDetailURL = (complete) => {

   async.eachLimit(listURL, 3, function(item, callback) {
	   
        var listOpt = {
            host: 'zhannei.baidu.com',
            method: 'GET',
            path:item,
            headers: {
                'Referer': 'http://www.pdfshu.org/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36'
            }
        };


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
              $('#results .c-title a').each(function(){
				detailURL.push($(this).attr('href'));
			  })
                console.log('列表页结束');
				//console.log(detailURL.length);
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
		
		
   },(err) => {
        if (err) {
            console.log('获取列表页内容发生了错误：', err);
            complete();
        } else {
            console.log('获取列表页内容结束');
            complete();
        }
    });
		

};

//建立mysql连接
connection.connect();

//从详情页获取具体内容
var getDetailContents = (complete) => {


    async.eachLimit(detailURL, 3, function(item, callback) {
		console.log('详情页ing'+item);
        var detailOpt = {
            host: 'www.pdfshu.org',
            method: 'GET',
            headers: {
                'Referer': 'http://www.pdfshu.org/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36'
            }
        };

        detailOpt.path = item.substr(21);
		
        var _DATA =[];
		
		var SQLData=[];
		
        var req = http.request(detailOpt, (res) => {
            //res.setEncoding(null);
            res.on('data', (chunk) => {
                _DATA.push(chunk);
            });
            res.on('end', (res) => {
                console.log('详情页ing');
				_DATA=_DATA.toString('utf-8');
               var $=cheerio.load(_DATA,{decodeEntities: false});
			   
			  //console.log(_DATA)
			   
			   var score=$('.vote-num').text().match(/(\d+)/g)[0];
			   var title=$('.oh td').eq(0).find('a').last().text();
			   var thumb=$('.oh td img').eq(0).attr('src');
			   var format='PDF';
			   var publicInfo=$('.oh tr').eq(2).find('td').html();
			   var description=$('.main .mt40').eq(1).find('div').html();
			   var catalog=$('.main .mt40').eq(2).find('div').html();
			   /*
			   console.log('score:-----------',score);
			   console.log('title:-----------',title);
			   console.log('thumb:-----------',thumb);
			   console.log('description:-----------',description);
			   console.log('catalog:-----------',catalog);
			   */
				SQLData.push(title,publicInfo,description,format,thumb,catalog,score,'http://www.pdfshu.org/');
			   

                console.log('一个详情页请求结束');
                //所有循环结束后调用callback
				
				storeData(SQLData,function(){
					 callback();
				})
               
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
            complete&&complete();
        } else {
            console.log('获取详情页内容结束');
            complete&&complete();
        }
    });
};


//getDetailURL();

var SQL='INSERT INTO `bookdetail` (title,publicInfo,description,format,thumb,catalog,score,source) VALUES (?,?,?,?,?,?,?,?)';

function storeData(DATA,storeCallback){
	//存储数据
	connection.query(SQL,DATA, (err, rows, fields) => {
		if (err){
			throw err;
		} else{
			console.log('存储一条数据完成');
			storeCallback&&storeCallback();
		}
		
	});
}


async.waterfall([getDetailURL, getDetailContents], function() {
    console.log('爬取结束！');
	connection.end();
});


