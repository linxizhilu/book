'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const mysql = require('mysql');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const async = require('async');
const request = require('request');

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
               
                console.log(_DATA);
                //所有循环结束后调用callback
               
            });
        });

        req.on('error', (e) => {
            console.log(`报错: ${e.message}`);
            callback();
        });

        req.write(postDATA);

        //关闭http连接
        req.end();


};

getDetailURL();

//从详情页获取具体内容
var getDetailContents = (complete) => {

    async.eachLimit(detailURL, 10, function(item, callback) {

        var detailOpt = {
            host: 'bestcbooks.com',
            method: 'GET',
            headers: {
                'Referer': 'http://bestcbooks.com/categories/python/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36'
            }
        };

        detailOpt.path = item;

        var _DATA = '';
        var req = http.request(detailOpt, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                _DATA += chunk;
            });
            res.on('end', (res) => {
                //console.log(_DATA);
                var $ = cheerio.load(_DATA);
                $('.entry-title').each(function(key, value) {
                    //console.log($(this).attr('href'));
                    //detailURL.push($(this).attr('href'));
                    console.log($(this).html())
                })

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

// async.waterfall([getDetailURL, getDetailContents], function() {
//     console.log('爬取结束！')
// });


// //建立mysql连接
connection.connect();

var title="这里是标题";

connection.query('INSERT INTO `bdetail` (btitle,decription,author,catalog,downloadURL) VALUES ("'+ title +'","这里是描述文字","我是作者","这里是目录","rsndm-6324")', (err, rows, fields) => {
    if (err) throw err;
    console.log(rows);
});

connection.end();
