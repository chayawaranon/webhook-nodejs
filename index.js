const express = require('express');
const app = express();
const diff = require('dialogflow-fulfillment');
const { response } = require('express');
const axios = require('axios');

Date.prototype.getWeek = function(x) {
    var onejan = new Date(this.getFullYear(), 0, 1);
    return `${this.getFullYear()}-${Math.ceil((((x - onejan) / 86400000) + onejan.getDay()+1)/7)}`;
};

app.get('/', (req, res) => {
    res.send("we are live")
});

app.post('/',express.json() ,(req,res) =>{
    const agent = new diff.WebhookClient({
        request: req,
        response: res
    });

    function topList(agent) {
        let get_date = agent.parameters.get_date;
        let temp = new Date;
        let day = new Date(`${temp.getFullYear()}-${get_date}`);  
        let result = {
            song: []
        };

        return axios.get(`https://sheetdb.io/api/v1/swyrcvta772ks?sheet=${day.getWeek(day)}`)
          .then( response => {
            for(let i = 1 ; i <= 5 ; i++) {
                result.song.push(`${i}. เพลง: ${response.data[i].song_list} ศิลปิน: ${response.data[i].artist}`);
            }
            //console.log(result);
            
            agent.add(`${result.song[0]} \n ${result.song[1]} \n ${result.song[2]} \n ${result.song[3]} \n ${result.song[4]} \n`);
        })
        .catch(err => {
            //agent.add("มีอะไรบางอย่างผิดพลาด กรุณาลองอีกครั้งค่ะ");
            agent.add(err);
        });
    }

    function searchSong(agent) {
        let song_name = req.body.queryResult.parameters.song_name;
        let get_date = agent.parameters.get_date;
        let temp = new Date;
        //console.log(get_date);
        let day = new Date(`${temp.getFullYear()}-${get_date}`);  
        let result = null;
        let count = 0;
        //console.log('weekyear = ' + weekNumber);

        return axios.get(`https://sheetdb.io/api/v1/swyrcvta772ks?sheet=${day.getWeek(day)}`)
          .then( response => {
            response.data.forEach(el => {
                count++;
                if(el.song_list.toLowerCase() == song_name.toLowerCase()) {
                    result = `เพลง "${el.song_list}" อยู่อันดับ ${count} ในวันที่ ${temp.getFullYear()}-${get_date} ค่ะ`;
                }
            });

            if(!result) {
                result = `ไม่พบเพลง "${song_name}" บน Chart ในวันที่ ${temp.getFullYear()}-${get_date} ค่ะ`;
            }

            agent.add(result);
        })
        .catch(err => {
            agent.add("มีอะไรบางอย่างผิดพลาด กรุณาลองอีกครั้งค่ะ");
        });
    }

    let intentMap = new Map();
    intentMap.set('search song - add date', searchSong);
    intentMap.set('top 10 song - date', topList);

    agent.handleRequest(intentMap);
});

app.listen(process.env.PORT || 3333, ()=> console.log("Live port 3333"));