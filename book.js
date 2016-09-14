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

//详情地址
var detailURL = [];


var listOpt = {
    host: 'bestcbooks.com',
    path: '/',
    method: 'GET',
    headers: {
        'Referer': 'http://bestcbooks.com/categories/python/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2824.0 Safari/537.36'
    }
};



//获取列表页地址
var getListURL = () => {
    var _DATA = '';
    var req = http.request(listOpt, (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            _DATA += chunk;
            console.log('ing')
        });
        res.on('end', (res) => {
            console.log(_DATA);
            console.log('请求结束')
        });
    });

    req.on('error', (e) => {
        console.log(`报错: ${e.message}`);
    });


    req.end();
};

getListURL();


// //建立mysql连接
// connection.connect();

// connection.query('SELECT * from bookdetail', (err, rows, fields) => {
//     if (err) throw err;
//     console.log(rows);
// });

// connection.end();
