const Eris = require("eris");
const steem = require("steem");
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "baabebiboobu",
  database: "voter"
});
con.connect();
var bot = new Eris("NjA4NTg2OTgzMDE4ODU2NDY3.XUqWFg.6eMDJXcApJOvvuxh30AAy_3zU0k");
var regex = /(\$)+(upvote)+.+(https:\/\/)+.+(@)+.+(\/)/; 
var regex1 = /(@)+.+(\/)/;
var wifkey = '5JfF33x8pnFrkQ7jzhUnPjnzw8ri2c8hfcgifgo2HfwxPyLr2wB';
var votey = "snd";
var weight = 2000; // 10000 = 100%
var per = 43200; // 86400 seconds = 24hour 
bot.on("ready", () => {console.log('voter bot started! weight '+weight+' %');}); //when it is ready
bot.on("messageCreate", (msg) => { // when a message is created
    if(msg.content.match(regex)){
        var permlink= msg.content.replace(msg.content.match(regex)[0],"");
        var au = msg.content.match(regex1)[0];
        var aut = au.replace("@","");
        var author = aut.replace("/","");
        var channel = msg.channel.id;
        var uid = msg.author.id;

        var x = '0';
        con.query('SELECT EXISTS(SELECT * FROM `voter` WHERE `userid` = "'+uid+'")', function (error, results, fields) {
            for(i in results){
                for(j in results[i]){
                    x = results[i][j];
                    if(x == '1'){
                        var last;
                        con.query('SELECT `lastvote` FROM `voter` WHERE `userid`="'+uid+'"', function (error, results, fields) {
                            for(i in results){
                                for(j in results[i]){
                                    last = results[i][j];


                                }
                            }
                            var time = Math.floor(new Date().getTime() / 1000);
                                if((time - last) > per){
                                    con.query('UPDATE `voter` SET `lastvote`="'+time+'" WHERE `userid`="'+uid+'"', function (error, results, fields) {
                                        steem.broadcast.vote(wifkey,votey,author,permlink,weight,function(downerr, result){
                                            if(downerr){
                                                setTimeout(function(){bot.createMessage(channel,'Already Upvoted!');},1000);
                                                con.query('UPDATE `voter` SET `lastvote`="'+last+'" WHERE `userid`="'+uid+'"', function (error, results, fields) {
                                                });
                                            }
                                            if(result) {
                                                setTimeout(function(){bot.createMessage(channel,'Done! Your post has been upvoted by @snd');},1000);
                                            }
                                        });
                                    });
                                }else{
                                    var come = per - (time - last);
                                    setTimeout(function(){bot.createMessage(channel,'Sorry! Come back after '+come+' seconds.');},1000);
                                }
                        });


                    }else{
                        var time = Math.floor(new Date().getTime() / 1000);
                        con.query('INSERT INTO `voter`(`user`, `lastvote`, `userid`) VALUES ("'+author+'","'+time+'","'+uid+'")', function (error, results, fields) {
                            steem.broadcast.vote(wifkey,votey,author,permlink,weight,function(downerr, result){
                                if(downerr){
                                    setTimeout(function(){bot.createMessage(channel,'Already Upvoted!');},1000);
                                    con.query('UPDATE `voter` SET `lastvote`="10" WHERE `userid`="'+uid+'"', function (error, results, fields) {
                                    });
                                }
                                if(result) {
                                    setTimeout(function(){bot.createMessage(channel,'Done! Your post has been upvoted by @snd');},1000);
                                }
                            });
                        });
                    }
                }
            }
        });


    }
});
bot.connect(); 