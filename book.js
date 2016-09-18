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

listURL = Array.from({ length: 40 }, (v, k) => {
    return !k ? '/' : '/page/' + (k + 1) + '/';
});

//console.log(listURL);

//详情地址
var detailURL = [];


//从列表页获取详情页链接
var getDetailURL = () => {

    async.eachLimit(listURL, 10, function(key, value) {
        var listOpt = {
            host: 'bestcbooks.com',
            method: 'GET',
            headers: {
                'Referer': 'http://bestcbooks.com/categories/python/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36'
            }
        };

        listURL.path = '/';
        console.log(listURL[key])

        /*
        var _DATA = '';
        var req = http.request(listOpt, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                _DATA += chunk;
            });
            res.on('end', (res) => {
                //console.log(_DATA);
                var $ = cheerio.load(_DATA);
                $('.entry-title a').each(function(key, value) {
                    //console.log($(this).attr('href'));
                    detailURL.push($(this).attr('href'));
                })

                console.log('请求结束')
            });
        });

        req.on('error', (e) => {
            console.log(`报错: ${e.message}`);
        });

        req.end();

        */

    }, (err) => {
        if (err) {
            console.log('发生了错误：', err);
        } else {
            console.log('循环结束');
        }
    });


};
//爬取详情页链接
getDetailURL();


//从详情页获取具体内容
var getDetail = () => {
    var _DATA = '';
    var req = http.request(detailOpt, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            _DATA += chunk;
        });
        res.on('end', (res) => {
            //console.log(_DATA);
            var $ = cheerio.load(_DATA);
            $('.entry-title a').each(function(key, value) {
                //console.log($(this).attr('href'));
                detailURL.push($(this).attr('href'));
            })

            console.log('请求结束')
        });
    });

    req.on('error', (e) => {
        console.log(`报错: ${e.message}`);
    });


    req.end();
};




// //建立mysql连接
// connection.connect();

// connection.query('SELECT * from bookdetail', (err, rows, fields) => {
//     if (err) throw err;
//     console.log(rows);
// });

// connection.end();
