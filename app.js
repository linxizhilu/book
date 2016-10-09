'use strict';


const fs = require('fs');
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql');

const async = require('async');
const Redis = require('ioredis');

const redis = new Redis();


//创建应用
const app = express();
const router = express.Router();

app.listen(3000);

app.engine('.html', ejs.__express);
app.set('view engine', 'html');
//更换模板目录
//app.set('views', 'temp');


app.get('/', function(req, res) {
    res.render('index.html');

});

app.get('/list/:lid', function(req, res) {
    res.header('Content-Type:text/html; charset=utf-8');
    const ID = req.params.lid;
    const connection = mysql.createConnection(mysqlOpt);


    connection.connect();

    connection.query('SELECT publicInfo FROM bookdetail', (err, rows, fields) => {
        if (err) throw err;

        res.send('book list' + '<br>' + rows[ID].publicInfo);
    });
    connection.end();



});


app.get('/book/:bid', function(req, res) {

    const ID = req.params.bid;

    //连接mysql
    const connection = mysql.createConnection(mysqlOpt);
    connection.connect();

    connection.query('SELECT `title`,`publicInfo`,`description`,`catalog`,`thumb` FROM `bookdetail`', (err, rows, fields) => {

        if (err) throw err;
        res.header('Content-Type:text/html; charset=utf-8');
        res.send('<h1>' + rows[ID].title + '</h1><div><img src="http://www.pdfshu.org/' + rows[ID].thumb + '" /></div><p>' +
            rows[ID].description + '</p><div>' +
            rows[ID].publicInfo + '</div><div>' + rows[ID].catalog + '</div>');
        //关闭mysql连接
        connection.end();
    });



});




//定义mysql连接选项
const mysqlOpt = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'book'
};
